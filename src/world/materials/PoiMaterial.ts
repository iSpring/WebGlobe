import MeshTextureMaterial = require("./MeshTextureMaterial");

type ImageType = string | HTMLImageElement;

class PoiMaterial extends MeshTextureMaterial{

    constructor(imageOrUrl?: ImageType, public size:number = 16){
        super(imageOrUrl, false);
    }
}

export = PoiMaterial;