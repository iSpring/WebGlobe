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

    gl.clearColor(255, 255, 255, 1.0);
    //gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.DEPTH_TEST); //此处禁用深度测试是为了解决两个不同层级的切片在拖动时一起渲染会导致屏闪的问题
    gl.depthFunc(gl.LEQUAL);

    gl.enable(gl.CULL_FACE); //一定要启用裁剪，否则显示不出立体感
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK); //裁剪掉背面

    //gl.enable(gl.TEXTURE_2D);//WebGL: INVALID_ENUM: enable: invalid capability
  }

  render(scene: Scene, camera: PerspectiveCamera) {
    Kernel.gl.viewport(0, 0, Kernel.canvas.width, Kernel.canvas.height);
    Kernel.gl.clear(Kernel.gl.COLOR_BUFFER_BIT | Kernel.gl.DEPTH_BUFFER_BIT);
    camera.viewMatrix = null;
    //update viewMatrix and projViewMatrix of camera
    camera.viewMatrix = camera.getViewMatrix();
    camera.projViewMatrix = camera.projMatrix.multiplyMatrix(camera.viewMatrix);
    scene.draw(camera);
  }

  bindScene(scene: Scene) {
    this.scene = scene;
  }

  bindCamera(camera: PerspectiveCamera) {
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