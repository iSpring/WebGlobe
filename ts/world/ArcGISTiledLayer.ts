import Kernel = require("./Kernel");
import TiledLayer = require("./TiledLayer");

class ArcGISTiledLayer extends TiledLayer{
  constructor(public url: string){
    super();
  }

  getImageUrl(level: number, row: number, column: number) {
    //使用代理
    var url = Kernel.proxy + "?" + this.url + "/tile/" + level + "/" + row + "/" + column;
    return url;
  }
}

export = ArcGISTiledLayer;