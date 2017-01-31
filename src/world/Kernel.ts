import {WebGLRenderingContextExtension} from './Definitions';
import Globe = require("./Globe");
import Renderer = require("./Renderer");

const REAL_EARTH_RADIUS = 6378137;
const EARTH_RADIUS = 500;
const SCALE_FACTOR = EARTH_RADIUS / REAL_EARTH_RADIUS;
const MAX_PROJECTED_COORD = Math.PI * EARTH_RADIUS;
const MAX_REAL_RESOLUTION = 156543.03392800014;
const MAX_RESOLUTION = MAX_REAL_RESOLUTION * SCALE_FACTOR;

class Kernel{
    static gl:WebGLRenderingContextExtension = null;
    static canvas:HTMLCanvasElement = null;
    static globe:Globe = null;
    static idCounter:number = 0; //Object3D对象的唯一标识
    static readonly version:string = "0.4.5";
    static readonly SCALE_FACTOR:number = SCALE_FACTOR;
    static readonly EARTH_RADIUS:number = EARTH_RADIUS;
    static readonly MAX_RESOLUTION:number = MAX_RESOLUTION;
    static readonly MAX_REAL_RESOLUTION: number = MAX_REAL_RESOLUTION;
    static readonly MAX_PROJECTED_COORD:number = MAX_PROJECTED_COORD;
    static readonly BASE_LEVEL:number = 6; //渲染的基准层级，从该层级开始segment为1
    static readonly MAX_LEVEL:number = 18;
    static readonly MIN_LEVEL:number = 2;
    static readonly proxy:string = "";
}

export = Kernel;