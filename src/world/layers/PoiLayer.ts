///<amd-module name="world/layers/PoiLayer"/>
import Kernel = require('../Kernel');
import Utils = require('../Utils');
import MathUtils = require('../math/Math');
import GraphicGroup = require('../GraphicGroup');
import Poi = require('../graphics/Poi');

import PoiMaterial = require('../materials/PoiMaterial');
import MeshTextureMaterial = require('../materials/MeshTextureMaterial');

class PoiLayer extends GraphicGroup {
  keyword: string = null;

  constructor() {
    super();
    var poi = Poi.getInstance(116.408540, 39.902350, "", "");
    this.add(poi);
  }

  clear(){
    this.keyword = null;
    super.clear();
  }

  setKeyword(keyworld: string){
    this.keyword = keyworld;
  }
}

export = PoiLayer;