///<amd-module name="world/materials/PoiMaterial"/>

import Material = require("./Material");

class PoiMaterial implements Material{
    
    isReady(){
        return true;
    }

    getType(){
        return "PoiMaterial";
    }

    destroy(){

    }
}

export = PoiMaterial;