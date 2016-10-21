///<amd-module name="world/layers/GoogleTiledLayer"/>
import TiledLayer = require('./TiledLayer');

class GoogleTiledLayer extends TiledLayer{
  getImageUrl(level: number, row: number, column: number) {
    var sum = level + row + column;
    var idx = 1 + sum % 3;
    var url = "//mt" + idx + ".google.cn/vt/lyrs=m@212000000&hl=zh-CN&gl=CN&src=app&x=" + column + "&y=" + row + "&z=" + level + "&s=Galil";
    return url;
  }
}

export = GoogleTiledLayer;