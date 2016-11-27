///<amd-module name="world/Event"/>
import Kernel = require("./Kernel");
import MathUtils = require("./math/Math");
import Vector = require("./math/Vector");
import Camera = require("./Camera");

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
        //console.log("单击点三维坐标:(" + pickResult[0].x + "," + pickResult[0].y + "," + pickResult[0].z + ");经纬度坐标:[" + this.dragGeo[0] + "," + this.dragGeo[1] + "]");
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
    var v1 = Vector.fromVertice(p1);
    var p2 = MathUtils.geographicToCartesianCoord(newLon, newLat);
    var v2 = Vector.fromVertice(p2);
    var rotateVector = v1.cross(v2);
    var rotateRadian = -Vector.getRadianOfTwoVectors(v1, v2);
    var camera: Camera = Kernel.globe.camera;
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
      globe.setLevel(globe.getLevel() + 1);
      if (pickResult.length >= 1) {
        var pickVertice = pickResult[0];
        var lonlat = MathUtils.cartesianCoordToGeographic(pickVertice);
        var lon = lonlat[0];
        var lat = lonlat[1];
        globe.setLevel(globe.getLevel() + 1);
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
    var newLevel = globe.getLevel() + deltaLevel;
    if(newLevel >= 0){
      globe.setLevel(newLevel);
      //globe.animateToLevel(newLevel);
    }
  },

  /**
   * 通过向上和向下的键盘按键调整Camera视线方向的倾斜角度pitch
   * 初始pitch值为0
   * 当在A时刻要将pitch值从0变成一个非0值时，我们需要记录A时刻Camera的模型矩阵A.matrix和当时的级别A.level
   * 然后经过多次修改pitch值以及多次缩放后到达B时刻，B时刻的pitch值为B.pitch，层级为B.level
   * 即便摄像机视线没有指向真实地球的中心了，我们也会假象一个虚拟地球，让我们的经过pitch倾斜后的实现指向虚拟地球的中心以便套用公式计算缩放距离
   * 我们这样确定在B时刻摄像机的matrix：
   * 1. 我们计算的起点是A时刻Camera的初始状态（A.matrix和A.level）
   * 2. 将A.matrix.localRotateX(B.pitch)，这样就将摄像机旋转了，即确定了B时刻摄像机模型坐标系坐标轴的方向
   * 3. 我们还需要确定B时刻摄像机的位置，按照标准公式计算在A.level层级下，Camera距离地球表面的距离应该是A.distance2Surface
   *    相应的，按照标准公式计算在B.level层级下，Camera距离地球表面的距离应该是B.distance2Surface
   *    那么我们将A.matrix.getPosition()沿着B.matrix.getLightDirection()视线往前移动(B.distance2Surface - A.distance2Surface)的距离即可
   */
  onKeyDown(event: KeyboardEvent) {
    var globe = Kernel.globe;
    if (!globe) {
      return;
    }

    var DELTA_PITCH = 2;
    var camera = globe.camera;
    var keyNum = event.keyCode !== undefined ? event.keyCode : event.which;
    //上、下、左、右:38、40、37、39
    if(keyNum === 38){
      //向上键
      camera.setPitch(camera.getPitch() + DELTA_PITCH);
    }else if(keyNum === 40){
      //向下键
      camera.setPitch(camera.getPitch() - DELTA_PITCH);
    }
  }
};

export = EventModule;