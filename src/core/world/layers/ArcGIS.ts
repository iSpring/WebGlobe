import TiledLayer from './TiledLayer';

export class ArcGISTiledLayer extends TiledLayer{
  constructor(public url: string){
    super();
  }

  getTileUrl(level: number, row: number, column: number) {
    var url = `${this.url}/tile/${level}/${row}/${column}`;
    return this.wrapUrlWithProxy(url);
  }
};