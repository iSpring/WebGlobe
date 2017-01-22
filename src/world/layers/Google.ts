import TiledLayer = require('./TiledLayer');
import LabelLayer from './LabelLayer';

//http://www.google.cn/maps
//http://ditu.bigemap.com/
//http://map.earthol.com/
//http://www.265.me/

type Style = "Default" | "Satellite";

export class GoogleTiledLayer extends TiledLayer{

  private idx:number = 0;

  constructor(style: Style = "Default"){
    super(style);
  }

  getTileUrl(level: number, row: number, column: number) {
    if(this.idx === undefined){
      this.idx = 0;
    }

    var url:string = "";

    if(this.style === "Satellite"){
      //http://mt0.google.cn/maps/vt?lyrs=s%40709&hl=zh-CN&gl=CN&&x=0&y=4&z=4
      url = `//mt${this.idx}.google.cn/maps/vt?lyrs=s%40709&hl=zh-CN&gl=CN&&x=${column}&y=${row}&z=${level}`;
    }else{
      // return `//mt${idx}.google.cn/vt/lyrs=m@212000000&hl=zh-CN&gl=CN&src=app&x=${column}&y=${row}&z=${level}&s=Galil`;
      url = `//mt${this.idx}.google.cn/vt/hl=zh-CN&gl=CN&x=${column}&y=${row}&z=${level}`;
    }

    this.idx++;

    if(this.idx >= 4){
      this.idx = 0;
    }

    return url;
  }

};



//http://ditu.bigemap.com/

export class GoogleLabelLayer extends LabelLayer {
    private idx: number = 0;

    getTileUrl(level: number, row: number, column: number): string {


        if (this.idx === undefined) {
            this.idx = 0;
        }

        //http://mt3.google.cn/vt/imgtp=png32&lyrs=h@365000000&hl=zh-CN&gl=cn&x=3376&y=1553&z=12&s=Galil
        var url = `//mt${this.idx}.google.cn/vt/imgtp=png32&lyrs=h@365000000&hl=zh-CN&gl=cn&x=${column}&y=${row}&z=${level}&s=Galil`;

        this.idx++;

        if (this.idx >= 4) {
            this.idx = 0;
        }

        return url;
    }
};