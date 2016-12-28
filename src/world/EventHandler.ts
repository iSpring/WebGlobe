///<amd-module name="world/Event" />

import Kernel = require("./Kernel");
import Utils = require("./Utils");
import MathUtils = require("./math/Utils");
import Vector = require("./math/Vector");
import Camera from "./Camera";

type MouseMoveListener = (e: MouseEvent) => {};

class EventHandler {
  private down: boolean = false;
  private dragGeo: any = null;
  private previousX: number = -1;
  private previousY: number = -1;
  private onMouseMoveListener: MouseMoveListener = null;
  private oldTime: number = -1;
  private lastTime: number = -1;
  private startTime: number = -1;
  private endTime: number = -1;

  constructor(private canvas: HTMLCanvasElement) {
    this.endTime = this.startTime = this.lastTime = this.oldTime = Date.now();
    this._bindEvents();
    this._initLayout();
  }

  _bindEvents() {
    window.addEventListener("resize", this._initLayout.bind(this));
    if (Utils.isMobile()) {
      this.onMouseMoveListener = this._onTouchMove.bind(this);
      this.canvas.addEventListener("touchstart", this._onTouchStart.bind(this), false);
      this.canvas.addEventListener("touchend", this._onTouchEnd.bind(this), false);
    } else {
      this.onMouseMoveListener = this._onMouseMove.bind(this);
      this.canvas.addEventListener("mousedown", this._onMouseDown.bind(this));
      this.canvas.addEventListener("mouseup", this._onMouseUp.bind(this));
      this.canvas.addEventListener("dblclick", this._onDbClick.bind(this));
      this.canvas.addEventListener("mousewheel", this._onMouseWheel.bind(this));
      this.canvas.addEventListener("DOMMouseScroll", this._onMouseWheel.bind(this));
      document.body.addEventListener("keydown", this._onKeyDown.bind(this));
    }
  }

  _initLayout() {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    if (Kernel.globe) {
      Kernel.globe.camera.setAspect(this.canvas.width / this.canvas.height);
      // Kernel.globe.refresh();
    }
  }

  //将地球表面的某一点移动到Canvas上
  _moveLonLatToCanvas(lon: number, lat: number, canvasX: number, canvasY: number) {
    var pickResult = Kernel.globe.camera.getPickCartesianCoordInEarthByCanvas(canvasX, canvasY);
    if (pickResult.length > 0) {
      var newLonLat = MathUtils.cartesianCoordToGeographic(pickResult[0]);
      var newLon = newLonLat[0];
      var newLat = newLonLat[1];
      this._moveGeo(lon, lat, newLon, newLat);
    }
  }

  _moveGeo(oldLon: number, oldLat: number, newLon: number, newLat: number) {
    if (oldLon === newLon && oldLat === newLat) {
      return;
    }
    var p1 = MathUtils.geographicToCartesianCoord(oldLon, oldLat);
    var v1 = Vector.fromVertice(p1);
    var p2 = MathUtils.geographicToCartesianCoord(newLon, newLat);
    var v2 = Vector.fromVertice(p2);
    var rotateVector = v1.cross(v2);
    var rotateRadian = -Vector.getRadianOfTwoVectors(v1, v2);
    Kernel.globe.camera.worldRotateByVector(rotateRadian, rotateVector);
  }

  _handleMouseDownOrTouchStart(offsetX: number, offsetY: number) {
    this.down = true;
    this.previousX = offsetX;
    this.previousY = offsetY;
    var pickResult = Kernel.globe.camera.getPickCartesianCoordInEarthByCanvas(this.previousX, this.previousY);
    if (pickResult.length > 0) {
      this.dragGeo = MathUtils.cartesianCoordToGeographic(pickResult[0]);
    }
  }

  _handleMouseMoveOrTouchMove(currentX: number, currentY: number) {
    var globe = Kernel.globe;
    if (!globe || globe.isAnimating() || !this.down) {
      return;
    }
    var pickResult = globe.camera.getPickCartesianCoordInEarthByCanvas(currentX, currentY);
    if (pickResult.length > 0) {
      //鼠标在地球范围内
      if (this.dragGeo) {
        //鼠标拖动过程中要显示底图
        //globe.showAllSubTiledLayerAndTiles();
        var newGeo = MathUtils.cartesianCoordToGeographic(pickResult[0]);
        this._moveGeo(this.dragGeo[0], this.dragGeo[1], newGeo[0], newGeo[1]);
      } else {
        //进入地球内部
        this.dragGeo = MathUtils.cartesianCoordToGeographic(pickResult[0]);
      }
      this.previousX = currentX;
      this.previousY = currentY;
      this.canvas.style.cursor = "pointer";
    } else {
      //鼠标超出地球范围
      this.previousX = -1;
      this.previousY = -1;
      this.dragGeo = null;
      this.canvas.style.cursor = "default";
    }
  }

  _handleMouseUpOrTouchEnd() {
    this.down = false;
    this.previousX = -1;
    this.previousY = -1;
    this.dragGeo = null;
    if (this.canvas) {
      this.canvas.style.cursor = "default";
    }
  }

  _onMouseDown(event: MouseEvent) {
    var globe = Kernel.globe;
    if (!globe || globe.isAnimating()) {
      return;
    }
    var previousX = event.layerX || event.offsetX;
    var previousY = event.layerY || event.offsetY;
    this._handleMouseDownOrTouchStart(previousX, previousY);
    this.canvas.addEventListener("mousemove", this.onMouseMoveListener, false);
  }

  _onMouseMove(event: MouseEvent) {
    var currentX = event.layerX || event.offsetX;
    var currentY = event.layerY || event.offsetY;
    this._handleMouseMoveOrTouchMove(currentX, currentY);
  }

  _onMouseUp() {
    this._handleMouseUpOrTouchEnd();
    if (this.canvas) {
      this.canvas.removeEventListener("mousemove", this.onMouseMoveListener, false);
    }
  }

  _onTouchStart(event: TouchEvent) {
    var globe = Kernel.globe;
    if (!globe || globe.isAnimating()) {
      return;
    }
    if (event.targetTouches.length === 0) {
      return;
    }
    var touch = event.targetTouches[0];
    var previousX = touch.pageX;
    var previousY = touch.pageY;
    this._handleMouseDownOrTouchStart(previousX, previousY);
    this.canvas.addEventListener("touchmove", this.onMouseMoveListener, false);
    this.startTime = Date.now();
  }

  _onTouchMove(event: TouchEvent) {
    if (event.targetTouches.length === 0) {
      return;
    }
    var touch = event.targetTouches[0];
    var currentX = touch.pageX;
    var currentY = touch.pageY;
    this._handleMouseMoveOrTouchMove(currentX, currentY);
  }

  _onTouchEnd(event: TouchEvent) {
    this._handleMouseUpOrTouchEnd();
    if (this.canvas) {
      this.canvas.removeEventListener("touchmove", this.onMouseMoveListener, false);
    }
    this.endTime = Date.now();
    var time = this.endTime - this.startTime;
    //此处的200表示的是一次单击事件所需要的时间
    if (time <= 200) {
      var time2 = this.endTime - this.lastTime;
      //此处的300表示的是一次双击事件中的两次单击事件相隔的时间
      if (time2 < 300) {
        //alert("双击,time:"+time+",time2:"+time2);
        this.lastTime = this.oldTime;
        Kernel.globe.zoomIn();
      }
      else {
        this.lastTime = this.endTime;
      }
    }
  }

  _onDbClick(event: MouseEvent) {
    var globe = Kernel.globe;
    if (!globe || globe.isAnimating()) {
      return;
    }

    var absoluteX = event.layerX || event.offsetX;
    var absoluteY = event.layerY || event.offsetY;
    var pickResult = globe.camera.getPickCartesianCoordInEarthByCanvas(absoluteX, absoluteY);
    globe.setLevel(globe.getLevel() + 1);
    if (pickResult.length >= 1) {
      var pickVertice = pickResult[0];
      var lonlat = MathUtils.cartesianCoordToGeographic(pickVertice);
      var lon = lonlat[0];
      var lat = lonlat[1];
      globe.setLevel(globe.getLevel() + 1);
      this._moveLonLatToCanvas(lon, lat, absoluteX, absoluteY);
    }
  }

  _onMouseWheel(event: MouseWheelEvent) {
    var globe = Kernel.globe;
    if (!globe || globe.isAnimating()) {
      return;
    }

    var deltaLevel = 0;
    var delta: number;
    if (event.wheelDelta) {
      //非Firefox
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
      globe.animateToLevel(newLevel);
    }
  }

  /**
   * 通过向上和向下的键盘按键调整Camera视线方向的倾斜角度pitch
   * 初始pitch值为0
   */
  _onKeyDown(event: KeyboardEvent) {
    var globe = Kernel.globe;
    if (!globe || globe.isAnimating()) {
      return;
    }

    var DELTA_PITCH = 2;
    var camera = globe.camera;
    var keyNum = event.keyCode !== undefined ? event.keyCode : event.which;
    //上、下、左、右:38、40、37、39
    if (keyNum === 38) {
      //向上键
      camera.setDeltaPitch(DELTA_PITCH);
    } else if (keyNum === 40) {
      //向下键
      camera.setDeltaPitch(-DELTA_PITCH);
    }
  }
}

export = EventHandler;