import TiledLayer = require("./TiledLayer");
import {NokiaTiledLayer} from "./Nokia";
import {GoogleTiledLayer} from "./Google";
import {OsmTiledLayer} from "./OpenStreetMap";

export default class BlendTiledLayer extends TiledLayer {

  getTileUrl(level: number, row: number, column: number): string {
    var array:any[] = [NokiaTiledLayer, GoogleTiledLayer, OsmTiledLayer];
    var sum = level + row + column;
    var idx = sum % 3;
    var url = array[idx].prototype.getTileUrl.apply(this, arguments);
    return url;
  }

}