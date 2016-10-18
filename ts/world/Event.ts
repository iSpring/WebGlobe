///<amd-module name="world/Event"/>
import Kernel = require("./Kernel");
import MathUtils = require("./Math");
import Vector = require("./Vector");
import PerspectiveCamera = require("./PerspectiveCamera");

type MouseMoveListener = (e: MouseEvent) => {};

const EventModule = {
  canvas: HTMLCanvasElement,
  bMouseDown: false,
  dragGeo: <any>null,
  previousX: -1,
  previousY: -1,
  onMouseMoveListener: <MouseMoveListener>null,

  bindEvents: function (canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.onMouseMoveListener = this.onMouseMove.bind(this);
    window.addEventListener("resize", this.initLayout.bind(this));
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.addEventListener("dblclick", this.onDbClick.bind(this));
    this.canvas.addEventListener("mousewheel", this.onMouseWheel.bind(this));
    this.canvas.addEventListener("DOMMouseScroll", this.onMouseWheel.bind(this));
    document.body.addEventListener("keydown", this.onKeyDown.bind(this));
  },

  initLayout: function () {
    if (this.canvas instanceof HTMLCanvasElement) {
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
      if (Kernel.globe) {
        Kernel.globe.camera.setAspect(this.canvas.width / this.canvas.height);
        Kernel.globe.refresh();
      }
    }
  },

  //将地球表面的某一点移动到Canvas上
  moveLonLatToCanvas(lon: number, lat: number, canvasX: number, canvasY: number) {
    var pickResult = Kernel.globe.camera.getPickCartesianCoordInEarthByCanvas(canvasX, canvasY);
    if (pickResult.length > 0) {
      var newLonLat = MathUtils.cartesianCoordToGeographic(pickResult[0]);
      var newLon = newLonLat[0];
      var newLat = newLonLat[1];
      this.moveGeo(lon, lat, newLon, newLat);
    }
  },

  onMouseDown(event: MouseEvent) {
    if (Kernel.globe) {
      this.bMouseDown = true;
      this.previousX = event.layerX || event.offsetX;
      this.previousY = event.layerY || event.offsetY;
      var pickResult = Kernel.globe.camera.getPickCartesianCoordInEarthByCanvas(this.previousX, this.previousY);
      if (pickResult.length > 0) {
        this.dragGeo = MathUtils.cartesianCoordToGeographic(pickResult[0]);
        console.log("单击点三维坐标:(" + pickResult[0].x + "," + pickResult[0].y + "," + pickResult[0].z + ");经纬度坐标:[" + this.dragGeo[0] + "," + this.dragGeo[1] + "]");
      }
      this.canvas.addEventListener("mousemove", this.onMouseMoveListener, false);
    }
  },

  onMouseMove(event: MouseEvent) {
    var globe = Kernel.globe;
    if (globe && this.bMouseDown) {
      var currentX = event.layerX || event.offsetX;
      var currentY = event.layerY || event.offsetY;
      var pickResult = globe.camera.getPickCartesianCoordInEarthByCanvas(currentX, currentY);
      if (pickResult.length > 0) {
        //鼠标在地球范围内
        if (this.dragGeo) {
          //鼠标拖动过程中要显示底图
          //globe.showAllSubTiledLayerAndTiles();
          var newGeo = MathUtils.cartesianCoordToGeographic(pickResult[0]);
          this.moveGeo(this.dragGeo[0], this.dragGeo[1], newGeo[0], newGeo[1]);
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
  },

  moveGeo(oldLon: number, oldLat: number, newLon: number, newLat: number) {
    if(oldLon === newLon && oldLat === newLat){
      return;
    }
    var p1 = MathUtils.geographicToCartesianCoord(oldLon, oldLat);    
    var v1 = Vector.verticeAsVector(p1);
    v1.normalize();
    var p2 = MathUtils.geographicToCartesianCoord(newLon, newLat);
    var v2 = Vector.verticeAsVector(p2);
    v2.normalize();
    var rotateVector = v1.cross(v2);
    var rotateRadian = -Math.acos(v1.dot(v2));
    var camera: PerspectiveCamera = Kernel.globe.camera;
    camera.worldRotateByVector(rotateRadian, rotateVector);
  },

  onMouseUp() {
    this.bMouseDown = false;
    this.previousX = -1;
    this.previousY = -1;
    this.dragGeo = null;
    if (this.canvas instanceof HTMLCanvasElement) {
      this.canvas.removeEventListener("mousemove", this.onMouseMoveListener, false);
      this.canvas.style.cursor = "default";
    }
  },

  onDbClick(event: MouseEvent) {
    var globe = Kernel.globe;
    if (globe) {
      var absoluteX = event.layerX || event.offsetX;
      var absoluteY = event.layerY || event.offsetY;
      var pickResult = globe.camera.getPickCartesianCoordInEarthByCanvas(absoluteX, absoluteY);
      globe.setLevel(globe.CURRENT_LEVEL + 1);
      if (pickResult.length >= 1) {
        var pickVertice = pickResult[0];
        var lonlat = MathUtils.cartesianCoordToGeographic(pickVertice);
        var lon = lonlat[0];
        var lat = lonlat[1];
        globe.setLevel(globe.CURRENT_LEVEL + 1);
        this.moveLonLatToCanvas(lon, lat, absoluteX, absoluteY);
      }
    }
  },

  onMouseWheel(event: MouseWheelEvent) {
    var globe = Kernel.globe;
    if (!globe) {
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
    var newLevel = globe.CURRENT_LEVEL + deltaLevel;
    globe.setLevel(newLevel);
  },

  onKeyDown(event: KeyboardEvent) {
    var globe = Kernel.globe;
    if (!globe) {
      return;
    }

    var MIN_PITCH = 36;
    var DELTA_PITCH = 2;
    var camera = globe.camera;
    var keyNum = event.keyCode !== undefined ? event.keyCode : event.which;
    //上、下、左、右:38、40、37、39
    if (keyNum == 38 || keyNum == 40) {
      if (keyNum == 38) {
        if (camera.pitch <= MIN_PITCH) {
          return;
        }
      } else if (keyNum == 40) {
        if (camera.pitch >= 90) {
          return;
        }
        DELTA_PITCH *= -1;
      }

      var pickResult = camera.getDirectionIntersectPointWithEarth();
      if (pickResult.length > 0) {
        var pIntersect = pickResult[0];
        var pCamera = camera.getPosition();
        var legnth2Intersect = MathUtils.getLengthFromVerticeToVertice(pCamera, pIntersect);
        var mat = camera.matrix.copy();
        mat.setColumnTrans(pIntersect.x, pIntersect.y, pIntersect.z);
        var DELTA_RADIAN = MathUtils.degreeToRadian(DELTA_PITCH);
        mat.localRotateX(DELTA_RADIAN);
        var dirZ = Vector.verticeAsVector(mat.getColumnZ());
        dirZ.setLength(legnth2Intersect);
        var pNew = Vector.verticePlusVector(pIntersect, dirZ);
        camera.look(pNew, pIntersect);
        camera.pitch -= DELTA_PITCH;
        globe.refresh();
      } else {
        alert("视线与地球无交点");
      }
    }
  }

};

export = EventModule;