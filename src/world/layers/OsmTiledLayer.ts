///<amd-module name="world/layers/OsmTiledLayer"/>
import TiledLayer = require('./TiledLayer');

class OsmTiledLayer extends TiledLayer {

  getTileUrl(level: number, row: number, column: number): string {
    var sum = level + row + column;
    var idx = sum % 3;
    var server = ["a", "b", "c"][idx];
    var url = "//" + server + ".tile.openstreetmap.org/" + level + "/" + column + "/" + row + ".png";
    return url;
  }
  
}

export = OsmTiledLayer;