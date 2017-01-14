import Camera from '../Camera';
import Utils = require('../Utils');
import TileGrid from '../TileGrid';
import Kernel = require('../Kernel');
import Extent = require('../Extent');
import Tile = require("../graphics/Tile");
import GraphicGroup = require('../GraphicGroup');
import SubTiledLayer = require('./SubTiledLayer');

abstract class TiledLayer extends GraphicGroup<SubTiledLayer> {
  readonly imageRequestOptimizeDeltaLevel = 2;

  constructor(protected style: string = "") {
    super();

    //添加第0级的子图层
    var subLayer0 = new SubTiledLayer(0);
    this.add(subLayer0);

    //要对level为1的图层进行特殊处理，在创建level为1时就创建其中的全部的四个tile
    var subLayer1 = new SubTiledLayer(1);
    this.add(subLayer1);

    for (var m = 0; m <= 1; m++) {
      for (var n = 0; n <= 1; n++) {
        var args = {
          level: 1,
          row: m,
          column: n,
          url: ""
        };
        args.url = this.getTileUrl(args.level, args.row, args.column);
        var tile = Tile.getInstance(args.level, args.row, args.column, args.url);
        subLayer1.add(tile);
      }
    }
  }

  refresh() {
    var globe = Kernel.globe;
    var camera = globe.camera;
    var currentLevel = globe.getLevel();
    var lastLevel = globe.getLastLevel();
    var options = {
      threshold: 1
    };
    var pitch = camera.getPitch();
    options.threshold = 1;// options.threshold = Math.min(90 / (90 - pitch), 1.5);
    //最大级别的level所对应的可见TileGrids
    var lastLevelTileGrids = camera.getVisibleTilesByLevel(lastLevel, options);

    this._updateSubLayerCount(lastLevel);

    var levelsTileGrids: TileGrid[][] = [];
    var parentTileGrids = lastLevelTileGrids;
    var subLevel: number;

    for (subLevel = lastLevel; subLevel >= 2; subLevel--) {
      levelsTileGrids[subLevel] = parentTileGrids;//此行代码表示第subLevel层级的可见切片
      parentTileGrids = parentTileGrids.map(function (item) {
        return item.getParent();
      });
      parentTileGrids = Utils.filterRepeatArray(parentTileGrids);
    }

    for (subLevel = 2; subLevel <= lastLevel; subLevel++) {
      var addNew = lastLevel === subLevel || (lastLevel - subLevel) > this.imageRequestOptimizeDeltaLevel;
      this.children[subLevel].updateTiles(subLevel, levelsTileGrids[subLevel], addNew);
    }

    // this.updateTileVisibility(currentLevel, lastLevel);
  }

  //根据传入的level更新SubTiledLayer的数量
  private _updateSubLayerCount(level: number) {
    var subLayerCount = this.children.length;
    var deltaLevel = level + 1 - subLayerCount;
    var i: number, subLayer: SubTiledLayer;
    if (deltaLevel > 0) {
      //需要增加子图层
      for (i = 0; i < deltaLevel; i++) {
        subLayer = new SubTiledLayer(i + subLayerCount);
        this.add(subLayer);
      }
    } else if (deltaLevel < 0) {
      //需要删除多余的子图层
      deltaLevel *= -1;
      for (i = 0; i < deltaLevel; i++) {
        var removeLevel = this.children.length - 1;
        //第0级和第1级不删除
        if (removeLevel >= 2) {
          subLayer = this.children[removeLevel];
          this.remove(subLayer);
        } else {
          break;
        }
      }
    }
  }

  private _getReadyTile(tileGrid: TileGrid): Tile{
    var level = tileGrid.level;
    var row = tileGrid.row;
    var column = tileGrid.column;
    var tile = this.children[level].findTile(level, row, column);
    if(level === 1){
      return tile;
    }else{
      if(tile && tile.isReady()){
        return tile;
      }else{
        return this._getReadyTile(tileGrid.getParent());
      }
    }
  }

  updateTileVisibility() {
    var globe = Kernel.globe;
    var currentLevel = globe.getLevel();
    var lastLevel = globe.getLastLevel();

    this.children.forEach((subTiledLayer) => {
      subTiledLayer.showAllTiles();
    });

    /*if (currentLevel < Kernel.EARTH_FULL_OVERLAP_SCREEN_LEVEL) {
      return;
    }

    if (lastLevel - (this.imageRequestOptimizeDeltaLevel + 1) < 1) {
      return;
    }

    var allLoadedTilesLevel = -1;
    for (var subLevel = (lastLevel - this.imageRequestOptimizeDeltaLevel - 1); subLevel >= 0; subLevel--) {
      // if (lastLevel === subLevel || (lastLevel - subLevel) > this.imageRequestOptimizeDeltaLevel) {

      // }
      if (this.children[subLevel].checkIfAllTilesLoaded()) {
        allLoadedTilesLevel = subLevel;
        break;
      }
    }
    if (allLoadedTilesLevel >= 0) {
      this.children.forEach((subTiledLayer) => {
        subTiledLayer.visible = subTiledLayer.level >= allLoadedTilesLevel;
      });
    }
    var ancestorLevel = lastLevel - (this.imageRequestOptimizeDeltaLevel + 1);
    this.children[ancestorLevel].visible = true;*/

    var ancesorLevel = lastLevel - this.imageRequestOptimizeDeltaLevel - 1;
    if(ancesorLevel >= 1){
      var camera = Kernel.globe.camera;
      var tileGrids = camera.getTileGridsOfBoundary(ancesorLevel, false);
      if(tileGrids.length === 8){
        tileGrids = Utils.filterRepeatArray(tileGrids);
        for(var i: number = 0; i <= ancesorLevel; i++){
          this.children[i].hideAllTiles();
        }
        tileGrids.forEach((tileGrid) => {
          var tile = this._getReadyTile(tileGrid);
          if(tile){
            tile.setVisible(true);
            tile.parent.visible = true;
          }
        });
      }
    }
  }

  onDraw(camera: Camera) {
    var program = Tile.findProgram();
    if (!program) {
      return;
    }
    program.use();
    var gl = Kernel.gl;

    //设置uniform变量的值
    //uPMVMatrix
    var pmvMatrix = camera.getProjViewMatrixForDraw();
    var locPMVMatrix = program.getUniformLocation('uPMVMatrix');
    gl.uniformMatrix4fv(locPMVMatrix, false, pmvMatrix.getFloat32Array());

    //uSampler
    gl.activeTexture(gl.TEXTURE0);
    var locSampler = program.getUniformLocation('uSampler');
    gl.uniform1i(locSampler, 0);

    //此处将深度测试设置为ALWAYS是为了解决两个不同层级的切片在拖动时一起渲染会导致屏闪的问题
    gl.depthFunc(gl.ALWAYS);
    super.onDraw(camera);
    //将深度测试恢复成LEQUAL
    gl.depthFunc(gl.LEQUAL);
  }

  getExtent(level?: number) {
    var extents = this.getExtents(level);
    return Extent.union(extents);
  }

  getExtents(level?: number): Extent[] {
    if (!(level >= 0 && level <= (this.children.length - 1))) {
      level = this.children.length - 1 - 3;
    }
    var subTiledLayer = this.children[level];
    if (subTiledLayer) {
      return subTiledLayer.getExtents();
    }
    return [];
  }

  protected wrapUrlWithProxy(url: string): string {
    if (Kernel.proxy) {
      return Kernel.proxy + "?" + url;
    }
    return url;
  }

  getLastLevelVisibleTileGrids(){
    var tileGrids: TileGrid[] = null;
    var subTiledLayer = this.children[this.children.length - 1];
    if(subTiledLayer){
      tileGrids = subTiledLayer.getVisibleTileGrids();
    }
    return tileGrids;
  }

  abstract getTileUrl(level: number, row: number, column: number): string

  logVisibleTiles() {
    var result: any[] = [];
    this.children.forEach((subLayer) => {
      var allCount = subLayer.children.length;
      var visibleCount = subLayer.getShouldDrawTilesCount();
      result.push({
        level: subLayer.getLevel(),
        allCount: allCount,
        visibleCount: visibleCount
      });
    });
    console.table(result);
  }
}


export = TiledLayer;