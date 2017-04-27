declare function require(name: string): any;
import Kernel from '../Kernel';
import Utils from '../Utils';
import MathUtils from '../math/Utils';
import MultiPointsGraphic from '../graphics/MultiPointsGraphic';
import MarkerTextureMaterial from '../materials/MarkerTextureMaterial';
import Service, { Location } from '../Service';
import Globe from '../Globe';
import Extent from '../Extent';
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
  private searchExtentMode: boolean = false;
  private pois: Poi[] = null;
  public globe: Globe = null;

  private constructor(public material: MarkerTextureMaterial) {
    super(material);
    this.pois = [];
    Utils.subscribe("extent-change", () => {
      if (this.searchExtentMode && this.keyword) {
        this.search(this.keyword);
      }
    });
  }

  static getInstance(): PoiLayer {
    var material = new MarkerTextureMaterial(poiImgUrl, 16);
    return new PoiLayer(material);
  }

  isReady(){
    return this.globe && this.globe.camera.isEarthFullOverlapScreen() && super.isReady();
  }

  destroy() {
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

  private _showPois(searchResponse: any) {
    console.log('response:', searchResponse);
    var data = searchResponse.detail.pois || [];
    if(data.length > 0){
      var lonlats: number[][] = data.map((item: any) => {
        var lon = parseFloat(item.pointx);
        var lat = parseFloat(item.pointy);
        this._addPoi(lon, lat, item.uid, item.name, item.addr, item.phone);
        return [lon, lat];
      });
      this.setLonlats(lonlats);
      if(lonlats.length > 1){
        const extent = Extent.fromLonlats(lonlats);
        this.globe.setExtent(extent);
      }else{
        const lonlat = lonlats[0];
        this.globe.centerTo(lonlat[0], lonlat[1]);
      }
    }
  }

  search(keyword: string) {
    this.searchExtentMode = true;
    this.clear();
    this.keyword = keyword;
    var level = this.globe.getLevel();
    if (level >= 10) {
      var extent = this.globe.getExtent();
      if(extent){
        Service.searchByExtent(keyword, level, extent).then((response: any) => {
          this._showPois(response);
        });
      }
    }
  }

  searchNearby(keyword: string, radius: number = 1000, pageCapacity: number = 50, pageIndex: number = 0) {
    this.searchExtentMode = false;
    return Service.searchNearby(keyword, radius, false, pageCapacity, pageIndex).then((response: any) => {
      this._showPois(response);
      return response;
    });
  }

  searchByCurrentCity(keyword: string, pageCapacity: number = 50, pageIndex: number = 0){
    return Service.searchByCurrentCity(keyword, pageCapacity, pageIndex).then((response: any) => {
      this._showPois(response);
      return response;
    });
  }
};