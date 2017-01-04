///<amd-module name="world/layers/GoogleTiledLayer" />

import TiledLayer = require('./TiledLayer');

type Style = "Standard" | "Cycle" | "Transport" | "Humanitarian";

class GoogleTiledLayer extends TiledLayer{

  getTileUrl(level: number, row: number, column: number) {
    // var sum = level + row + column;
    // var idx = 1 + sum % 3;
    // var idx = 0;
    // return `//mt${idx}.google.cn/vt/lyrs=m@212000000&hl=zh-CN&gl=CN&src=app&x=${column}&y=${row}&z=${level}&s=Galil`;
    return `//mt0.google.cn/vt/hl=zh-CN&gl=CN&x=${column}&y=${row}&z=${level}`;

    //http://mt2.google.cn/vt/lyrs=m@365000000&hl=zh-CN&gl=cn&x=11&y=5&z=4

    //http://ditu.bigemap.com/
    //http://ditu.bigemap.com/getTiles.php?x=12&y=6&z=4&type=satellite
    // return `//ditu.bigemap.com/getTiles.php?x=${column}&y=${row}&z=${level}&type=satellite`;

    //http://map.earthol.com/
    //http://www.265.me/
    //http://mt0.google.cn/maps/vt?lyrs=s%40709&hl=zh-CN&gl=CN&&x=0&y=4&z=4
    // return `//mt0.google.cn/maps/vt?lyrs=s%40709&hl=zh-CN&gl=CN&&x=${column}&y=${row}&z=${level}`;
  }

}

export = GoogleTiledLayer;