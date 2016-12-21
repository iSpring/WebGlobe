///<amd-module name="world/Renderer"/>
import Kernel = require("./Kernel");
import EventUtils = require("./Event");
import Scene = require("./Scene");
import Camera from "./Camera";
import { WebGLRenderingContextExtension, WebGLProgramExtension } from "./Definitions";

class Renderer {
  scene: Scene = null;
  camera: Camera = null;
  autoRefresh: boolean = false;

  constructor(
    private canvas: HTMLCanvasElement, 
    private onBeforeRender?: (renderer: Renderer) => void,
    private onAfterRender?: (renderer: Renderer) => void) {

    EventUtils.bindEvents(canvas);

    var gl: WebGLRenderingContextExtension;

    function initWebGL(canvas: HTMLCanvasElement) {
      try {
        var contextList = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        for (var i = 0; i < contextList.length; i++) {
          gl = canvas.getContext(contextList[i], {
            antialias: true
          }) as WebGLRenderingContextExtension;
          if (gl) {
            Kernel.gl = gl;
            (<any>window).gl = gl;
            Kernel.canvas = canvas;
            break;
          }
        }
      } catch (e) { }
    }

    initWebGL(canvas);

    if (!gl) {
      console.debug("浏览器不支持WebGL或将WebGL禁用!");
      return;
    }

    Kernel.gl.clear(Kernel.gl.COLOR_BUFFER_BIT | Kernel.gl.DEPTH_BUFFER_BIT);
    gl.clearColor(255, 255, 255, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);//允许写入深度

    gl.enable(gl.CULL_FACE); //一定要启用裁剪，否则显示不出立体感
    gl.frontFace(gl.CCW);//指定逆时针方向为正面
    gl.cullFace(gl.BACK); //裁剪掉背面

    //gl.enable(gl.TEXTURE_2D);//WebGL: INVALID_ENUM: enable: invalid capability
  }

  render(scene: Scene, camera: Camera) {
    var gl = Kernel.gl;
    var canvas = Kernel.canvas;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0, 0, 0, 1);
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);
    // gl.depthMask(true);
    camera.update();
    if(this.onBeforeRender){
      this.onBeforeRender(this);
    }
    scene.draw(camera);
    if(this.onAfterRender){
      this.onAfterRender(this);
    }
  }

  setScene(scene: Scene) {
    this.scene = scene;
  }

  setCamera(camera: Camera) {
    this.camera = camera;
  }

  private _tick() {
    if (this.scene && this.camera) {
      this.render(this.scene, this.camera);
    }

    if (this.autoRefresh) {
      window.requestAnimationFrame(this._tick.bind(this));
    }
  }

  setIfAutoRefresh(auto: boolean) {
    this.autoRefresh = auto;
    if (this.autoRefresh) {
      this._tick();
    }
  }
}

export = Renderer;