import TiledLayer = require('./TiledLayer');

export class NokiaTiledLayer extends TiledLayer{

  getTileUrl(level: number, row: number, column: number): string {
    var sum = level + row + column;
    var idx = 1 + sum % 4; //1,2,3,4
    //https://1.base.maps.api.here.com/maptile/2.1/maptile/2ae1d8fbb0/normal.day/4/9/7/512/png8?app_id=xWVIueSv6JL0aJ5xqTxb&app_code=djPZyynKsbTjIUDOBcHZ2g&lg=eng&ppi=72&pview=DEF
    var url = `//${idx}.base.maps.api.here.com/maptile/2.1/maptile/f1f4a211b3/normal.day/${level}/${column}/${row}/512/png8?app_id=xWVIueSv6JL0aJ5xqTxb&app_code=djPZyynKsbTjIUDOBcHZ2g&lg=eng&ppi=72&pview=DEF`;
    return url;
  }

}