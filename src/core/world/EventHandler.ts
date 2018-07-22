import Kernel from './Kernel';
import Utils from './Utils';
import MathUtils from './math/Utils';
import Vector from './math/Vector';
import Globe from './Globe';
import {Destroyable} from './Definitions.d';

type DomEventListener = () => any;

export default class EventHandler implements Destroyable {
  private down: boolean = false;
  private dragGeo: any = null;
  private previousX: number = -1;//对于PC浏览器存储offsetX，对于移动浏览器存储pageX
  private previousY: number = -1;
  private twoTouchDistance: number = -1;
  private oldTime: number = -1;
  private lastTime: number = -1;
  private startTime: number = -1;
  private endTime: number = -1;
  private resizeListener: DomEventListener = null;
  private bodyKeydownListener: DomEventListener = null;

  constructor(private globe: Globe) {
    this.endTime = this.startTime = this.lastTime = this.oldTime = Date.now();
    this._bindEvents();
  }

  destroy(){
    // const eventNames = ["touchstart", "touchend", "touchmove", "mousedown", "mouseup", "mousemove", "dblclick", "mousewheel", "DOMMouseScroll"];
    // eventNames.forEach((eventName) => {
    //   this.globe.canvas.removeEventListener(eventName);
    // });
    if(this.bodyKeydownListener){
      document.body.removeEventListener("keydown", this.bodyKeydownListener);
    }
    this.bodyKeydownListener = null;
    this.globe = null;
  }

  private _bindEvents() {
    if (Utils.isMobile()) {
      this.globe.canvas.addEventListener("touchstart", this._onTouchStart.bind(this), false);
      this.globe.canvas.addEventListener("touchend", this._onTouchEnd.bind(this), false);
      this.globe.canvas.addEventListener("touchmove", this._onTouchMove.bind(this), false);
    } else {
      this.globe.canvas.addEventListener("mousedown", this._onMouseDown.bind(this), false);
      this.globe.canvas.addEventListener("mouseup", this._onMouseUp.bind(this), false);
      this.globe.canvas.addEventListener("mousemove", this._onMouseMove.bind(this), false);
      this.globe.canvas.addEventListener("click", this._onClick.bind(this), false);
      this.globe.canvas.addEventListener("dblclick", this._onDbClick.bind(this), false);
      this.globe.canvas.addEventListener("mousewheel", this._onMouseWheel.bind(this), false);
      this.globe.canvas.addEventListener("DOMMouseScroll", this._onMouseWheel.bind(this), false);
      this.bodyKeydownListener = this._onKeyDown.bind(this);
      document.body.addEventListener("keydown", this.bodyKeydownListener, false);
    }
  }

  moveLonLatToCanvas(lon: number, lat: number, canvasX: number, canvasY: number) {
    var pickResult = this.globe.camera.getPickCartesianCoordInEarthByCanvas(canvasX, canvasY);
    if (pickResult.length > 0) {
      var newLonLat = MathUtils.cartesianCoordToGeographic(pickResult[0]);
      var newLon = newLonLat[0];
      var newLat = newLonLat[1];
      this._moveGeo(lon, lat, newLon, newLat);
    }
  }

  private _moveGeo(oldLon: number, oldLat: number, newLon: number, newLat: number) {
    if (oldLon === newLon && oldLat === newLat) {
      return;
    }
    var p1 = MathUtils.geographicToCartesianCoord(oldLon, oldLat);
    var v1 = Vector.fromVertice(p1);
    var p2 = MathUtils.geographicToCartesianCoord(newLon, newLat);
    var v2 = Vector.fromVertice(p2);
    var rotateVector = v1.cross(v2);
    var rotateRadian = -Vector.getRadianOfTwoVectors(v1, v2);
    this.globe.camera.worldRotateByVector(rotateRadian, rotateVector);
  }

  //单击时进行拾取
  private _handleSingleClick(canvasX: number, canvasY: number){
    this.globe.pick(canvasX, canvasY);
  }

  private _handleMouseDownOrTouchStart(offsetX: number, offsetY: number) {
    this.down = true;
    this.previousX = offsetX;
    this.previousY = offsetY;
    var pickResult = this.globe.camera.getPickCartesianCoordInEarthByCanvas(this.previousX, this.previousY);
    if (pickResult.length > 0) {
      this.dragGeo = MathUtils.cartesianCoordToGeographic(pickResult[0]);
    }
  }

  private _handleMouseMoveOrTouchMove(currentX: number, currentY: number) {
    var globe = this.globe;
    if (!globe || globe.isAnimating() || !this.down) {
      return;
    }
    var pickResult = globe.camera.getPickCartesianCoordInEarthByCanvas(currentX, currentY);
    if (pickResult.length > 0) {
      //mouse in Earth
      if (this.dragGeo) {
        var newGeo = MathUtils.cartesianCoordToGeographic(pickResult[0]);
        this._moveGeo(this.dragGeo[0], this.dragGeo[1], newGeo[0], newGeo[1]);
      } else {
        //go to Earth part
        this.dragGeo = MathUtils.cartesianCoordToGeographic(pickResult[0]);
      }
      this.previousX = currentX;
      this.previousY = currentY;
      this.globe.canvas.style.cursor = "pointer";
    } else {
      //mouse out of Earth
      this.previousX = -1;
      this.previousY = -1;
      this.dragGeo = null;
      this.globe.canvas.style.cursor = "default";
    }
  }

  private _handleMouseUpOrTouchEnd() {
    this.down = false;
    this.previousX = -1;
    this.previousY = -1;
    this.dragGeo = null;
    if (this.globe.canvas) {
      this.globe.canvas.style.cursor = "default";
    }
    Utils.publish("extent-change");
  }

  private _onMouseDown(event: MouseEvent) {
    var globe = this.globe;
    if (!globe || globe.isAnimating()) {
      return;
    }
    var previousX = event.layerX || event.offsetX;
    var previousY = event.layerY || event.offsetY;
    this._handleMouseDownOrTouchStart(previousX, previousY);
  }

  private _onMouseMove(event: MouseEvent) {
    if(!this.down){
      return;
    }
    if(this.globe.isAnimating()){
      return;
    }
    var currentX = event.layerX || event.offsetX;
    var currentY = event.layerY || event.offsetY;
    this._handleMouseMoveOrTouchMove(currentX, currentY);
  }

  private _onMouseUp() {
    this._handleMouseUpOrTouchEnd();
  }

  private _onClick(event: MouseEvent){
    var absoluteX = event.layerX || event.offsetX;
    var absoluteY = event.layerY || event.offsetY;
    this._handleSingleClick(absoluteX, absoluteY);
  }

  private _onDbClick(event: MouseEvent) {
    var globe = this.globe;
    if (!globe || globe.isAnimating()) {
      return;
    }

    var absoluteX = event.layerX || event.offsetX;
    var absoluteY = event.layerY || event.offsetY;
    var pickResult = globe.camera.getPickCartesianCoordInEarthByCanvas(absoluteX, absoluteY);
    // globe.setLevel(globe.getLevel() + 1);
    globe.zoomIn();
    if (pickResult.length >= 1) {
      var pickVertice = pickResult[0];
      var lonlat = MathUtils.cartesianCoordToGeographic(pickVertice);
      var lon = lonlat[0];
      var lat = lonlat[1];
      // globe.setLevel(globe.getLevel() + 1);
      globe.zoomIn();
      this.moveLonLatToCanvas(lon, lat, absoluteX, absoluteY);
    }
  }

  private _onMouseWheel(event: MouseWheelEvent) {
    var globe = this.globe;
    if (!globe || globe.isAnimating()) {
      return;
    }

    var deltaLevel = 0;
    var delta: number;
    if (event.wheelDelta) {
      delta = event.wheelDelta;
      deltaLevel = parseInt(<any>(delta / 120));
    } else if (event.detail) {
      //Firefox
      delta = event.detail;
      deltaLevel = -parseInt(<any>(delta / 3));
    }
    var newLevel = globe.getLevel() + deltaLevel;
    if (newLevel >= 0) {
      //globe.setLevel(newLevel);
      globe.animateToLevel(newLevel, function(){
        Utils.publish("extent-change");
      });
    }
  }

  private _onKeyDown(event: KeyboardEvent) {
    var globe = this.globe;
    if (!globe || globe.isAnimating()) {
      return;
    }

    var DELTA_PITCH = 2;
    var camera = globe.camera;
    var keyNum = event.keyCode !== undefined ? event.keyCode : event.which;
    //up、down、left、right:38、40、37、39
    if (keyNum === 38) {
      //up
      camera.setDeltaPitch(DELTA_PITCH);
    } else if (keyNum === 40) {
      //down
      camera.setDeltaPitch(-DELTA_PITCH);
    }
  }

  //--------------------------------------------------------------------------------------

  private _onTouchZero(event: TouchEvent){
    this.twoTouchDistance = -1;
    const previousX = this.previousX;
    const previousY = this.previousY;
    this._handleMouseUpOrTouchEnd();
    this.endTime = Date.now();
    var time = this.endTime - this.startTime;
    if (time <= 200) {
      var time2 = this.endTime - this.lastTime;
      if (time2 < 300) {
        //相当于双击
        this.lastTime = this.oldTime;
        this.globe.zoomIn();
      }else {
        //相当于单击
        this.lastTime = this.endTime;
        //此时event.targetTouches为空数组
        const {left, top} = this.globe.canvas.getBoundingClientRect();
        const canvasX = previousX - left;
        const canvasY = previousY - top;
        this._handleSingleClick(canvasX, canvasY);
      }
    }
  }

  private _onTouchOne(event: TouchEvent){
    this.twoTouchDistance = -1;
    var touch = event.targetTouches[0];
    var previousX = touch.pageX;
    var previousY = touch.pageY;
    this._handleMouseDownOrTouchStart(previousX, previousY);
    this.startTime = Date.now();
  }

  private _onTouchTwo(event: TouchEvent){
    this.down = true;
    this.previousX = -1;
    this.previousY = -1;
    this.dragGeo = null;
    var touch1 = event.targetTouches[0];
    var x1 = touch1.pageX;
    var y1 = touch1.pageY;
    var touch2 = event.targetTouches[1];
    var x2 = touch2.pageX;
    var y2 = touch2.pageY;
    this.twoTouchDistance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }

  private _onTouchMulti(){
    this.down = true;
    this.previousX = -1;
    this.previousY = -1;
    this.dragGeo = null;
    this.twoTouchDistance = -1;
  }

  private _onTouchStart(event: TouchEvent) {
    var globe = this.globe;
    if (!globe || globe.isAnimating()) {
      return;
    }

    var touchCount = event.targetTouches.length;
    if (touchCount === 0) {
      this._onTouchZero(event);
    }else if(touchCount === 1){
      this._onTouchOne(event);
    }else if(touchCount === 2){
      this._onTouchTwo(event);
    }else{
      this._onTouchMulti();
    }
  }

  private _onTouchMoveOne(event: TouchEvent){
    var touch = event.targetTouches[0];
    var currentX = touch.pageX;
    var currentY = touch.pageY;
    this._handleMouseMoveOrTouchMove(currentX, currentY);
  }

  private _onTouchMoveTwo(event: TouchEvent){
    var touch1 = event.targetTouches[0];
    var x1 = touch1.pageX;
    var y1 = touch1.pageY;
    var touch2 = event.targetTouches[1];
    var x2 = touch2.pageX;
    var y2 = touch2.pageY;
    var twoTouchDistance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    var radio = twoTouchDistance / this.twoTouchDistance;
    if(radio >= 1.3){
      this.globe.animateIn(()=>{
        this.twoTouchDistance = twoTouchDistance;
      });
    }else if(radio <= 0.7){
      this.globe.animateOut(()=>{
        this.twoTouchDistance = twoTouchDistance;
      });
    }
  }

  private _onTouchMove(event: TouchEvent) {
    event.preventDefault();
    if(!this.down){
      return;
    }
    if(this.globe.isAnimating()){
      return;
    }
    var touchCount = event.targetTouches.length;
    if(touchCount === 1){
      this._onTouchMoveOne(event);
    }else if(touchCount === 2){
      this._onTouchMoveTwo(event);
    }
  }

  private _onTouchEnd(event: TouchEvent) {
    var touchCount = event.targetTouches.length;
    if (touchCount === 0) {
      this._onTouchZero(event);
    }else if(touchCount === 1){
      this._onTouchOne(event);
    }else if(touchCount === 2){
      this._onTouchTwo(event);
    }else{
      this._onTouchMulti();
    }
  }
};