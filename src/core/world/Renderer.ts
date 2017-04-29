import Kernel from './Kernel';
import Scene from './Scene';
import Camera from './Camera';
import { WebGLRenderingContextExtension } from "./Definitions";

export default class Renderer {
  scene: Scene = null;
  camera: Camera = null;
  renderingPaused: boolean = true;
  gl: WebGLRenderingContextExtension = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private onBeforeRender?: (renderer: Renderer) => void,
    private onAfterRender?: (renderer: Renderer) => void) {

    this.gl = this._getWebGLContext(this.canvas);

    Kernel.gl = this.gl;

    if(!this.gl){
      console.debug("浏览器不支持WebGL或将WebGL禁用!");
    }

    const gl = this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0, 0, 0, 1);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);//允许写入深度

    gl.enable(gl.CULL_FACE); //一定要启用裁剪，否则显示不出立体感
    gl.frontFace(gl.CCW);//指定逆时针方向为正面
    gl.cullFace(gl.BACK); //裁剪掉背面

    //gl.enable(gl.TEXTURE_2D);//WebGL: INVALID_ENUM: enable: invalid capability
  }

  private _getWebGLContext(canvas: HTMLCanvasElement) {
    var gl: WebGLRenderingContextExtension = null;

    try {
      var contextList: string[] = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
      for (var i = 0; i < contextList.length; i++) {
        gl = canvas.getContext(contextList[i], {
          antialias: true
        }) as WebGLRenderingContextExtension;
        if (gl) {
          break;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return gl;
  }

  render(scene: Scene, camera: Camera) {
    var gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0, 0, 0, 1);
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);
    // gl.depthMask(true);
    
    try{
      camera.update();
    }catch(e){
      console.error(e);
    }

    try{
      if (this.onBeforeRender) {
        this.onBeforeRender(this);
      }
    }catch(e){
      console.error(e);
    }

    try{
      if(!this.renderingPaused){
        scene.draw(camera);
      }
    }catch(e){
      console.error(e);
    }

    try{
      if (this.onAfterRender) {
        this.onAfterRender(this);
      }
    }catch(e){
      console.error(e);
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

    window.requestAnimationFrame(this._tick.bind(this));
  }

  isRenderingPaused(){
    return this.renderingPaused;
  }

  pauseRendering(){
    this.renderingPaused = true;
  }

  resumeRendering(){
    this.renderingPaused = false;
    this._tick();
  }
};