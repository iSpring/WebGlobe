import TiledLayer = require('./TiledLayer');
import TrafficLayer from './TrafficLayer';

//http://ditu.so.com/

export class QihuTiledLayer extends TiledLayer{
  private idx:number = 0;

  getTileUrl(level: number, row: number, column: number) {
    if(this.idx === undefined){
      this.idx = 0;
    }

    row = Math.pow(2, level) - row - 1;

    //https://map4.ssl.ishowchina.com/sotile/ver11/2/17/?x=107921&y=81412
    var url:string = `//map${this.idx}.ssl.ishowchina.com/sotile/ver11/2/${level}/?x=${column}&y=${row}`;

    this.idx++;

    if(this.idx >= 5){
      this.idx = 0;
    }

    return this.wrapUrlWithProxy(url);
  }
};



//http://ditu.so.com/

export class QihuTrafficLayer extends TrafficLayer {
    protected minLevel: number = 8;

    getTileUrl(level: number, row: number, column: number): string {
        //https://qhapi.map.ishowchina.com/lkinfo/?act=tile&x=208&y=153&z=8&t=1484549712280
        row = Math.pow(2, level) - row - 1;
        var timestamp = Date.now();
        return `//qhapi.map.ishowchina.com/lkinfo/?act=tile&x=${column}&y=${row}&z=${level}&t=${timestamp}`;
    }
};