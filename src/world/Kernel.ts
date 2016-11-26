///<amd-module name="world/Kernel"/>
import {WebGLRenderingContextExtension} from './Definitions';
import Globe = require("./Globe");
import Renderer = require("./Renderer");

const radius = 500;//6378137
const maxProjectedCoord = Math.PI * radius;

const Kernel = {
    gl: <WebGLRenderingContextExtension>null,
    canvas: <HTMLCanvasElement> null,
    renderer: <Renderer>null,
    globe: <Globe>null,
    idCounter: 0, //Object3D对象的唯一标识
    BASE_LEVEL: 6, //渲染的基准层级
    MAX_LEVEL: 14,//最大的渲染级别
    EARTH_RADIUS: radius,
    MAX_PROJECTED_COORD: maxProjectedCoord,
    proxy: ""
};

export = Kernel;