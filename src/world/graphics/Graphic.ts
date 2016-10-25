///<amd-module name="world/graphics/Graphic"/>

import Kernel = require("../Kernel");
import Geometry = require("../geometries/Geometry");
import Material = require("../materials/Material");
import Program = require("../Program");
import PerspectiveCamera = require("../PerspectiveCamera");

interface GraphicOptions{
    geometry: Geometry;
    material: Material;
    parent: any;
    visible?: boolean;
}

abstract class Graphic{
    id:number;
    ready: boolean = false;
    visible: boolean = true;
    parent: any;

    constructor(public geometry: Geometry, public material: Material){
        this.id = ++Kernel.idCounter;
        this.parent = null;
    }

    setVisible(visible: boolean){
        this.visible = visible;
    }

    getProgramType() {
        return this.material.getType();
    }

    isDrawable(): boolean{
        if(!this.visible || !this.material.isReady() || !this.ready){
            return false;
        }
        return true;
    }

    //need to be override
    abstract createProgram(): Program

    // //need to be override
    abstract draw(program: Program, camera: PerspectiveCamera)

    destroy(){
        this.parent = null;
        //释放显卡中的资源
        this.geometry.destroy();
        this.material.destroy();
        this.geometry = null;
        this.material = null;
        this.ready = false;
    }
}

export = Graphic;