import TiledLayer = require('./TiledLayer');

//http://www.openstreetmap.org/

type Style = "Default" | "Cycle" | "Transport" | "Humanitarian";

export default class OsmTiledLayer extends TiledLayer {

  private idx:number = 0;

  constructor(style: Style = "Default"){
    super(style);
  }

  getTileUrl(level: number, row: number, column: number): string {
    if(this.idx === undefined){
      this.idx = 0;
    }

    var url:string = '';

    var server = ["a", "b", "c"][this.idx];

    if(this.style === "Cycle"){
      url = `//${server}.tile.thunderforest.com/cycle/${level}/${column}/${row}.png`;
    }else if(this.style === "Transport"){
      url = `//${server}.tile.thunderforest.com/transport/${level}/${column}/${row}.png`;
    }else if(this.style === "Humanitarian"){
      url = `//tile-${server}.openstreetmap.fr/hot/${level}/${column}/${row}.png`;
    }else{
      url = `//${server}.tile.openstreetmap.org/${level}/${column}/${row}.png`;
    }

    this.idx++;

    if(this.idx >= 3){
      this.idx = 0;
    }

    return url;
  }
}