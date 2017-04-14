declare function require(name: string): any;
import Kernel from '../Kernel';
import Utils from '../Utils';
import MultiPointsGraphic from '../graphics/MultiPointsGraphic';
import MarkerTextureMaterial from '../materials/MarkerTextureMaterial';
import Service from '../Service';
import Globe from '../Globe';
const locationImageUrl = require("../images/location.png");

export default class LocationGraphic extends MultiPointsGraphic {
//   private constructor(public material: MarkerTextureMaterial) {
//     super(material);
//     // Utils.subscribe("location", () => {
//     //   console.log(location);
//     // });
//   }

  globe: Globe = null;

  setLonLat(lon: number, lat: number){
      this.setLonlats([[lon, lat]]);
  }

  destroy(){
    this.globe = null;
    super.destroy();
  }

  isReady(){
    return this.globe && this.globe.camera.isEarthFullOverlapScreen() && super.isReady();
  }

  static getInstance(): LocationGraphic {
    var material = new MarkerTextureMaterial(locationImageUrl, 24);
    return new LocationGraphic(material);
  }
};