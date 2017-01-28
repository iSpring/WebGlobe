import Kernel = require('../Kernel');
import TiledLayer = require('./TiledLayer');
import LabelLayer from './LabelLayer';

//http://gaode.com

type Style = "Default" | "Satellite";

export class AutonaviTiledLayer extends TiledLayer{

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

};


//http://gaode.com/

export class AutonaviLabelLayer extends LabelLayer {
    private idx: number = 1;

    getTileUrl(level: number, row: number, column: number): string {
        //不透明+有文字：http://webrd04.is.autonavi.com/appmaptile?x=51&y=24&z=6&lang=zh_cn&size=1&scl=1&style=8&type=11
        //透明+有文字：  http://wprd04.is.autonavi.com/appmaptile?x=51&y=24&z=6&lang=zh_cn&size=1&scl=1&style=8&type=11
        //透明+无文字：http://wprd04.is.autonavi.com/appmaptile?x=51&y=24&z=6&lang=zh_cn&size=1&scl=1&style=8&ltype=11

        if (this.idx === undefined) {
            this.idx = 1;
        }

        //Chrome doesn't trust the SSL certificate of autonavi.com.
        // var url = `http://wprd0${this.idx}.is.autonavi.com/appmaptile?x=${column}&y=${row}&z=${level}&lang=zh_cn&size=1&scl=1&style=8&type=11`;
        var url = `//webst0${this.idx}.is.autonavi.com/appmaptile?style=8&x=${column}&y=${row}&z=${level}`;

        this.idx++;

        if (this.idx >= 5) {
            this.idx = 1;
        }

        return url;
    }
};