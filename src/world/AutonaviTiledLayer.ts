///<amd-module name="world/AutonaviTiledLayer"/>
import Kernel = require('./Kernel');
import TiledLayer = require('./TiledLayer');

class AutonaviTiledLayer extends TiledLayer{
  getImageUrl(level: number, row: number, column: number) {
    //使用代理
    var sum = level + row + column;
    var serverIdx = 1 + sum % 4; //1、2、3、4
    var url = "//webrd0" + serverIdx + ".is.autonavi.com/appmaptile?x=" + column + "&y=" + row + "&z=" + level + "&lang=zh_cn&size=1&scale=1&style=8";
    return this.wrapUrlWithProxy(url);
  }
}

export = AutonaviTiledLayer;