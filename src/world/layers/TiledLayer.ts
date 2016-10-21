///<amd-module name="world/layers/TiledLayer"/>
import Kernel = require('../Kernel');
import Object3DComponents = require('../Object3DComponents');
import SubTiledLayer = require('./SubTiledLayer');

abstract class TiledLayer extends Object3DComponents {
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
  abstract getImageUrl(level: number, row: number, column: number): string

  //根据传入的level更新SubTiledLayer的数量
  updateSubLayerCount(level: number) {
    var subLayerCount = this.children.length;
    var deltaLevel = level + 1 - subLayerCount;
    var i: number, subLayer: SubTiledLayer;
    if (deltaLevel > 0) {
      //需要增加子图层
      for (i = 0; i < deltaLevel; i++) {
        var args = {
          level: i + subLayerCount
        };
        subLayer = new SubTiledLayer(args);
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