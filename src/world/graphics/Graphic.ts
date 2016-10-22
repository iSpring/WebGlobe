///<amd-module name="world/graphics/Graphic"/>

import Kernel = require("../Kernel");
import Geometry = require("../geometries/Geometry");
import Material = require("../materials/Material");

interface GraphicOptions{
    geometry: Geometry;
    material: Material;
    parent: any;
    visible?: boolean;
}

class Graphic{
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

    //need to be override
    createProgram(): any{
        return null;
    }

    // onBeforeDraw(){}

    // _draw(program, camera, scene){
    //     if(!program || !this.visible || !this.isReady || !this.material.isReady){
    //         return;
    //     }

    //     this.onBeforeDraw(program, camera, scene);
    //     this.draw(program, camera, scene);
    //     this.onAfterDraw(program, camera, scene);
    // }

    // //need to be override
    // draw(){}

    // onAfterDraw(){}

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