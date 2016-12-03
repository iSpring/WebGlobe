///<amd-module name="world/Globe"/>
import Kernel = require("./Kernel");
import Utils = require("./Utils");
import Renderer = require("./Renderer");
import Camera, { CameraCore } from "./Camera";
import Scene = require("./Scene");
import TiledLayer = require("./layers/TiledLayer");
import SubTiledLayer = require("./layers/SubTiledLayer");
import Tile = require("./graphics/Tile");
import ImageUtils = require("./Image");
import EventUtils = require("./Event");

class Globe {
  private readonly REFRESH_INTERVAL: number = 100; //Globe自动刷新时间间隔，以毫秒为单位
  // private idTimeOut: number = -1; //refresh自定刷新的timeOut的handle
  renderer: Renderer = null;
  scene: Scene = null;
  camera: Camera = null;
  tiledLayer: TiledLayer = null;
  private cameraCore: CameraCore = null;

  constructor(canvas: HTMLCanvasElement) {
    Kernel.globe = this;
    this.renderer = Kernel.renderer = new Renderer(canvas);
    this.scene = new Scene();
    var radio = canvas.width / canvas.height;
    this.camera = new Camera(30, radio, 1, Kernel.EARTH_RADIUS * 3);
    this.renderer.setScene(this.scene);
    this.renderer.setCamera(this.camera);
    this.setLevel(0);
    this.renderer.setIfAutoRefresh(true);
    EventUtils.initLayout();
    this._tick();
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

    //添加第0级的子图层
    var subLayer0 = new SubTiledLayer(0);
    this.tiledLayer.add(subLayer0);

    //要对level为1的图层进行特殊处理，在创建level为1时就创建其中的全部的四个tile
    var subLayer1 = new SubTiledLayer(1);
    this.tiledLayer.add(subLayer1);
    Kernel.canvas.style.cursor = "wait";
    for (var m = 0; m <= 1; m++) {
      for (var n = 0; n <= 1; n++) {
        var args = {
          level: 1,
          row: m,
          column: n,
          url: ""
        };
        args.url = this.tiledLayer.getTileUrl(args.level, args.row, args.column);
        var tile = Tile.getInstance(args.level, args.row, args.column, args.url);
        subLayer1.add(tile);
      }
    }
    Kernel.canvas.style.cursor = "default";
  }

  getLevel() {
    return this.camera ? this.camera.getLevel() : -1;
  }

  setLevel(level: number) {
    if (this.camera) {
      this.camera.setLevel(level);
    }
  }

  isAnimating(): boolean {
    return this.camera.isAnimating();
  }

  animateToLevel(level: number) {
    if (!this.isAnimating()) {
      level = level > Kernel.MAX_LEVEL ? Kernel.MAX_LEVEL : level; //超过最大的渲染级别就不渲染
      if (level !== this.getLevel()) {
        this.camera.animateToLevel(level);
      }
    }
  }

  private _tick() {
    try {
      //如果refresh方法出现异常而且没有捕捉，那么就会导致无法继续设置setTimeout，从而无法进一步更新切片
      this.refresh();
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => {
      this._tick();
    }, this.REFRESH_INTERVAL);
  }

  refresh(force: boolean = false) {
    if (!this.tiledLayer || !this.scene || !this.camera) {
      return;
    }
    //先更新camera中的各种矩阵
    this.camera.update(force);
    var newCameraCore = this.camera.getCameraCore();
    var isNeedRefresh = force || !newCameraCore.equals(this.cameraCore);
    this.cameraCore = newCameraCore;
    if (!isNeedRefresh) {
      return;
    }
    var lastLevel = this.getLevel() + 3;
    var options = {
      threshold: 1
    };
    var pitch = this.camera.getPitch();
    options.threshold = Math.min(90 / (90 - pitch), 1.5);
    //最大级别的level所对应的可见TileGrids
    var lastLevelTileGrids = this.camera.getVisibleTilesByLevel(lastLevel, options);
    this.tiledLayer.refresh(lastLevel, lastLevelTileGrids);
  }
}

export = Globe;