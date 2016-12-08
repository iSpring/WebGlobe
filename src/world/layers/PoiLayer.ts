///<amd-module name="world/layers/PoiLayer"/>
import Kernel = require('../Kernel');
import Utils = require('../Utils');
import Extent = require('../Extent');
import MathUtils = require('../math/Math');
import GraphicGroup = require('../GraphicGroup');
import Poi = require('../graphics/Poi');
import PoiMaterial = require('../materials/PoiMaterial');
import MeshTextureMaterial = require('../materials/MeshTextureMaterial');
import SearchService = require("../services/SearchService");

class PoiLayer extends GraphicGroup {
  keyword: string = null;

  constructor() {
    super();
    var poi = Poi.getInstance(116.408540, 39.902350, "", "", "", "");
    this.add(poi);
  }

  clear(){
    this.keyword = null;
    super.clear();
  }

  addPoi(lon: number, lat: number, uuid: string, name: string, address: string, phone: string){
    var poi = Poi.getInstance(lon, lat, uuid, name, address, phone);
    this.add(poi);
  }

  search(keyword: string) {
    this.clear();
    this.keyword = keyword;
    var globe = Kernel.globe;
    var level = globe.getLevel();
    globe.getExtents(level).forEach((extent: Extent) => {
      SearchService.search(keyword, level + 2, extent.getMinLon(), extent.getMinLat(), extent.getMaxLon(), extent.getMaxLat(), (response)=>{
        console.log(`${keyword} pois:`, response.detail.pois);
        var data = response.detail.pois || [];
        data.forEach((item: any) => {
          var lon = parseFloat(item.pointx);
          var lat = parseFloat(item.pointy);
          this.addPoi(lon, lat, item.uid, item.name, item.addr, item.phone);
        })
      });
    });
    
  }
}

export = PoiLayer;