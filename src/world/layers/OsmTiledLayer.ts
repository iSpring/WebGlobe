///<amd-module name="world/layers/OsmTiledLayer" />

import TiledLayer = require('./TiledLayer');

//http://www.openstreetmap.org/

export enum OsmStyle{
  Standard,
  Cycle,
  Transport,
  Humanitarian
}

export default class OsmTiledLayer extends TiledLayer {

  private urlTemplate: string;

  constructor(private style: OsmStyle = OsmStyle.Standard){
    super();
  }

  getTileUrl(level: number, row: number, column: number): string {
    //http://c.tile.thunderforest.com/cycle/3/5/2.png
    var sum = level + row + column;
    var idx = sum % 3;
    var server = ["a", "b", "c"][idx];
    var url = '';
    if(this.style === OsmStyle.Standard){
      url = `//${server}.tile.openstreetmap.org/${level}/${column}/${row}.png`;
    }else if(this.style === OsmStyle.Cycle){
      //?apikey=6170aad10dfd42a38d4d8c709a536f38
      url = `//${server}.tile.thunderforest.com/${level}/${column}/${row}.png`;
    }else if(this.style === OsmStyle.Transport){
      //?apikey=6170aad10dfd42a38d4d8c709a536f38
      url = `//${server}.tile.thunderforest.com/transport/${level}/${column}/${row}.png`;
    }else if(this.style === OsmStyle.Humanitarian){
      url = `//tile-${server}.openstreetmap.fr/hot/${level}/${column}/${row}.png`;
    }

    return url;
  }
}