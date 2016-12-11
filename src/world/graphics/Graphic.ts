///<amd-module name="world/graphics/Graphic"/>

import Kernel = require("../Kernel");
import Geometry = require("../geometries/Geometry");
import Material = require("../materials/Material");
import Program = require("../Program");
import Camera from "../Camera";
import GraphicGroup = require("../GraphicGroup");

interface GraphicOptions{
    geometry: Geometry;
    material: Material;
    parent: GraphicGroup;
    visible?: boolean;
}

abstract class Graphic{
    id: number;
    visible: boolean = true;
    parent: GraphicGroup;
    program: Program;

    constructor(public geometry: Geometry, public material: Material){
        this.id = ++Kernel.idCounter;
        this.parent = null;
        this.program = this.createProgram();
    }

    setVisible(visible: boolean){
        this.visible = visible;
    }

    abstract createProgram(): Program

    isReady(): boolean{
        return this.geometry && this.material && this.material.isReady();
    }

    isDrawable(): boolean{
        return this.visible &&  this.isReady();
    }

    draw(camera: Camera){
        if(this.isDrawable()){
            this.program.use();
            this.onDraw(camera);
        }
    }

    abstract onDraw(camera: Camera):void

    destroy(){
        this.parent = null;
        //释放显卡中的资源
        this.geometry.destroy();
        this.material.destroy();
        this.geometry = null;
        this.material = null;
    }
}

export = Graphic;