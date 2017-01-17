import Kernel = require("./Kernel");
import Utils = require("./Utils");
import Renderer = require("./Renderer");
import Camera, { CameraCore } from "./Camera";
import Scene = require("./Scene");
import ImageUtils = require("./Image");
import EventHandler = require("./EventHandler");
import TiledLayer = require("./layers/TiledLayer");
import GoogleTiledLayer = require("./layers/GoogleTiledLayer");
import LabelLayer from "./layers/LabelLayer";
import AutonaviLabelLayer from "./layers/AutonaviLabelLayer";
import TrafficLayer from "./layers/TrafficLayer";
import SosoTrafficLayer from "./layers/SosoTrafficLayer";
import QihuTrafficLayer from "./layers/QihuTrafficLayer";
import Atmosphere = require("./graphics/Atmosphere");
import PoiLayer = require("./layers/PoiLayer");

class Globe {
  private readonly REFRESH_INTERVAL: number = 150; //Globe自动刷新时间间隔，以毫秒为单位
  private lastRefreshTimestamp: number = -1;
  renderer: Renderer = null;
  scene: Scene = null;
  camera: Camera = null;
  tiledLayer: TiledLayer = null;
  labelLayer: LabelLayer = null;
  trafficLayer: TrafficLayer = null;
  poiLayer: PoiLayer = null;
  private lastRefreshCameraCore: CameraCore = null;
  private eventHandler: EventHandler = null;
  private allRefreshCount:number = 0;
  private realRefreshCount:number = 0;

  constructor(canvas: HTMLCanvasElement, lonlat: number[] = [116.3975, 39.9085]) {
    Kernel.globe = this;
    this.renderer = new Renderer(canvas, this._onBeforeRender.bind(this));
    this.scene = new Scene();
    var radio = canvas.width / canvas.height;
    this.camera = new Camera(30, radio, 1, Kernel.EARTH_RADIUS * 2, lonlat);
    this.renderer.setScene(this.scene);
    this.renderer.setCamera(this.camera);
    this.setLevel(0);

    this.labelLayer = new AutonaviLabelLayer();
    this.scene.add(this.labelLayer);
    this.trafficLayer = new QihuTrafficLayer();
    this.trafficLayer.visible = false;
    // this.trafficLayer = new SosoTrafficLayer();
    this.scene.add(this.trafficLayer);
    var atmosphere = Atmosphere.getInstance();
    this.scene.add(atmosphere);
    this.poiLayer = PoiLayer.getInstance();
    this.scene.add(this.poiLayer);

    this.renderer.setIfAutoRefresh(true);
    this.eventHandler = new EventHandler(canvas);

    var tiledLayer = new GoogleTiledLayer("Satellite");
    this.setTiledLayer(tiledLayer);
    // this._tick();
  }

  setTiledLayer(tiledLayer: TiledLayer) {
    // clearTimeout(this.idTimeOut);
    //在更换切片图层的类型时清空缓存的图片
    ImageUtils.clear();
    if (this.tiledLayer) {
      var b = this.scene.remove(this.tiledLayer);
      if (!b) {
        console.error("this.scene.remove(this.tiledLayer)失败");
      }
      this.scene.tiledLayer = null;
    }
    this.tiledLayer = tiledLayer;
    this.scene.add(this.tiledLayer, true);
    this.refresh(true);
  }

  showLabelLayer(){
    if(this.labelLayer){
      this.labelLayer.visible = true;
    }
  }

  hideLabelLayer(){
    if(this.labelLayer){
      this.labelLayer.visible = false;
    }
  }

  showTrafficLayer(){
    if(this.trafficLayer){
      this.trafficLayer.visible = true;
    }
  }

  hideTrafficLayer(){
    if(this.trafficLayer){
      this.trafficLayer.visible = false;
    }
  }

  getLevel() {
    return this.camera ? this.camera.getLevel() : -1;
  }

  getLastLevel(){
    var currentLevel = this.getLevel();
    return currentLevel >= 0 ? (currentLevel + Kernel.DELTA_LEVEL_BETWEEN_LAST_LEVEL_AND_CURRENT_LEVEL) : -1;
  }

  zoomIn(){
    this.setLevel(this.getLevel() + 1);
  }

  setLevel(level: number) {
    if (this.camera) {
      this.camera.setLevel(level);
    }
  }

  isAnimating(): boolean {
    return this.camera.isAnimating();
  }

  animateToLevel(level: number, cb?: ()=>void) {
    if (!this.isAnimating()) {
      level = level > Kernel.MAX_LEVEL ? Kernel.MAX_LEVEL : level;
      if (level !== this.getLevel()) {
        this.camera.animateToLevel(level, cb);
      }
    }
  }

  animateOut(cb?: ()=>void){
    this.animateToLevel(this.getLevel() - 1, cb);
  }

  animateIn(cb?: ()=>void){
    this.animateToLevel(this.getLevel() + 1, cb);
  }

  private _onBeforeRender(renderer: Renderer){
    this.refresh();
  }

  // private _tick() {
  //   try {
  //     //如果refresh方法出现异常而且没有捕捉，那么就会导致无法继续设置setTimeout，从而无法进一步更新切片
  //     this.refresh();
  //   } catch (e) {
  //     console.error(e);
  //   }
  //   setTimeout(() => {
  //     this._tick();
  //   }, this.REFRESH_INTERVAL);
  // }

  logRefreshInfo(){
    console.log(this.realRefreshCount, this.allRefreshCount, this.realRefreshCount / this.allRefreshCount);
  }

  refresh(force: boolean = false) {
    if (!this.tiledLayer || !this.scene || !this.camera) {
      return;
    }
    this.allRefreshCount++;
    var timestamp = Date.now();
    //先更新camera中的各种矩阵
    this.camera.update(force);
    var newCameraCore = this.camera.getCameraCore();
    // var isNeedRefresh = force || !newCameraCore.equals(this.cameraCore);
    var isNeedRefresh = false;
    if(force){
      isNeedRefresh = true;
    }else{
      if(newCameraCore.equals(this.lastRefreshCameraCore)){
        isNeedRefresh = false;
      }else{
        isNeedRefresh = timestamp - this.lastRefreshTimestamp >= this.REFRESH_INTERVAL;
      }
    }

    if (isNeedRefresh) {
      this.realRefreshCount++;
      this.lastRefreshTimestamp = timestamp;
      this.lastRefreshCameraCore = newCameraCore;
      this.tiledLayer.refresh();
    }

    this.tiledLayer.updateTileVisibility();

    var a = !!(this.labelLayer && this.labelLayer.visible);
    var b = !!(this.trafficLayer && this.trafficLayer.visible);
    if(a || b){
      var lastLevelTileGrids = this.tiledLayer.getLastLevelVisibleTileGrids();
      if(a){
        this.labelLayer.updateTiles(this.getLastLevel(), lastLevelTileGrids);
      }
      if(b){
        this.trafficLayer.updateTiles(this.getLastLevel(), lastLevelTileGrids);
      }
    }
  }

  getExtents(level?: number){
    return this.tiledLayer.getExtents(level);
  }

}

export = Globe;