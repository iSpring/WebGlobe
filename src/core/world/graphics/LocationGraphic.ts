declare function require(name: string): any;
import Kernel from '../Kernel';
import Utils from '../Utils';
import MultiPointsGraphic from '../graphics/MultiPointsGraphic';
import MarkerTextureMaterial from '../materials/MarkerTextureMaterial';
import Service from '../Service';
const locationImageUrl = require("../images/location.png");

export default class LocationGraphic extends MultiPointsGraphic {
//   private constructor(public material: MarkerTextureMaterial) {
//     super(material);
//     // Utils.subscribe("extent-change", () => {
//     //   if(this.keyword){
//     //     this.search(this.keyword);
//     //   }
//     // });
//   }

  setLonLat(lon: number, lat: number){
      this.setLonlats([[lon, lat]]);
  }

  isReady(){
    return Kernel.globe.camera.isEarthFullOverlapScreen() && super.isReady();
  }

  static getInstance(): LocationGraphic {
    var material = new MarkerTextureMaterial(locationImageUrl, 24);
    return new LocationGraphic(material);
  }
};