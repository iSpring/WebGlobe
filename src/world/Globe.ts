import Kernel = require("./Kernel");
import Utils = require("./Utils");
import LocationService, { LocationData } from "./LocationService";
import Renderer = require("./Renderer");
import Camera, { CameraCore } from "./Camera";
import Scene = require("./Scene");
import ImageUtils = require("./Image");
import EventHandler = require("./EventHandler");
import TiledLayer = require("./layers/TiledLayer");
import { GoogleTiledLayer, GoogleLabelLayer } from "./layers/Google";
import { AutonaviTiledLayer, AutonaviLabelLayer } from "./layers/Autonavi";
import LabelLayer from "./layers/LabelLayer";
import TrafficLayer from "./layers/TrafficLayer";
import { QihuTrafficLayer } from "./layers/Qihu";
import Atmosphere = require("./graphics/Atmosphere");
import PoiLayer = require("./layers/PoiLayer");

const initLevel:number = Utils.isMobile() ? 11 : 3;

const initLonlat:number[] = [116.3975, 39.9085];

type RenderCallback = () => void;

export class GlobeOptions{
  satellite: boolean = true;
  level: number = initLevel;
  lonlat: number[] = initLonlat;
}

export class Globe {
  renderer: Renderer = null;
  scene: Scene = null;
  camera: Camera = null;
  tiledLayer: TiledLayer = null;
  labelLayer: LabelLayer = null;
  trafficLayer: TrafficLayer = null;
  poiLayer: PoiLayer = null;
  debugStopRefreshTiles: boolean = false;
  private readonly REFRESH_INTERVAL: number = 150; //Globe自动刷新时间间隔，以毫秒为单位
  private lastRefreshTimestamp: number = -1;
  private lastRefreshCameraCore: CameraCore = null;
  private eventHandler: EventHandler = null;
  private allRefreshCount: number = 0;
  private realRefreshCount: number = 0;
  private beforeRenderCallbacks: RenderCallback[] = [];
  private afterRenderCallbacks: RenderCallback[] = [];

  constructor(private canvas: HTMLCanvasElement, options?: GlobeOptions) {
    Kernel.globe = this;
    Kernel.canvas = canvas;
    if(!options){
      options = new GlobeOptions();
    }
    if(!(options.level >= Kernel.MIN_LEVEL && options.level <= Kernel.MAX_LEVEL)){
      options.level = initLevel;
    }
    if(!options.lonlat){
      options.lonlat = initLonlat;
    }
    this.renderer = new Renderer(canvas, this._onBeforeRender.bind(this), this._onAfterRender.bind(this));
    this.scene = new Scene();
    var radio = canvas.width / canvas.height;
    this.camera = new Camera(30, radio, 1, Kernel.EARTH_RADIUS * 2, options.level, options.lonlat);
    this.renderer.setScene(this.scene);
    this.renderer.setCamera(this.camera);

    if(options.satellite){
      this.setTiledLayer(new GoogleTiledLayer("Satellite"));
      this.labelLayer = new AutonaviLabelLayer();
      // this.labelLayer = new GoogleLabelLayer();
      this.scene.add(this.labelLayer);
    }else{
      this.setTiledLayer(new AutonaviTiledLayer());
    }
    
    // this.trafficLayer = new QihuTrafficLayer();
    // this.trafficLayer.visible = false;
    // this.scene.add(this.trafficLayer);
    var atmosphere = Atmosphere.getInstance();
    this.scene.add(atmosphere);
    this.poiLayer = PoiLayer.getInstance();
    this.scene.add(this.poiLayer);

    this.renderer.setIfAutoRefresh(true);
    this.eventHandler = new EventHandler(canvas);

    // if(Utils.isMobile() && window.navigator.geolocation){
    //   window.navigator.geolocation.getCurrentPosition((position: Position) => {
    //     // var str = `accuracy:${position.coords.accuracy},heading:${position.coords.heading},speed:${position.coords.speed}`;
    //     // alert(str);
    //     var lon = position.coords.longitude;
    //     var lat = position.coords.latitude;
    //     this.showLocation(lon, lat);
    //   });
    // }

    Utils.subscribe('location', (data: LocationData) => {
      console.info(data);
      this.afterRenderCallbacks.push(() => {
        this.showLocation(data);
      });
    });
    LocationService.getRobustLocation();
    LocationService.getLocation();
    // LocationService.watchPosition();
  }

  private showLocation(locationData: LocationData) {
    var lon = locationData.lng;
    var lat = locationData.lat;
    // this.poiLayer.clear();
    // this.poiLayer.addPoi(lon, lat, "", "", "", "");
    this.eventHandler.moveLonLatToCanvas(lon, lat, this.canvas.width / 2, this.canvas.height / 2);
    var accuracy = locationData.accuracy;
    var level: number = 8;
    if (accuracy <= 100) {
      level = 16;
    } else if (accuracy <= 1000) {
      level = 13;
    } else {
      level = 11;
    }
    this.setLevel(level);
  }

  private setTiledLayer(tiledLayer: TiledLayer) {
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

  showLabelLayer() {
    if (this.labelLayer) {
      this.labelLayer.visible = true;
    }
  }

  hideLabelLayer() {
    if (this.labelLayer) {
      this.labelLayer.visible = false;
    }
  }

  showTrafficLayer() {
    if (this.trafficLayer) {
      this.trafficLayer.visible = true;
    }
  }

  hideTrafficLayer() {
    if (this.trafficLayer) {
      this.trafficLayer.visible = false;
    }
  }

  getLevel() {
    return this.camera.getLevel();
  }

  zoomIn() {
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

  animateToLevel(level: number, cb?: () => void) {
    if (!this.isAnimating()) {
      if (level < Kernel.MIN_LEVEL) {
        level = Kernel.MIN_LEVEL;
      }
      if (level > Kernel.MAX_LEVEL) {
        level = Kernel.MAX_LEVEL;
      }
      if (level !== this.getLevel()) {
        this.camera.animateToLevel(level, cb);
      }
    }
  }

  animateOut(cb?: () => void) {
    this.animateToLevel(this.getLevel() - 1, cb);
  }

  animateIn(cb?: () => void) {
    this.animateToLevel(this.getLevel() + 1, cb);
  }

  private _onBeforeRender(renderer: Renderer) {
    // this.beforeRenderCallbacks.forEach((callback) => callback());
    this.refresh();
  }

  private _onAfterRender(render: Renderer) {
    this.afterRenderCallbacks.forEach((callback) => callback());
    this.afterRenderCallbacks = [];
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

  logRefreshInfo() {
    console.log(this.realRefreshCount, this.allRefreshCount, this.realRefreshCount / this.allRefreshCount);
  }

  refresh(force: boolean = false) {
    this.allRefreshCount++;
    var timestamp = Date.now();

    //先更新camera中的各种矩阵
    this.camera.update(force);

    if (!this.tiledLayer || !this.scene || !this.camera) {
      return;
    }

    if (this.debugStopRefreshTiles) {
      return;
    }

    var newCameraCore = this.camera.getCameraCore();
    // var isNeedRefresh = force || !newCameraCore.equals(this.cameraCore);
    var isNeedRefresh = false;
    if (force) {
      isNeedRefresh = true;
    } else {
      if (newCameraCore.equals(this.lastRefreshCameraCore)) {
        isNeedRefresh = false;
      } else {
        isNeedRefresh = timestamp - this.lastRefreshTimestamp >= this.REFRESH_INTERVAL;
      }
    }

    this.tiledLayer.updateSubLayerCount();

    if (isNeedRefresh) {
      this.realRefreshCount++;
      this.lastRefreshTimestamp = timestamp;
      this.lastRefreshCameraCore = newCameraCore;
      this.tiledLayer.refresh();
    }

    this.tiledLayer.updateTileVisibility();

    var a = !!(this.labelLayer && this.labelLayer.visible);
    var b = !!(this.trafficLayer && this.trafficLayer.visible);
    if (a || b) {
      var lastLevelTileGrids = this.tiledLayer.getLastLevelVisibleTileGrids();
      if (a) {
        this.labelLayer.updateTiles(this.getLevel(), lastLevelTileGrids);
      }
      if (b) {
        this.trafficLayer.updateTiles(this.getLevel(), lastLevelTileGrids);
      }
    }
  }

  getExtents(level?: number) {
    return this.tiledLayer.getExtents(level);
  }

};