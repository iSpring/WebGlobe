///<amd-module name="world/layers/OsmTiledLayer" />

import TiledLayer = require('./TiledLayer');

//http://www.openstreetmap.org/

type OsmStyle = "Standard" | "Cycle" | "Transport" | "Humanitarian";

export default class OsmTiledLayer extends TiledLayer {

  constructor(style: OsmStyle){
    super(style);
  }

  getTileUrl(level: number, row: number, column: number): string {
    //http://c.tile.thunderforest.com/cycle/3/5/2.png
    var sum = level + row + column;
    var idx = sum % 3;
    var server = ["a", "b", "c"][idx];
    var url = '';
    if(this.style === "Cycle"){
      //?apikey=6170aad10dfd42a38d4d8c709a536f38
      url = `//${server}.tile.thunderforest.com/cycle/${level}/${column}/${row}.png`;
    }else if(this.style === "Transport"){
      //?apikey=6170aad10dfd42a38d4d8c709a536f38
      url = `//${server}.tile.thunderforest.com/transport/${level}/${column}/${row}.png`;
    }else if(this.style === "Humanitarian"){
      url = `//tile-${server}.openstreetmap.fr/hot/${level}/${column}/${row}.png`;
    }else{
      url = `//${server}.tile.openstreetmap.org/${level}/${column}/${row}.png`;
    }

    return url;
  }
}