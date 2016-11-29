///<amd-module name="world/layers/PoiLayer"/>
import Kernel = require('../Kernel');
import Utils = require('../Utils');
import MathUtils = require('../math/Math');
import GraphicGroup = require('../GraphicGroup');
import Poi = require('../graphics/Poi');
import Marker = require('../geometries/Marker');
import PoiMaterial = require('../materials/PoiMaterial');
import MeshTextureMaterial = require('../materials/MeshTextureMaterial');

class PoiLayer extends GraphicGroup{
    constructor(){
        super();

        var p = MathUtils.geographicToCartesianCoord(116.408540, 39.902350, Kernel.EARTH_RADIUS + 0.001);
        //var p = MathUtils.geographicToCartesianCoord(0, 0, Kernel.EARTH_RADIUS * 1.2);
        var marker = new Marker(p.x, p.y, p.z);
        var url = "/WebGlobe/src/world/images/poi.png";
        var material = new PoiMaterial(url, 24);
        var poi = new Poi(marker, material);
        this.add(poi);
    }
}

export = PoiLayer;