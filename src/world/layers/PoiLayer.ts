///<amd-module name="world/layers/PoiLayer"/>
import Kernel = require('../Kernel');
import Utils = require('../Utils');
import Extent = require('../Extent');
import Camera from '../Camera';
import MathUtils = require('../math/Math');
import GraphicGroup = require('../GraphicGroup');
import Poi = require('../graphics/Poi');
import PoiMaterial = require('../materials/PoiMaterial');
import MeshTextureMaterial = require('../materials/MeshTextureMaterial');

class PoiLayer extends GraphicGroup {
  keyword: string = null;

  constructor() {
    super();
    var poi = Poi.getInstance(116.408540, 39.902350, "", "", "", "");
    this.add(poi);
  }

  draw(camera: Camera) {
    var gl = Kernel.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.depthFunc(gl.ALWAYS);

    super.draw(camera);

    gl.disable(gl.BLEND);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    // gl.depthFunc(gl.LEQUAL);
  }

  clear() {
    this.keyword = null;
    super.clear();
  }

  private _addPoi(lon: number, lat: number, uuid: string, name: string, address: string, phone: string) {
    var poi = Poi.getInstance(lon, lat, uuid, name, address, phone);
    this.add(poi);
  }

  static search(wd: string, level: number, minLon: number, minLat: number, maxLon: number, maxLat: number, callback: (response: any) => void, pageCapacity: number = 50, pageIndex: number = 0) {
    var url = `//apis.map.qq.com/jsapi?qt=syn&wd=${wd}&pn=${pageIndex}&rn=${pageCapacity}&output=jsonp&b=${minLon},${minLat},${maxLon},${maxLat}&l=${level}&c=000000`;
    Utils.jsonp(url, callback);
  }

  search(keyword: string) {
    this.clear();
    this.keyword = keyword;
    var globe = Kernel.globe;
    var level = globe.getLevel() + 3;
    var extents = globe.getExtents(level);
    extents.forEach((extent: Extent) => {
      PoiLayer.search(keyword, level, extent.getMinLon(), extent.getMinLat(), extent.getMaxLon(), extent.getMaxLat(), (response) => {
        console.log(`${keyword} response:`, response);
        var data = response.detail.pois || [];
        data.forEach((item: any) => {
          var lon = parseFloat(item.pointx);
          var lat = parseFloat(item.pointy);
          this._addPoi(lon, lat, item.uid, item.name, item.addr, item.phone);
        })
      });
    });

  }
}

export = PoiLayer;