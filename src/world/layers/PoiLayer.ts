///<amd-module name="world/layers/PoiLayer"/>
import Kernel = require('../Kernel');
import Utils = require('../Utils');
import MathUtils = require('../math/Math');
import GraphicGroup = require('../GraphicGroup');
import Poi = require('../graphics/Poi');
import Marker = require('../geometries/Marker');
import PoiMaterial = require('../materials/PoiMaterial');

class PoiLayer extends GraphicGroup{
    constructor(){
        super();
        //Kernel.EARTH_RADIUS + 100
        //14198820
        var p = MathUtils.geographicToCartesianCoord(0, 0, Kernel.EARTH_RADIUS + 100);
        var marker = new Marker(p.x, p.y, p.z);
        //var marker = new Marker(0, 0, 14198820-100);
        var material = new PoiMaterial();
        var poi = new Poi(marker, material);
        this.add(poi);
    }
}

export = PoiLayer;