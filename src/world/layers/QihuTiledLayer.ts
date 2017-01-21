import TiledLayer = require('./TiledLayer');

//http://ditu.so.com/

class QihuTiledLayer extends TiledLayer{

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

}

export default QihuTiledLayer;