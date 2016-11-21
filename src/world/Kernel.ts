///<amd-module name="world/Kernel"/>
import {WebGLRenderingContextExtension} from './Definitions';
import Globe = require("./Globe");
import Renderer = require("./Renderer");

const Kernel = {
    gl: <WebGLRenderingContextExtension>null,
    canvas: <HTMLCanvasElement> null,
    renderer: <Renderer>null,
    globe: <Globe>null,
    idCounter: 0, //Object3D对象的唯一标识
    BASE_LEVEL: 6, //渲染的基准层级
    EARTH_RADIUS: 637.8137,//6378137
    MAX_PROJECTED_COORD: 2003.75083427892,//20037508.3427892
    proxy: ""
};

export = Kernel;