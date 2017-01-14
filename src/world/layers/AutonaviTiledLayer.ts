import Kernel = require('../Kernel');
import TiledLayer = require('./TiledLayer');

class AutonaviTiledLayer extends TiledLayer{

  private idx:number = 1;

  getTileUrl(level: number, row: number, column: number) {
    if(this.idx === undefined){
      this.idx = 1;
    }

    var url = `//webrd0${this.idx}.is.autonavi.com/appmaptile?x=${column}&y=${row}&z=${level}&lang=zh_cn&size=1&scale=1&style=8`;

    this.idx++;

    if(this.idx >= 5){
      this.idx = 1;
    }

    return url;
  }

}

export = AutonaviTiledLayer;