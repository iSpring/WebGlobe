///<amd-module name="world/layers/TiledLayer"/>
import Kernel = require('../Kernel');
import GraphicGroup = require('../GraphicGroup');
import SubTiledLayer = require('./SubTiledLayer');
import PerspectiveCamera = require('../PerspectiveCamera');

abstract class TiledLayer extends GraphicGroup {

  //重写
  draw(camera: PerspectiveCamera){
    //此处将深度测试设置为ALWAYS是为了解决两个不同层级的切片在拖动时一起渲染会导致屏闪的问题
    Kernel.gl.depthFunc(Kernel.gl.ALWAYS);
    super.draw(camera);
    //将深度测试恢复成LEQUAL
    Kernel.gl.depthFunc(Kernel.gl.LEQUAL);
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