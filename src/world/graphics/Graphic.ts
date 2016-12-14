///<amd-module name="world/graphics/Graphic"/>

import Kernel = require('../Kernel');
import {Drawable} from '../Definitions.d';
import Geometry = require('../geometries/Geometry');
import Material = require('../materials/Material');
import Program = require('../Program');
import Camera from '../Camera';
import GraphicGroup = require('../GraphicGroup');


abstract class Graphic implements Drawable{
    id: number;
    visible: boolean = true;
    parent: GraphicGroup<Drawable>;
    program: Program;

    constructor(public geometry: Geometry = null, public material: Material = null){
        this.id = ++Kernel.idCounter;
        this.parent = null;
        this.program = this.createProgram();
    }

    setVisible(visible: boolean){
        this.visible = visible;
    }

    abstract createProgram(): Program

    isReady(): boolean{
        return !!(this.geometry && this.material && this.material.isReady());
    }

    shouldDraw(): boolean{
        return this.visible && this.isReady();
    }

    draw(camera: Camera){
        if(this.shouldDraw()){
            this.program.use();
            this.onDraw(camera);
        }
    }

    protected abstract onDraw(camera: Camera):void

    destroy(){
        this.parent = null;
        if(this.geometry){
            this.geometry.destroy();
        }
        if(this.material){
            this.material.destroy();
        }
        this.geometry = null;
        this.material = null;
    }
}

export = Graphic;