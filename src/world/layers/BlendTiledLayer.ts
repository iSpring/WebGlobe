import TiledLayer = require("./TiledLayer");
import NokiaTiledLayer = require("./NokiaTiledLayer");
import GoogleTiledLayer = require("./GoogleTiledLayer");
import OsmTiledLayer = require("./OsmTiledLayer");

class BlendTiledLayer extends TiledLayer {

  getTileUrl(level: number, row: number, column: number): string {
    var array:any[] = [NokiaTiledLayer, GoogleTiledLayer, OsmTiledLayer];
    var sum = level + row + column;
    var idx = sum % 3;
    var url = array[idx].prototype.getTileUrl.apply(this, arguments);
    return url;
  }

}

export = BlendTiledLayer;