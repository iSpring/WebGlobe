///<amd-module name="world/graphics/Atmosphere"/>

import Kernel = require("../Kernel");
import MeshGraphic = require('./MeshGraphic');
import AtmosphereGeometry = require("../geometries/Atmosphere");
import MeshTextureMaterial = require('../materials/MeshTextureMaterial');
import Camera from "../Camera";

class Atmosphere extends MeshGraphic {
    private constructor(public geometry: AtmosphereGeometry, public material: MeshTextureMaterial){
        super(geometry, material);
    }

    static getInstance(): Atmosphere{
        var geometry = new AtmosphereGeometry();
        var imageUrl = "/WebGlobe/src/world/images/atmosphere64.png";
        var material = new MeshTextureMaterial(imageUrl, false);
        return new Atmosphere(geometry, material);
    }

    onDraw(camera: Camera){
        //根据Camera动态调整Atmosphere的matrix，使其一直垂直面向摄像机
        super.onDraw(camera);
    }
}

export = Atmosphere;