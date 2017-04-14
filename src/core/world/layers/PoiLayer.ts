declare function require(name: string): any;
import Kernel from '../Kernel';
import Utils from '../Utils';
import MathUtils from '../math/Utils';
import MultiPointsGraphic from '../graphics/MultiPointsGraphic';
import MarkerTextureMaterial from '../materials/MarkerTextureMaterial';
import Service from '../Service';
import Globe from '../Globe';
const poiImgUrl = require("../images/red.png");

class Poi {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public uuid: string,
    public name: string,
    public address: string,
    public phone: string) { }
}

export default class PoiLayer extends MultiPointsGraphic {
  private keyword: string = null;
  private pois: Poi[] = null;
  public globe: Globe = null;

  private constructor(public material: MarkerTextureMaterial) {
    super(material);
    this.pois = [];
    Utils.subscribe("extent-change", () => {
      if(this.keyword){
        this.search(this.keyword);
      }
    });
  }

  static getInstance(): PoiLayer {
    var material = new MarkerTextureMaterial(poiImgUrl, 16);
    return new PoiLayer(material);
  }

  destroy(){
    this.globe = null;
    super.destroy();
  }

  clear() {
    super.clear();
    this.keyword = null;
    this.pois = [];
  }

  private _addPoi(lon: number, lat: number, uuid: string, name: string, address: string, phone: string) {
    var p = MathUtils.geographicToCartesianCoord(lon, lat, Kernel.EARTH_RADIUS + 0.001);
    var poi = new Poi(p.x, p.y, p.z, uuid, name, address, phone);
    this.pois.push(poi);
    return poi;
  }

  search(keyword: string) {
    if(!this.globe){
      return;
    }
    this.clear();
    this.keyword = keyword;
    var level = this.globe.getLevel();
    if(level >= 10){
      var extent = this.globe.getExtent();
      Service.searchByExtent(keyword, level, extent).then((response: any) => {
        console.log(`${keyword} response:`, response);
        var data = response.detail.pois || [];
        var lonlats:number[][] = data.map((item: any) => {
          var lon = parseFloat(item.pointx);
          var lat = parseFloat(item.pointy);
          this._addPoi(lon, lat, item.uid, item.name, item.addr, item.phone);
          return [lon, lat];
        });
        this.setLonlats(lonlats);
      });
    }
  }

  searchNearby(keyword: string){
    Service.searchNearby(keyword, 116.408540, 39.902350).then((response: any) => {
      console.log(response);
    });
  }
};