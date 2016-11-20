///<amd-module name="world/Renderer"/>
import Kernel = require("./Kernel");
import EventUtils = require("./Event");
import Scene = require("./Scene");
import PerspectiveCamera = require("./PerspectiveCamera");
import {WebGLRenderingContextExtension, WebGLProgramExtension} from "./Definitions";

class Renderer {
  scene: Scene = null;
  camera: PerspectiveCamera = null;
  bAutoRefresh: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    //之所以在此处设置Kernel.renderer是因为要在tick函数中使用
    Kernel.renderer = this;

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
      alert("浏览器不支持WebGL或将WebGL禁用!");
      console.debug("浏览器不支持WebGL或将WebGL禁用!");
      return;
    }

    Kernel.gl.clear(Kernel.gl.COLOR_BUFFER_BIT | Kernel.gl.DEPTH_BUFFER_BIT);
    gl.clearColor(255, 255, 255, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);

    gl.enable(gl.CULL_FACE); //一定要启用裁剪，否则显示不出立体感
    gl.frontFace(gl.CCW);//指定逆时针方向为正面
    gl.cullFace(gl.BACK); //裁剪掉背面

    //gl.enable(gl.TEXTURE_2D);//WebGL: INVALID_ENUM: enable: invalid capability
  }

  render(scene: Scene, camera: PerspectiveCamera) {
    Kernel.gl.viewport(0, 0, Kernel.canvas.width, Kernel.canvas.height);
    Kernel.gl.clear(Kernel.gl.COLOR_BUFFER_BIT | Kernel.gl.DEPTH_BUFFER_BIT);
    Kernel.gl.enable(Kernel.gl.DEPTH_TEST);
    Kernel.gl.depthFunc(Kernel.gl.LEQUAL);
    Kernel.gl.depthMask(true);
    camera.viewMatrix = null;
    //update viewMatrix and projViewMatrix of camera
    camera.updateProjViewMatrix();
    scene.draw(camera);
  }

  setScene(scene: Scene) {
    this.scene = scene;
  }

  setCamera(camera: PerspectiveCamera) {
    this.camera = camera;
  }

  tick() {
    if (Kernel.renderer instanceof Renderer) {
      if (Kernel.renderer.scene && Kernel.renderer.camera) {
        Kernel.renderer.render(Kernel.renderer.scene, Kernel.renderer.camera);
      }

      if (Kernel.renderer.bAutoRefresh) {
        window.requestAnimationFrame(Kernel.renderer.tick);
      }
    }
  }

  setIfAutoRefresh(bAuto: boolean) {
    this.bAutoRefresh = bAuto;
    if (this.bAutoRefresh) {
      this.tick();
    }
  }
}

export = Renderer;