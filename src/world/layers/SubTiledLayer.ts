///<amd-module name="world/layers/SubTiledLayer"/>
import Kernel = require('../Kernel');
import Utils = require('../Utils');
import MathUtils = require('../math/Math');
import TileGrid = require('../TileGrid');
import GraphicGroup = require('../GraphicGroup');
import Tile = require('../graphics/Tile');
import Elevation = require('../Elevation');

class SubTiledLayer extends GraphicGroup {
  level: number = -1;
  //该级要请求的高程数据的层级，7[8,9,10];10[11,12,13];13[14,15,16];16[17,18,19]
  elevationLevel = -1;
  tiledLayer: any = null;

  constructor(args: any) {
    super();
    this.level = args.level;
    this.elevationLevel = Elevation.getAncestorElevationLevel(this.level);
  }

  //重写draw方法
  draw(camera: any) {
    if (this.level >= Kernel.TERRAIN_LEVEL && Kernel.globe && Kernel.globe.camera.pitch <= Kernel.TERRAIN_PITCH) {
      Kernel.gl.clear(Kernel.gl.DEPTH_BUFFER_BIT);
      Kernel.gl.clearDepth(1);
      Kernel.gl.enable(Kernel.gl.DEPTH_TEST);
    } else {
      Kernel.gl.disable(Kernel.gl.DEPTH_TEST);
    }
    super.draw(camera);
  }

  //重写Object3DComponents的add方法
  add(tile: Tile) {
    if (tile.tileInfo.level === this.level) {
      super.add(tile);
      tile.subTiledLayer = this;
    }
  }

  //重写Object3DComponents的destroy方法
  destroy() {
    super.destroy();
    this.tiledLayer = null;
  }

  //根据level、row、column查找tile，可以供调试用
  findTile(level: number, row: number, column: number) {
    var length = this.children.length;
    for (var i = 0; i < length; i++) {
      var tile = <Tile>this.children[i];
      if (tile.tileInfo.level === level && tile.tileInfo.row === row && tile.tileInfo.column === column) {
        return tile;
      }
    }
    return null;
  }

  //根据传入的tiles信息进行更新其children
  updateTiles(visibleTileGrids: TileGrid[], bAddNew: boolean) { //camera,options
    //var visibleTileGrids = camera.getVisibleTilesByLevel(this.level,options);
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
      tile = <Tile>this.children[i];
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
        console.debug("LINE:2191,subTiledLayer.remove(tilesNeedDelete[0])失败");
      }
    }

    if (bAddNew) {
      //添加新增的切片
      for (i = 0; i < visibleTileGrids.length; i++) {
        var tileGridInfo = visibleTileGrids[i];
        var args = {
          level: tileGridInfo.level,
          row: tileGridInfo.row,
          column: tileGridInfo.column,
          url: ""
        };
        args.url = this.tiledLayer.getImageUrl(args.level, args.row, args.column);
        tile = Tile.getTile(args.level, args.row, args.column, args.url);
        this.add(tile);
      }
    }
  }

  //如果bForce为true，则表示强制显示为三维，不考虑level
  checkTerrain(bForce:boolean = false) {
    // var globe = Kernel.globe;
    // var show3d = bForce === true ? true : this.level >= Kernel.TERRAIN_LEVEL;
    // if (show3d && globe && globe.camera && globe.camera.pitch < Kernel.TERRAIN_PITCH) {
    //   var tiles = this.children;
    //   for (var i = 0; i < tiles.length; i++) {
    //     var tile = <Tile>tiles[i];
    //     tile.checkTerrain(bForce);
    //   }
    // }
  }

  //根据当前子图层下的tiles获取其对应的祖先高程切片的TileGrid //getAncestorElevationTileGrids
  //7 8 9 10; 10 11 12 13; 13 14 15 16; 16 17 18 19;
  requestElevations() {
    var result:any[] = [];
    if (this.level > Kernel.ELEVATION_LEVEL) {
      var tiles = this.children;
      var i:number, name:any;
      for (i = 0; i < tiles.length; i++) {
        var tile = <Tile>tiles[i];
        var tileGrid = TileGrid.getTileGridAncestor(this.elevationLevel, tile.tileInfo.level, tile.tileInfo.row, tile.tileInfo.column);
        name = tileGrid.level + "_" + tileGrid.row + "_" + tileGrid.column;
        if (result.indexOf(name) < 0) {
          result.push(name);
        }
      }
      for (i = 0; i < result.length; i++) {
        name = result[i];
        var a = name.split('_');
        var eleLevel = parseInt(a[0]);
        var eleRow = parseInt(a[1]);
        var eleColumn = parseInt(a[2]);
        //只要elevations中有属性name，那么就表示该高程已经请求过或正在请求，这样就不要重新请求了
        //只有在完全没请求过的情况下去请求高程数据
        if (!Elevation.elevations.hasOwnProperty(name)) {
          Elevation.requestElevationsByTileGrid(eleLevel, eleRow, eleColumn);
        }
      }
    }
  }

  checkIfLoaded() {
    for (var i = 0; i < this.children.length; i++) {
      var tile = <Tile>this.children[i];
      if (tile) {
        var isTileLoaded = tile.material.isReady();
        if (!isTileLoaded) {
          return false;
        }
      }
    }
    return true;
  }
}

export = SubTiledLayer;