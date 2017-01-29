import Utils = require('../Utils');
import TiledLayer = require('./TiledLayer');
import TrafficLayer from './TrafficLayer';

export class SosoTiledLayer extends TiledLayer {

  getTileUrl(level: number, row: number, column: number): string {
    if(level >= 10){
      return this._getPoliticalUrl(level, row, column);
    }

    //return this._getDemUrl(level, row, column);
    return this._getImageUrl(level, row, column);
  }

  //地形图
  private _getDemUrl(level: number, row: number, column: number): string{
    //http://p0.map.gtimg.com/demTiles/4/0/0/11_9.jpg
    var tileCount = Math.pow(2, level);
    var a = column;
    var b = tileCount - row - 1;
    var A = Math.floor(a / 16);
    var B = Math.floor(b / 16);
    var sum = level + row + column;
    var serverIdx = sum % 4; //0、1、2、3
    var url = `//p${serverIdx}.map.gtimg.com/demTiles/${level}/${A}/${B}/${a}_${b}.jpg`;
    return url;
  }


  //影像图
  private _getImageUrl(level: number, row: number, column: number): string {
    //http://p2.map.gtimg.com/sateTiles/8/12/9/201_157.jpg?version=101
    //var maptileUrl = "http://p"+serverIdx+".map.soso.com/maptilesv2/"+level+"/"+A+"/"+B+"/"+a+"_"+b+".png";
    var tileCount = Math.pow(2, level);
    var a = column;
    var b = tileCount - row - 1;
    var A = Math.floor(a / 16);
    var B = Math.floor(b / 16);
    var sum = level + row + column;
    var serverIdx = sum % 4; //0、1、2、3
    var url = `//p${serverIdx}.map.gtimg.com/sateTiles/${level}/${A}/${B}/${a}_${b}.jpg?version=101`;
    return url;
  }

  //行政区划图
  private _getPoliticalUrl(level: number, row: number, column: number): string {
    //["http://rt0.map.gtimg.com/tile", "http://rt1.map.gtimg.com/tile", "http://rt2.map.gtimg.com/tile", "http://rt3.map.gtimg.com/tile"]
    row = Math.pow(2, level) - row - 1;
    var index:number = (level + row + column) % 4;
    //http://rt2.map.gtimg.com/tile?z=4&x=11&y=9&type=vector&styleid=3&version=112
    var url = `//rt${index}.map.gtimg.com/tile?z=${level}&x=${column}&y=${row}&type=vector&styleid=3&version=112`;
    //need proxy
    return this.wrapUrlWithProxy(url);
  }
};


export class SosoTrafficLayer extends TrafficLayer {
    private idx: number = 1;
    private readonly domains: string[] = ["rtt2", "rtt2a", "rtt2b", "rtt2c"];
    protected minLevel: number = 11;

    getTileUrl(level: number, row: number, column: number): string {

        if (this.idx === undefined) {
            this.idx = 0;
        }

        row = Math.pow(2, level) - row - 1;

        //http://rtt2.map.qq.com/rtt/?z=11&x=1687&y=1270&timeKey148454126
        var timestamp = Math.floor(Date.now() / 10000);
        var url = `//${this.domains[this.idx]}.map.qq.com/rtt/?z=${level}&x=${column}&y=${row}&timeKey${timestamp}`;

        this.idx++;

        if (this.idx >= 4) {
            this.idx = 0;
        }

        return Utils.wrapUrlWithProxy(url);
    }
};