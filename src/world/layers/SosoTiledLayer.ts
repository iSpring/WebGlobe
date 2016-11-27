///<amd-module name="world/layers/SosoTiledLayer"/>
import TiledLayer = require('./TiledLayer');

class SosoTiledLayer extends TiledLayer {
  getImageUrl(level: number, row: number, column: number): string {
    // if(level >= 10){
    //   return this.getImageUrl2(level, row, column);
    // }

    return this.getImageUrl1(level, row, column);
  }

  getImageUrl1(level: number, row: number, column: number): string {
    //影像
    var url = "";
    var tileCount = Math.pow(2, level);
    var a = column;
    var b = tileCount - row - 1;
    var A = Math.floor(a / 16);
    var B = Math.floor(b / 16);
    var sum = level + row + column;
    var serverIdx = sum % 4; //0、1、2、3
    //var maptileUrl = "http://p"+serverIdx+".map.soso.com/maptilesv2/"+level+"/"+A+"/"+B+"/"+a+"_"+b+".png";
    var sateUrl = "//p" + serverIdx + ".map.soso.com/sateTiles/" + level + "/" + A + "/" + B + "/" + a + "_" + b + ".jpg";
    url = sateUrl;
    return url;
  }

  getImageUrl2(level: number, row: number, column: number): string {
    //["http://rt0.map.gtimg.com/tile", "http://rt1.map.gtimg.com/tile", "http://rt2.map.gtimg.com/tile", "http://rt3.map.gtimg.com/tile"]
    row = Math.pow(2, level) - row - 1;
    var index:number = (level + row + column) % 4;
    //http://rt2.map.gtimg.com/tile?z=4&x=11&y=9&type=vector&styleid=3&version=112
    var url = `//rt${index}.map.gtimg.com/tile?z=${level}&x=${column}&y=${row}&type=vector&styleid=3&version=112`;
    //need proxy
    return this.wrapUrlWithProxy(url);
  }
}

export = SosoTiledLayer;