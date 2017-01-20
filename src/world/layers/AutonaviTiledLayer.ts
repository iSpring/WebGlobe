import Kernel = require('../Kernel');
import TiledLayer = require('./TiledLayer');

//http://gaode.com

type Style = "Default" | "Satellite";

class AutonaviTiledLayer extends TiledLayer{

  private idx:number = 1;

  constructor(style: Style = "Default"){
    super(style);
  }

  getTileUrl(level: number, row: number, column: number) {
    if(this.idx === undefined){
      this.idx = 1;
    }

    //http://webst02.is.autonavi.com/appmaptile?style=6&x=107882&y=49723&z=17   style:6,7,8

    var url:string = "";

    if(this.style === 'Satellite'){
      url = `//webst0${this.idx}.is.autonavi.com/appmaptile?style=6&x=${column}&y=${row}&z=${level}`;
    }else{
      url = `//webst0${this.idx}.is.autonavi.com/appmaptile?style=7&x=${column}&y=${row}&z=${level}`;
    }

    // var url = `//webrd0${this.idx}.is.autonavi.com/appmaptile?x=${column}&y=${row}&z=${level}&lang=zh_cn&size=1&scale=1&style=8`;

    this.idx++;

    if(this.idx >= 5){
      this.idx = 1;
    }

    return url;
  }

}

export = AutonaviTiledLayer;