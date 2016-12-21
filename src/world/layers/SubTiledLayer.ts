///<amd-module name="world/layers/SubTiledLayer"/>

import Kernel = require('../Kernel');
import Utils = require('../Utils');
import Extent = require('../Extent');
import MathUtils = require('../math/Math');
import TileGrid = require('../TileGrid');
import GraphicGroup = require('../GraphicGroup');
import Tile = require('../graphics/Tile');
import TiledLayer = require('./TiledLayer');

class SubTiledLayer extends GraphicGroup<Tile> {
  tiledLayer: TiledLayer = null;

  constructor(public level: number) {
    super();
  }

  //重写GraphicGroup的add方法
  add(tile: Tile) {
    if (tile.tileInfo.level === this.level) {
      super.add(tile);
      tile.subTiledLayer = this;
    }
  }

  //重写GraphicGroup的destroy方法
  destroy() {
    super.destroy();
    this.tiledLayer = null;
  }

  //根据level、row、column查找tile，可以供调试用
  findTile(level: number, row: number, column: number) {
    var length = this.children.length;
    for (var i = 0; i < length; i++) {
      var tile = this.children[i];
      if (tile.tileInfo.level === level && tile.tileInfo.row === row && tile.tileInfo.column === column) {
        return tile;
      }
    }
    return null;
  }

  //根据传入的tiles信息进行更新其children
  updateTiles(visibleTileGrids: TileGrid[], bAddNew: boolean) {
    //检查visibleTileGrids中是否存在指定的切片信息
    function checkTileExist(tileArray: TileGrid[], lev: number, row: number, col: number): any {
      var result = {
        isExist: false,
        index: -1
      };
      for (var m = 0; m < tileArray.length; m++) {
        var tileInfo = tileArray[m];
        if (tileInfo.level === lev && tileInfo.row === row && tileInfo.column === col) {
          result.isExist = true;
          result.index = m;
          return result;
        }
      }
      return result;
    }

    //记录应该删除的切片
    var tilesNeedDelete: Tile[] = [];
    var i:number, tile:Tile;
    for (i = 0; i < this.children.length; i++) {
      tile = this.children[i];
      var checkResult = checkTileExist(visibleTileGrids, tile.tileInfo.level, tile.tileInfo.row, tile.tileInfo.column);
      var isExist = checkResult.isExist;
      if (isExist) {
        visibleTileGrids.splice(checkResult.index, 1); //已处理
      } else {
        //暂时不删除，先添加要删除的标记，循环删除容易出错
        tilesNeedDelete.push(tile);
      }
    }

    //集中进行删除
    while (tilesNeedDelete.length > 0) {
      var b = this.remove(tilesNeedDelete[0]);
      tilesNeedDelete.splice(0, 1);
      if (!b) {
        console.debug("subTiledLayer.remove(tilesNeedDelete[0])失败");
      }
    }

    if (bAddNew) {
      //添加新增的切片
      //console.log(`level: ${this.level}, new added count: ${visibleTileGrids.length}`);
      for (i = 0; i < visibleTileGrids.length; i++) {
        var tileGridInfo = visibleTileGrids[i];
        var args = {
          level: tileGridInfo.level,
          row: tileGridInfo.row,
          column: tileGridInfo.column,
          url: ""
        };
        args.url = this.tiledLayer.getTileUrl(args.level, args.row, args.column);
        tile = Tile.getInstance(args.level, args.row, args.column, args.url);
        this.add(tile);
      }
    }
  }

  checkIfAllTilesLoaded() {
    for (var i = 0; i < this.children.length; i++) {
      var tile = this.children[i];
      if (tile) {
        var isTileLoaded = tile.material.isReady();
        if (!isTileLoaded) {
          return false;
        }
      }
    }
    return true;
  }

  getExtent(): Extent{
    return Extent.union(this.getExtents());
  }

  getExtents(): Extent[]{
    return this.children.map((item) => item.getExtent());
  }

  getShouldDrawTilesCount(){
    return this.visible ? this.children.filter((tile)=>{
      return tile.visible && tile.isReady();
    }).length : 0;
  }
}

export = SubTiledLayer;