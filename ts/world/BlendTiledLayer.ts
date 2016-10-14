import TiledLayer = require("./TiledLayer");
import NokiaTiledLayer = require("./NokiaTiledLayer");
import GoogleTiledLayer = require("./GoogleTiledLayer");
import OsmTiledLayer = require("./OsmTiledLayer");

class BlendTiledLayer extends TiledLayer {
  getImageUrl(level: number, row: number, column: number): string {
    var array = [NokiaTiledLayer, GoogleTiledLayer, OsmTiledLayer];
    var sum = level + row + column;
    var idx = sum % 3;
    var url = array[idx].prototype.getImageUrl.apply(this, arguments);
    return url;
  }
}

export = BlendTiledLayer;