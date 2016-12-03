///<amd-module name="world/layers/TiledLayer"/>
import Kernel = require('../Kernel');
import GraphicGroup = require('../GraphicGroup');
import SubTiledLayer = require('./SubTiledLayer');
import Camera from '../Camera';
import TileGrid = require('../TileGrid');
import Utils = require('../Utils');

abstract class TiledLayer extends GraphicGroup {

  refresh(lastLevel: number, lastLevelTileGrids: TileGrid[]){
    var levelsTileGrids: any[] = []; //lastLevel->2
    var parentTileGrids = lastLevelTileGrids;
    var i: number;
    for (i = lastLevel; i >= 2; i--) {
      levelsTileGrids.push(parentTileGrids); //此行代码表示第i层级的可见切片
      parentTileGrids = Utils.map(parentTileGrids, function (item) {
        return item.getParent();
      });
      parentTileGrids = Utils.filterRepeatArray(parentTileGrids);
    }
    levelsTileGrids.reverse(); //2->lastLevel
    for (i = 2; i <= lastLevel; i++) {
      var subLevel = i;
      var subLayer = <SubTiledLayer>this.children[subLevel];
      subLayer.updateTiles(levelsTileGrids[0], true);
      levelsTileGrids.splice(0, 1);
    }
  }

  //重写
  draw(camera: Camera){
    var gl = Kernel.gl;
    //此处将深度测试设置为ALWAYS是为了解决两个不同层级的切片在拖动时一起渲染会导致屏闪的问题
    gl.depthFunc(gl.ALWAYS);
    super.draw(camera);
    //将深度测试恢复成LEQUAL
    gl.depthFunc(gl.LEQUAL);
  }

  //重写
  add(subTiledLayer: SubTiledLayer) {
    super.add(subTiledLayer);
    subTiledLayer.tiledLayer = this;
  }

  protected wrapUrlWithProxy(url: string): string{
    if(Kernel.proxy){
      return Kernel.proxy + "?" + url;
    }
    return url;
  }

  //根据切片的层级以及行列号获取图片的url,抽象方法，供子类实现
  abstract getTileUrl(level: number, row: number, column: number): string

  //根据传入的level更新SubTiledLayer的数量
  updateSubLayerCount(level: number) {
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
          subLayer = <SubTiledLayer>this.children[removeLevel];
          this.remove(subLayer);
        } else {
          break;
        }
      }
    }
  }
}

export = TiledLayer;