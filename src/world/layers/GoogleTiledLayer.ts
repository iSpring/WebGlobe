///<amd-module name="world/layers/GoogleTiledLayer" />

import TiledLayer = require('./TiledLayer');

class GoogleTiledLayer extends TiledLayer{

  getTileUrl(level: number, row: number, column: number) {
    var sum = level + row + column;
    var idx = 1 + sum % 3;
    //return url = `//mt${idx}.google.cn/vt/lyrs=m@212000000&hl=zh-CN&gl=CN&src=app&x=${column}&y=${row}&z=${level}&s=Galil`;
    //http://ditu.bigemap.com/
    //http://ditu.bigemap.com/getTiles.php?x=12&y=6&z=4&type=satellite
    return `//ditu.bigemap.com/getTiles.php?x=${column}&y=${row}&z=${level}&type=satellite`;
  }

}

export = GoogleTiledLayer;