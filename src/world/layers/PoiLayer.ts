///<amd-module name="world/layers/PoiLayer"/>
import Kernel = require('../Kernel');
import Utils = require('../Utils');
import MathUtils = require('../math/Math');
import GraphicGroup = require('../GraphicGroup');
import Poi = require('../graphics/Poi');
import Marker = require('../geometries/Marker');
import PoiMaterial = require('../materials/PoiMaterial');
import PerspectiveCamera = require('../PerspectiveCamera');

class PoiLayer extends GraphicGroup{
    constructor(){
        super();
        var p = MathUtils.geographicToCartesianCoord(180, 0, Kernel.EARTH_RADIUS + 1000000);
        var marker = new Marker(p.x, p.y, p.z);
        //var marker = new Marker(0, 0, 14198820-100);
        var material = new PoiMaterial();
        var poi = new Poi(marker, material);
        this.add(poi);
    }

    draw(camera: PerspectiveCamera){
        Kernel.gl.enable(Kernel.gl.DEPTH_TEST);
        super.draw(camera);
    }
}

export = PoiLayer;