///<amd-module name="world/layers/ArcGISTiledLayer"/>
import Kernel = require("../Kernel");
import TiledLayer = require("./TiledLayer");

class ArcGISTiledLayer extends TiledLayer{
  constructor(public url: string){
    super();
  }

  getTileUrl(level: number, row: number, column: number) {
    var url = Kernel.proxy + "?" + this.url + "/tile/" + level + "/" + row + "/" + column;
    return this.wrapUrlWithProxy(url);
  }
}

export = ArcGISTiledLayer;