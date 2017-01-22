import {WebGLRenderingContextExtension} from './Definitions';
import Globe = require("./Globe");
import Renderer = require("./Renderer");

const EARTH_RADIUS = 500;//6378137
const MAX_PROJECTED_COORD = Math.PI * EARTH_RADIUS;
const MAX_LAST_LEVEL:number = 18;
const DELTA_LEVEL_BETWEEN_LAST_LEVEL_AND_CURRENT_LEVEL:number = 3;
const MAX_LEVEL:number = MAX_LAST_LEVEL - DELTA_LEVEL_BETWEEN_LAST_LEVEL_AND_CURRENT_LEVEL;

class Kernel{
    static gl:WebGLRenderingContextExtension = null;
    static canvas:HTMLCanvasElement = null;
    static globe:Globe = null;
    static idCounter:number = 0; //Object3D对象的唯一标识
    static readonly EARTH_RADIUS:number = EARTH_RADIUS;
    static readonly MAX_PROJECTED_COORD:number = MAX_PROJECTED_COORD;
    static readonly BASE_LEVEL:number = 6; //渲染的基准层级，从该层级开始segment为1
    static readonly MAX_LEVEL:number = MAX_LEVEL;
    static readonly MAX_LAST_LEVEL:number = MAX_LAST_LEVEL;
    static readonly EARTH_FULL_OVERLAP_SCREEN_LEVEL:number = 3;//从该层级开始，地球全部铺满Canvas
    static readonly DELTA_LEVEL_BETWEEN_LAST_LEVEL_AND_CURRENT_LEVEL:number = DELTA_LEVEL_BETWEEN_LAST_LEVEL_AND_CURRENT_LEVEL;
    static readonly proxy:string = "";
}

export = Kernel;