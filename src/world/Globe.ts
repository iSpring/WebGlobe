///<amd-module name="world/Globe"/>
import Kernel = require("./Kernel");
import Utils = require("./Utils");
import ShaderContent = require("./ShaderContent");
import Renderer = require("./Renderer");
import PerspectiveCamera = require("./PerspectiveCamera");
import Scene = require("./Scene");
import TiledLayer = require("./TiledLayer");
import SubTiledLayer = require("./SubTiledLayer");
import Tile = require("./Tile");
import ImageUtils = require("./Image");
import EventUtils = require("./Event");

class Globe {
  MAX_LEVEL: number = 15;//最大的渲染级别15
  CURRENT_LEVEL: number = -1; //当前渲染等级
  REFRESH_INTERVAL: number = 300; //Globe自动刷新时间间隔，以毫秒为单位
  idTimeOut: any = null; //refresh自定刷新的timeOut的handle
  renderer: Renderer = null;
  scene: Scene = null;
  camera: PerspectiveCamera = null;
  tiledLayer: TiledLayer = null;

  constructor(canvas: HTMLCanvasElement, args: any) {
    args = args || {};
    Kernel.globe = this;

    var vs_content = ShaderContent.SIMPLE_SHADER.VS_CONTENT;
    var fs_content = ShaderContent.SIMPLE_SHADER.FS_CONTENT;
    this.renderer = Kernel.renderer = new Renderer(canvas, vs_content, fs_content);
    this.scene = new Scene();
    var radio = canvas.width / canvas.height;
    this.camera = new PerspectiveCamera(30, radio, 1.0, 20000000.0);
    this.renderer.bindScene(this.scene);
    this.renderer.bindCamera(this.camera);
    this.setLevel(0);
    this.renderer.setIfAutoRefresh(true);
    EventUtils.initLayout();
  }

  setTiledLayer(tiledLayer: TiledLayer) {
    clearTimeout(this.idTimeOut);
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
    this.scene.add(this.tiledLayer);
    //添加第0级的子图层
    var subLayer0 = new SubTiledLayer({
      level: 0
    });
    this.tiledLayer.add(subLayer0);

    //要对level为1的图层进行特殊处理，在创建level为1时就创建其中的全部的四个tile
    var subLayer1 = new SubTiledLayer({
      level: 1
    });
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
        args.url = this.tiledLayer.getImageUrl(args.level, args.row, args.column);
        var tile = new Tile(args);
        subLayer1.add(tile);
      }
    }
    Kernel.canvas.style.cursor = "default";
    this.tick();
  }

  setLevel(level: number) {
    if (!Utils.isNonNegativeInteger(level)) {
      throw "invalid level:" + level;
    }
    
    level = level > this.MAX_LEVEL ? this.MAX_LEVEL : level; //超过最大的渲染级别就不渲染
    if (level != this.CURRENT_LEVEL) {
      if (this.camera instanceof PerspectiveCamera) {
        //要先执行camera.setLevel,然后再刷新
        this.camera.setLevel(level);        
        this.refresh();
      }
    }
  }

  isAnimating(): boolean{
    return this.camera.isAnimating();
  }

  animateToLevel(level: number){
    if(!this.isAnimating()){
      this.camera.animateToLevel(level);
    }    
  }

  /**
   * 返回当前的各种矩阵信息:视点矩阵、投影矩阵、两者乘积，以及前三者的逆矩阵
   * @returns {{View: null, _View: null, Proj: null, _Proj: null, ProjView: null, _View_Proj: null}}
   * @private
   */
  /*_getMatrixInfo() {
    var options: any = {
      View: null, //视点矩阵
      _View: null, //视点矩阵的逆矩阵
      Proj: null, //投影矩阵
      _Proj: null, //投影矩阵的逆矩阵
      ProjView: null, //投影矩阵与视点矩阵的乘积
      _View_Proj: null //视点逆矩阵与投影逆矩阵的乘积
    };
    options.View = this.getViewMatrix();
    options._View = options.View.getInverseMatrix();
    options.Proj = this.projMatrix;
    options._Proj = options.Proj.getInverseMatrix();
    options.ProjView = options.Proj.multiplyMatrix(options.View);
    options._View_Proj = options.ProjView.getInverseMatrix();
    return options;
  }*/

  tick() {
    var globe = Kernel.globe;
    if (globe) {
      globe.refresh();
      this.idTimeOut = setTimeout(globe.tick, globe.REFRESH_INTERVAL);
    }
  }

  refresh() {
    if (!this.tiledLayer || !this.scene || !this.camera) {
      return;
    }
    var level = this.CURRENT_LEVEL + 3;
    this.tiledLayer.updateSubLayerCount(level);
    var projView = this.camera.getProjViewMatrix();
    var options = {
      projView: projView,
      threshold: 1
    };
    options.threshold = Math.min(90 / this.camera.pitch, 1.5);
    //最大级别的level所对应的可见TileGrids
    var lastLevelTileGrids = this.camera.getVisibleTilesByLevel(level, options);
    var levelsTileGrids: any[] = []; //level-2
    var parentTileGrids = lastLevelTileGrids;
    var i: number;
    for (i = level; i >= 2; i--) {
      levelsTileGrids.push(parentTileGrids); //此行代码表示第i层级的可见切片
      parentTileGrids = Utils.map(parentTileGrids, function (item) {
        return item.getParent();
      });
      parentTileGrids = Utils.filterRepeatArray(parentTileGrids);
    }
    levelsTileGrids.reverse(); //2-level
    for (i = 2; i <= level; i++) {
      var subLevel = i;
      var subLayer = <SubTiledLayer>this.tiledLayer.children[subLevel];
      subLayer.updateTiles(levelsTileGrids[0], true);
      levelsTileGrids.splice(0, 1);
    }
    if (Kernel.TERRAIN_ENABLED) {
      this.requestElevationsAndCheckTerrain();
    }
  }

  //请求更新高程数据，并检测Terrain
  requestElevationsAndCheckTerrain() {
    var level = this.tiledLayer.children.length - 1;
    //当level>7时请求更新高程数据
    //请求的数据与第7级的切片大小相同
    //if(level > Kernel.ELEVATION_LEVEL){

    //达到TERRAIN_LEVEL级别时考虑三维请求
    if (level >= Kernel.TERRAIN_LEVEL) {
      for (var i = Kernel.ELEVATION_LEVEL + 1; i <= level; i++) {
        var subLayer = <SubTiledLayer>this.tiledLayer.children[i];
        subLayer.requestElevations();
        //检查SubTiledLayer下的子图层是否符合转换成TerrainTile的条件，如果适合就自动以三维地形图显示
        if (i >= Kernel.TERRAIN_LEVEL) {
          subLayer.checkTerrain();
        }
      }
    }
  }
}

export = Globe;