import {WebGLRenderingContextExtension} from './Definitions';

const REAL_EARTH_RADIUS = 6378137;//meters
const EARTH_RADIUS = 500;
const SCALE_FACTOR = EARTH_RADIUS / REAL_EARTH_RADIUS;
const MAX_PROJECTED_COORD = Math.PI * EARTH_RADIUS;
const MAX_REAL_RESOLUTION = 156543.03392800014;
const MAX_RESOLUTION = MAX_REAL_RESOLUTION * SCALE_FACTOR;

export default class Kernel{
    static gl: WebGLRenderingContextExtension = null;
    static idCounter: number = 0;
    static readonly version: string = "0.5.4";
    static readonly SCALE_FACTOR: number = SCALE_FACTOR;
    static readonly REAL_EARTH_RADIUS: number = REAL_EARTH_RADIUS;
    static readonly EARTH_RADIUS: number = EARTH_RADIUS;
    static readonly MAX_RESOLUTION: number = MAX_RESOLUTION;
    static readonly MAX_REAL_RESOLUTION: number = MAX_REAL_RESOLUTION;
    static readonly MAX_PROJECTED_COORD: number = MAX_PROJECTED_COORD;
    static readonly BASE_LEVEL: number = 6; //渲染的基准层级，从该层级开始segment为1
    static readonly MAX_LEVEL: number = 18;
    static readonly MIN_LEVEL: number = 2;
    static readonly MIN_PITCH_LEVEL: number = 8;
    static readonly proxy: string = "";
};