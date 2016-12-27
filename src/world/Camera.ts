///<amd-module name="world/Camera"/>
import Kernel = require('./Kernel');
import Utils = require('./Utils');
import MathUtils = require('./math/Math');
import Vertice = require('./math/Vertice');
import Vector = require('./math/Vector');
import Line = require('./math/Line');
import Plan = require('./math/Plan');
import TileGrid,{TileGridPosition} from './TileGrid';
import Matrix = require('./math/Matrix');
import Object3D = require('./Object3D');

export class CameraCore{
  constructor(private fov: number, private aspect: number, private near: number, private far: number, private realLevel: number, private matrix: Matrix){

  }

  getFov(){
    return this.fov;
  }

  getAspect(){
    return this.aspect;
  }

  getNear(){
    return this.near;
  }

  getFar(){
    return this.far;
  }

  getRealLeavel(){
    return this.realLevel;
  }

  getMatrix(){
    return this.matrix;
  }

  equals(other: CameraCore): boolean{
    if(!other){
      return false;
    }
    return this.fov === other.getFov() &&
           this.aspect === other.getAspect() &&
           this.near === other.getNear() &&
           this.far === other.getFar() &&
           this.realLevel === other.getRealLeavel() &&
           this.matrix.equals(other.getMatrix());
  }
}

class Camera extends Object3D {
  private readonly initFov: number;
  private readonly animationDuration: number = 200;//层级变化的动画周期，毫秒
  private readonly nearFactor: number = 0.6;
  private readonly baseTheoryDistanceFromCamera2EarthSurface = 1.23 * Kernel.EARTH_RADIUS;
  private readonly maxPitch = 40;

  //旋转的时候，绕着视线与地球交点进行旋转
  //定义抬头时，旋转角为正值
  private isZeroPitch: boolean = true;//表示当前Camera视线有没有发生倾斜

  private level: number = -1; //当前渲染等级
  private realLevel: number = -2;//可能是正数，可能是非整数，非整数表示缩放动画过程中的level

  private lastRealLevel: number = -3;//上次render()时所用到的this.realLevel
  private lastMatrix: Matrix;//上次render()时的this.matrix
  private lastFov: number = -1;
  private lastAspect: number = -1;
  private lastNear: number = -1;
  private lastFar: number = -1;

  private viewMatrix: Matrix;//视点矩阵，即Camera模型矩阵的逆矩阵
  private projMatrix: Matrix;//当Matrix变化的时候，需要重新计算this.far
  private projViewMatrix: Matrix;//获取投影矩阵与视点矩阵的乘积

  private matrixForDraw: Matrix;
  private viewMatrixForDraw: Matrix;
  private projMatrixForDraw: Matrix;
  private projViewMatrixForDraw: Matrix;//实际传递给shader的矩阵是projViewMatrixForDraw，而不是projViewMatrix

  private animating: boolean = false;

  //this.near一旦初始化之后就不应该再修改
  //this.far可以动态计算
  //this.aspect在Viewport改变后重新计算
  //this.fov可以调整以实现缩放效果
  constructor(private fov = 45, private aspect = 1, private near = 1, private far = 100) {
    super();
    this.initFov = this.fov;
    this.lastMatrix = new Matrix();
    this.lastMatrix.setUniqueValue(0);
    this.projMatrix = new Matrix();
    this._rawSetPerspectiveMatrix(this.fov, this.aspect, this.near, this.far);
    this._initCameraPosition();
  }

  toJson():any{
    function matrixToJson(mat: Matrix){
      return mat ? mat.toJson() : null;
    }
    var json = {
      matrix: matrixToJson(this.matrix),
      isZeroPitch: this.isZeroPitch,
      level: this.level,
      realLevel: this.realLevel,
      lastRealLevel: this.lastRealLevel,
      lastMatrix: matrixToJson(this.lastMatrix),
      lastFov: this.lastFov,
      lastAspect: this.lastAspect,
      lastNear: this.lastNear,
      lastFar: this.lastFar,
      viewMatrix: matrixToJson(this.viewMatrix),
      projMatrix: matrixToJson(this.projMatrix),
      projViewMatrix: matrixToJson(this.projViewMatrix),
      matrixForDraw: matrixToJson(this.matrixForDraw),
      viewMatrixForDraw: matrixToJson(this.viewMatrixForDraw),
      projMatrixForDraw: matrixToJson(this.projMatrixForDraw),
      projViewMatrixForDraw: matrixToJson(this.projViewMatrixForDraw),
      animating: this.animating
    };
    return json;
  }

  toJsonString(){
    return JSON.stringify(this.toJson());
  }

  fromJson(json: any){
    this.matrix = Matrix.fromJson(json.matrix);
    this.isZeroPitch = json.isZeroPitch;
    this.level = json.level;
    this.realLevel = json.realLevel;
    this.lastRealLevel = json.lastRealLevel;
    this.lastMatrix = Matrix.fromJson(json.lastMatrix);
    this.lastFov = json.lastFov;
    this.lastAspect = json.lastAspect;
    this.lastNear = json.lastNear;
    this.lastFar = json.lastFar;
    this.viewMatrix = Matrix.fromJson(json.viewMatrix);
    this.projMatrix = Matrix.fromJson(json.projMatrix);
    this.projViewMatrix = Matrix.fromJson(json.projViewMatrix);
    this.matrixForDraw = Matrix.fromJson(json.matrixForDraw);
    this.viewMatrixForDraw = Matrix.fromJson(json.viewMatrixForDraw);
    this.projMatrixForDraw = Matrix.fromJson(json.projMatrixForDraw);
    this.projViewMatrixForDraw = Matrix.fromJson(json.projViewMatrixForDraw);
    this.animating = json.animating;
    this.update(true);
    // Kernel.globe.refresh(true);
  }

  fromJsonString(jsonStr: string){
    this.fromJson(JSON.parse(jsonStr));
  }

  private _setPerspectiveMatrix(fov: number = 45, aspect: number = 1, near: number = 1, far: number = 100): void {
    this._rawSetPerspectiveMatrix(fov, aspect, near, far);
    this._updateFar();
  }

  private _rawSetPerspectiveMatrix(fov: number = 45, aspect: number = 1, near: number = 1, far: number = 100, projMatrix: Matrix = this.projMatrix): void {
    //https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L1788
    if (this.projMatrix === projMatrix) {
      this.fov = fov;
      this.aspect = aspect;
      this.near = near;
      this.far = far;
    }

    var mat = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
    var halfFov = fov * Math.PI / 180 / 2;
    var f = 1 / Math.tan(halfFov);
    var nf = 1 / (near - far);

    mat[0] = f / aspect;
    mat[5] = f;
    mat[10] = (far + near) * nf;
    mat[11] = -1;
    mat[14] = 2 * near * far * nf;
    mat[15] = 0;

    //by comparision with matrixProjection.exe and glMatrix, the 11th element is always -1
    projMatrix.setElements(
      mat[0], mat[1], mat[2], mat[3],
      mat[4], mat[5], mat[6], mat[7],
      mat[8], mat[9], mat[10], mat[11],
      mat[12], mat[13], mat[14], mat[15]
    );
  }

  private _setFov(fov: number): void {
    if (!(fov > 0)) {
      throw "invalid fov:" + fov;
    }
    this._setPerspectiveMatrix(fov, this.aspect, this.near, this.far);
  }

  setAspect(aspect: number): void {
    if (!(aspect > 0)) {
      throw "invalid aspect:" + aspect;
    }
    this._setPerspectiveMatrix(this.fov, aspect, this.near, this.far);
  }

  private _updateFar(): void {
    // var far = this._getMinimalFar(this.matrix.getPosition());
    // this._rawSetPerspectiveMatrix(this.fov, this.aspect, this.near, far);
  }

  private _getMinimalFar(cameraPosition: Vertice): number {
    //重新计算far,保持far在满足正常需求情况下的最小值
    //far值：视点与地球切面的距离
    var distance2EarthOrigin = Vector.fromVertice(cameraPosition).getLength();
    var far = Math.sqrt(distance2EarthOrigin * distance2EarthOrigin - Kernel.EARTH_RADIUS * Kernel.EARTH_RADIUS);
    far *= 1.05;
    return far;
  }

  //更新各种矩阵，理论上只在用户交互的时候调用就可以
  update(force: boolean = false): boolean {
    var updated = false;
    if(force || this._isNeedUpdate()){
      this._normalUpdate();
      this._updateProjViewMatrixForDraw();
      updated = true;
    }
    this.lastFov = this.fov;
    this.lastAspect = this.aspect;
    this.lastNear = this.near;
    this.lastFar = this.far;
    this.lastRealLevel = this.realLevel;
    this.lastMatrix.setMatrixByOther(this.matrix);
    return updated;
  }

  getCameraCore(){
    return new CameraCore(this.fov, this.aspect, this.near, this.far, this.realLevel, this.matrix.clone());
  }

  private _isNeedUpdate(): boolean{
    return (this.fov !== this.lastFov) ||
           (this.aspect !== this.lastAspect) ||
           (this.near !== this.lastNear) ||
           (this.far !== this.lastFar) ||
           (this.realLevel !== this.lastRealLevel) ||
           (!this.matrix.equals(this.lastMatrix));
  }

  getProjViewMatrixForDraw(): Matrix {
    return this.projViewMatrixForDraw;
  }

  _normalUpdate() {
    //视点矩阵是camera的模型矩阵的逆矩阵
    this.viewMatrix = this.matrix.getInverseMatrix();

    //通过修改far值更新projMatrix
    this._updateFar();

    //更新projViewMatrix
    this.projViewMatrix = this.projMatrix.multiplyMatrix(this.viewMatrix);
  }

  _updateProjViewMatrixForDraw() {
    this.matrixForDraw = this.matrix.clone();

    //通过修改position以更新matrix
    var newFov = this._updatePositionAndFov(this.matrixForDraw);
    var aspect = this.aspect;
    var near = this.near;

    //计算newFar
    var newPosition = this.matrixForDraw.getPosition();
    var newFar = this.far; //this._getMinimalFar(newPosition);

    //根据newFov和newFar重新计算
    this.projMatrixForDraw = new Matrix();
    this._rawSetPerspectiveMatrix(newFov, aspect, near, newFar, this.projMatrixForDraw);

    //在_updatePositionAndFov()方法调用之后再计算newViewMatrix
    this.viewMatrixForDraw = this.matrixForDraw.getInverseMatrix();

    //最后计算projViewMatrixForDraw
    this.projViewMatrixForDraw = this.projMatrixForDraw.multiplyMatrix(this.viewMatrixForDraw);
  }

  //返回更新后的fov值，如果返回结果 < 0，说明无需更新fov
  private _updatePositionAndFov(cameraMatrix: Matrix): number {
    //是否满足near值，和fov没有关系，和position有关，但是改变position的话，fov也要相应变动以满足对应的缩放效果
    const currentLevel = this.animating ? this.realLevel : this.level;

    //safeLevel不是整数
    var safeLevel = this._getSafeThresholdLevelForNear();

    if (currentLevel > safeLevel) {
      //摄像机距离地球太近，导致不满足视景体的near值,
      //我们需要将摄像机的位置拉远，以满足near值
      this._updatePositionByLevel(safeLevel, cameraMatrix);
      //比如safeLevel是10，而currentLevel是11，则deltaLevel为1
      var deltaLevel = currentLevel - safeLevel;
      //摄像机位置与地球表面距离变大之后，我们看到的地球变小，为此，我们需要把fov值变小，以抵消摄像机位置距离增大导致的变化
      //deltaLevel应该为正正数，计算出的newFov应该比this.initFov要小
      var newFov = this._calculateFovByDeltaLevel(this.initFov, deltaLevel);
      return newFov;
    } else {
      this._updatePositionByLevel(currentLevel, cameraMatrix);
      return this.initFov;
    }
  }

  //计算从第几级level开始不满足视景体的near值
  //比如第10级满足near，第11级不满足near，那么返回10
  private _getSafeThresholdLevelForNear() {
    var thresholdNear = this.near * this.nearFactor;
    var pow2level = this.baseTheoryDistanceFromCamera2EarthSurface / thresholdNear;
    var level = MathUtils.log2(pow2level);
    //return Math.floor(level);
    return level;
  }

  /**
   * 根据层级计算出摄像机应该放置到距离地球表面多远的位置
   * @param level
   * @return {*}
   */
  private _getTheoryDistanceFromCamera2EarthSurface(level: number): number {
    return this.baseTheoryDistanceFromCamera2EarthSurface / Math.pow(2, level);
  }

  //fov从oldFov变成了newFov，计算相当于缩放了几级level
  //比如从10级缩放到了第11级，fov从30变成了15，即oldFov为30，newFov为15，deltaLevel为1
  //通过Math.log2()计算出结果，所以返回的是小数，可能是正数也可能是负数
  private _calculateDeltaLevelByFov(oldFov: number, newFov: number): number {
    //tan(halfFov) = h / distance，level不同的情况下h不变
    //h1 = l1*tanθ1
    //h2 = l2*tanθ2
    //l2 = l1 * Math.pow(2, deltaLevel)
    //deltaLevel = Math.log2(tanθ1 / tanθ2)
    var radianOldFov = MathUtils.degreeToRadian(oldFov);
    var halfRadianOldFov = radianOldFov / 2;
    var tanOld = Math.tan(halfRadianOldFov);

    var radianNewFov = MathUtils.degreeToRadian(newFov);
    var halfRadianNewFov = radianNewFov / 2;
    var tanNew = Math.tan(halfRadianNewFov);

    var deltaLevel = MathUtils.log2(tanOld / tanNew);
    return deltaLevel;
  }

  //通过调整fov的值造成层级缩放的效果，比如在第10级的时候，oldFov为正常的30度，当放大到11级的时候，deltaLevel为1，计算出的新的newFov为15度多
  private _calculateFovByDeltaLevel(oldFov: number, deltaLevel: number): number {
    //tan(halfFov) = h / distance，level不同的情况下h不变
    //h1 = l1*tanθ1
    //h2 = l2*tanθ2
    //l2 = l1 * Math.pow(2, deltaLevel)
    var radianOldFov = MathUtils.degreeToRadian(oldFov);
    var halfRadianOldFov = radianOldFov / 2;
    var tanOld = Math.tan(halfRadianOldFov);
    var tanNew = tanOld / Math.pow(2, deltaLevel);
    var halfRadianNewFov = Math.atan(tanNew);
    var radianNewFov = halfRadianNewFov * 2;
    var newFov = MathUtils.radianToDegree(radianNewFov);
    return newFov;
  }

  getLevel(): number {
    return this.level;
  }

  setLevel(level: number): void {
    if (!(Utils.isNonNegativeInteger(level))) {
      throw "invalid level:" + level;
    }
    level = level > Kernel.MAX_LEVEL ? Kernel.MAX_LEVEL : level; //超过最大的渲染级别就不渲染
    if (level === this.level) {
      return;
    }
    var isLevelChanged = this._updatePositionByLevel(level, this.matrix);
    //不要在this._updatePositionByLevel()方法中更新this.level，因为这会影响animateToLevel()方法
    this.level = level;
    this.realLevel = level;
    // Kernel.globe.refresh();
  }

  private _initCameraPosition() {
    var initLevel = 0;
    var length = this._getTheoryDistanceFromCamera2EarthSurface(initLevel) + Kernel.EARTH_RADIUS; //level等级下摄像机应该到球心的距离
    var origin = new Vertice(0, 0, 0);
    var vector = this.getLightDirection().getOpposite();
    vector.setLength(length);
    var newPosition = vector.getVertice();
    this._look(newPosition, origin);
  }

  //设置观察到的层级，不要在该方法中修改this.level的值
  private _updatePositionByLevel(level: number, cameraMatrix: Matrix) {
    var globe = Kernel.globe;
    var intersects = this._getDirectionIntersectPointWithEarth(cameraMatrix);
    if (intersects.length === 0) {
      throw "no intersect";
    }
    var intersect = intersects[0];
    var theoryDistance2Interscet = this._getTheoryDistanceFromCamera2EarthSurface(level);
    var vector = cameraMatrix.getVectorZ();
    vector.setLength(theoryDistance2Interscet);
    var newCameraPosition = Vector.verticePlusVector(intersect, vector);
    cameraMatrix.setPosition(newCameraPosition);
  }

  setDeltaPitch(deltaPitch: number) {
    var currentPitch = this.getPitch();
    var newPitch = currentPitch + deltaPitch;
    if (newPitch > this.maxPitch) {
      return;
    }
    if (newPitch < 0) {
      newPitch = 0;
    }

    //计算最终的deltaPitch
    deltaPitch = newPitch - currentPitch;
    if (deltaPitch === 0) {
      return;
    }

    var intersects = this._getDirectionIntersectPointWithEarth(this.matrix);
    if (intersects.length === 0) {
      throw "no intersects";
    }
    var intersect = intersects[0];

    var deltaRadian = MathUtils.degreeToRadian(deltaPitch);
    //先不对this.matrix进行更新，对其拷贝进行更新
    var matrix = this.matrix.clone();
    //将matrix移动到交点位置
    matrix.setPosition(intersect);
    //旋转
    matrix.localRotateX(deltaRadian);
    //更新matrix的position
    this._updatePositionByLevel(this.level, matrix);

    //刷新
    this.isZeroPitch = newPitch === 0;
    this.matrix = matrix;
    // Kernel.globe.refresh();
  }

  //pitch表示Camera视线的倾斜角度，初始值为0，表示视线经过球心，单位为角度，范围是[0, this.maxPitch]
  getPitch(): number {
    if (this.isZeroPitch) {
      return 0;
    }
    var intersects = this._getDirectionIntersectPointWithEarth(this.matrix);
    if (intersects.length === 0) {
      throw "no intersects";
    }
    var intersect = intersects[0];

    //计算夹角
    var vectorOrigin2Intersect = Vector.fromVertice(intersect);
    var length1 = vectorOrigin2Intersect.getLength();
    var vectorIntersect2Camera = Vector.verticeMinusVertice(this.getPosition(), intersect);
    var length2 = vectorIntersect2Camera.getLength();
    var cosθ = vectorOrigin2Intersect.dot(vectorIntersect2Camera) / (length1 * length2);
    var radian = MathUtils.acosSafely(cosθ);

    //计算夹角的正负
    var crossVector = vectorOrigin2Intersect.cross(vectorIntersect2Camera);
    var xAxisDirection = this.matrix.getVectorX()
    if (crossVector.dot(xAxisDirection)) {
      //正值
      radian = Math.abs(radian);
    } else {
      //负值
      radian = - Math.abs(radian);
    }

    var pitch = MathUtils.radianToDegree(radian);

    if(pitch >= 90){
      throw `Invalid pitch: ${pitch}`;
    }

    return pitch;
  }

  //计算拾取射线与地球的交点，以笛卡尔空间直角坐标系坐标数组的形式返回
  //该方法需要projViewMatrixForDraw系列矩阵进行计算
  getPickCartesianCoordInEarthByCanvas(canvasX: number, canvasY: number): Vertice[] {
    this.update();

    //暂存projViewMatrix系列矩阵
    var matrix = this.matrix;
    var viewMatrix = this.viewMatrix;
    var projMatrix = this.projMatrix;
    var projViewMatrix = this.projViewMatrix;

    //将projViewMatrix系列矩阵赋值为projViewMatrixForDraw系列矩阵
    this.matrix = this.matrixForDraw;
    this.viewMatrix = this.viewMatrixForDraw;
    this.projMatrix = this.projMatrixForDraw;
    this.projViewMatrix = this.projViewMatrixForDraw;

    //基于projViewMatrixForDraw系列矩阵进行计算，应该没有误差
    var pickDirection = this._getPickDirectionByCanvas(canvasX, canvasY);
    var p = this.getPosition();
    var line = new Line(p, pickDirection);
    var result = this._getPickCartesianCoordInEarthByLine(line);

    //还原projViewMatrix系列矩阵
    this.matrix = matrix;
    this.viewMatrix = viewMatrix;
    this.projMatrix = projMatrix;
    this.projViewMatrix = projViewMatrix;

    return result;
  }

  getLightDirection(): Vector {
    var dirVertice = this.matrix.getVectorZ();
    var direction = new Vector(-dirVertice.x, -dirVertice.y, -dirVertice.z);
    direction.normalize();
    return direction;
  }

  getDistance2EarthSurface(): number {
    var position = this.getPosition();
    var length2EarthSurface = Vector.fromVertice(position).getLength() - Kernel.EARTH_RADIUS;
    return length2EarthSurface;
  }

  getDistance2EarthOrigin(): number{
    var position = this.getPosition();
    return Vector.fromVertice(position).getLength();
  }

  isAnimating(): boolean {
    return this.animating;
  }

  animateToLevel(newLevel: number): void {
    if (this.isAnimating()) {
      return;
    }

    if (!(Utils.isNonNegativeInteger(newLevel))) {
      throw "invalid level:" + newLevel;
    }
    var newCameraMatrix = this.matrix.clone();
    this._updatePositionByLevel(newLevel, newCameraMatrix);
    var newPosition = newCameraMatrix.getPosition();

    var oldPosition = this.getPosition();
    var span = this.animationDuration;
    var singleSpan = 1000 / 60;
    var count = Math.floor(span / singleSpan);
    var deltaX = (newPosition.x - oldPosition.x) / count;
    var deltaY = (newPosition.y - oldPosition.y) / count;
    var deltaZ = (newPosition.z - oldPosition.z) / count;
    var deltaLevel = (newLevel - this.level) / count;
    var start: number = -1;
    this.realLevel = this.level;
    this.animating = true;

    var callback = (timestap: number) => {
      if (start < 0) {
        start = timestap;
      }
      var a = timestap - start;
      if (a >= span) {
        this.animating = false;
        this.realLevel = newLevel;
        this.setLevel(newLevel);
      } else {
        this.realLevel += deltaLevel;
        var p = this.getPosition();
        this.setPosition(new Vertice(p.x + deltaX, p.y + deltaY, p.z + deltaZ));
        requestAnimationFrame(callback);
      }
    };
    requestAnimationFrame(callback);
  }

  private _look(cameraPnt: Vertice, targetPnt: Vertice, upDirection: Vector = new Vector(0, 1, 0)): void {
    var cameraPntCopy = cameraPnt.clone();
    var targetPntCopy = targetPnt.clone();
    var up = upDirection.clone();

    var zAxis = new Vector(
      cameraPntCopy.x - targetPntCopy.x,
      cameraPntCopy.y - targetPntCopy.y,
      cameraPntCopy.z - targetPntCopy.z
    );
    zAxis.normalize();
    var xAxis = up.cross(zAxis).normalize();
    var yAxis = zAxis.cross(xAxis).normalize();

    this.matrix.setVectorX(xAxis); //此处相当于对Camera的模型矩阵(不是视点矩阵)设置X轴方向
    this.matrix.setVectorY(yAxis); //此处相当于对Camera的模型矩阵(不是视点矩阵)设置Y轴方向
    this.matrix.setVectorZ(zAxis); //此处相当于对Camera的模型矩阵(不是视点矩阵)设置Z轴方向
    this.matrix.setPosition(cameraPntCopy); //此处相当于对Camera的模型矩阵(不是视点矩阵)设置偏移量
    this.matrix.setLastRowDefault();

    this._updateFar();
  }

  private _lookAt(targetPnt: Vertice, upDirection?: Vector): void {
    var targetPntCopy = targetPnt.clone();
    var position = this.getPosition();
    this._look(position, targetPntCopy, upDirection);
  }

  //根据canvasX和canvasY获取拾取向量
  private _getPickDirectionByCanvas(canvasX: number, canvasY: number): Vector {
    var ndcXY = MathUtils.convertPointFromCanvasToNDC(canvasX, canvasY);
    var pickDirection = this._getPickDirectionByNDC(ndcXY[0], ndcXY[1]);
    return pickDirection;
  }

  //获取cameraMatrix视线与地球的交点
  private _getDirectionIntersectPointWithEarth(cameraMatrix: Matrix): Vertice[] {
    var dir = cameraMatrix.getVectorZ().getOpposite();
    var p = cameraMatrix.getPosition();
    var line = new Line(p, dir);
    var result = this._getPickCartesianCoordInEarthByLine(line);
    return result;
  }

  //根据ndcX和ndcY获取拾取向量
  private _getPickDirectionByNDC(ndcX: number, ndcY: number): Vector {
    var verticeInNDC = new Vertice(ndcX, ndcY, 0.499);
    var verticeInWorld = this._convertVerticeFromNdcToWorld(verticeInNDC);
    var cameraPositon = this.getPosition(); //摄像机的世界坐标
    var pickDirection = Vector.verticeMinusVertice(verticeInWorld, cameraPositon);
    pickDirection.normalize();
    return pickDirection;
  }

  //获取直线与地球的交点，该方法与MathUtils.getLineIntersectPointWithEarth功能基本一样，只不过该方法对相交点进行了远近排序
  private _getPickCartesianCoordInEarthByLine(line: Line): Vertice[] {
    var result: Vertice[] = [];
    //pickVertice是笛卡尔空间直角坐标系中的坐标
    var pickVertices = MathUtils.getLineIntersectPointWithEarth(line);
    if (pickVertices.length === 0) {
      //没有交点
      result = [];
    } else if (pickVertices.length == 1) {
      //一个交点
      result = pickVertices;
    } else if (pickVertices.length == 2) {
      //两个交点
      var pickVerticeA = pickVertices[0];
      var pickVerticeB = pickVertices[1];
      var cameraVertice = this.getPosition();
      var lengthA = MathUtils.getLengthFromVerticeToVertice(cameraVertice, pickVerticeA);
      var lengthB = MathUtils.getLengthFromVerticeToVertice(cameraVertice, pickVerticeB);
      //将距离人眼更近的那个点放到前面
      result = lengthA <= lengthB ? [pickVerticeA, pickVerticeB] : [pickVerticeB, pickVerticeA];
    }
    return result;
  }

  private _getPickLonLatByNDC(ndcX: number, ndcY: number): number[]{
    var result:number[] = null;
    var vertices = this._getPickCartesianCoordInEarthByNDC(ndcX, ndcY);
    if(vertices.length > 0){
      result = MathUtils.cartesianCoordToGeographic(vertices[0]);
    }
    return result;
  }

  private _getPickCartesianCoordInEarthByNDC(ndcX: number, ndcY: number): Vertice[] {
    var pickDirection = this._getPickDirectionByNDC(ndcX, ndcY);
    var p = this.getPosition();
    var line = new Line(p, pickDirection);
    var result = this._getPickCartesianCoordInEarthByLine(line);
    return result;
  }

  //得到摄像机的XOZ平面的方程
  private _getPlanXOZ(): Plan {
    var position = this.getPosition();
    var direction = this.getLightDirection();
    var plan = MathUtils.getCrossPlaneByLine(position, direction);
    return plan;
  }

  //点变换: World->NDC
  private _convertVerticeFromWorldToNDC(verticeInWorld: Vertice): Vertice {
    var columnWorld = [verticeInWorld.x, verticeInWorld.y, verticeInWorld.z, 1];
    var columnProject = this.projViewMatrix.multiplyColumn(columnWorld);
    var w = columnProject[3];
    var columnNDC: number[] = [];
    columnNDC[0] = columnProject[0] / w;
    columnNDC[1] = columnProject[1] / w;
    columnNDC[2] = columnProject[2] / w;
    columnNDC[3] = 1;
    var verticeInNDC = new Vertice(columnNDC[0], columnNDC[1], columnNDC[2]);
    return verticeInNDC;
  }

  //点变换: NDC->World
  private _convertVerticeFromNdcToWorld(verticeInNDC: Vertice): Vertice {
    var columnNDC: number[] = [verticeInNDC.x, verticeInNDC.y, verticeInNDC.z, 1]; //NDC归一化坐标
    var inverseProj = this.projMatrix.getInverseMatrix(); //投影矩阵的逆矩阵
    var columnCameraTemp = inverseProj.multiplyColumn(columnNDC); //带引号的“视坐标”
    var cameraX = columnCameraTemp[0] / columnCameraTemp[3];
    var cameraY = columnCameraTemp[1] / columnCameraTemp[3];
    var cameraZ = columnCameraTemp[2] / columnCameraTemp[3];
    var cameraW = 1;
    var columnCamera = [cameraX, cameraY, cameraZ, cameraW]; //真实的视坐标
    var columnWorld = this.matrix.multiplyColumn(columnCamera); //单击点的世界坐标
    var verticeInWorld = new Vertice(columnWorld[0], columnWorld[1], columnWorld[2]);
    return verticeInWorld;
  }

  //点变换: Camera->World
  private _convertVerticeFromCameraToWorld(verticeInCamera: Vertice): Vertice {
    var verticeInCameraCopy = verticeInCamera.clone();
    var column = [verticeInCameraCopy.x, verticeInCameraCopy.y, verticeInCameraCopy.z, 1];
    var column2 = this.matrix.multiplyColumn(column);
    var verticeInWorld = new Vertice(column2[0], column2[1], column2[2]);
    return verticeInWorld;
  }

  //向量变换: Camera->World
  private _convertVectorFromCameraToWorld(vectorInCamera: Vector): Vector {
    var vectorInCameraCopy = vectorInCamera.clone();
    var verticeInCamera = vectorInCameraCopy.getVertice();
    var verticeInWorld = this._convertVerticeFromCameraToWorld(verticeInCamera);
    var originInWorld = this.getPosition();
    var vectorInWorld = Vector.verticeMinusVertice(verticeInWorld, originInWorld);
    vectorInWorld.normalize();
    return vectorInWorld;
  }

  //判断世界坐标系中的点是否在Canvas中可见
  //options: verticeInNDC,threshold
  private _isWorldVerticeVisibleInCanvas(verticeInWorld: Vertice, options: any = {}): boolean {
    var threshold = typeof options.threshold == "number" ? Math.abs(options.threshold) : 1;
    var cameraP = this.getPosition();
    var dir = Vector.verticeMinusVertice(verticeInWorld, cameraP);
    var line = new Line(cameraP, dir);
    var pickResult = this._getPickCartesianCoordInEarthByLine(line);
    if (pickResult.length > 0) {
      var pickVertice = pickResult[0];
      var length2Vertice = MathUtils.getLengthFromVerticeToVertice(cameraP, verticeInWorld);
      var length2Pick = MathUtils.getLengthFromVerticeToVertice(cameraP, pickVertice);
      if (length2Vertice < length2Pick + 5) {
        if (!(options.verticeInNDC instanceof Vertice)) {
          options.verticeInNDC = this._convertVerticeFromWorldToNDC(verticeInWorld);
        }
        var result = options.verticeInNDC.x >= -1 && options.verticeInNDC.x <= 1 && options.verticeInNDC.y >= -threshold && options.verticeInNDC.y <= 1;
        return result;
      }
    }
    return false;
  }

  //判断地球表面的某个经纬度在Canvas中是否应该可见
  //options: verticeInNDC
  private _isGeoVisibleInCanvas(lon: number, lat: number, options?: any): boolean {
    var verticeInWorld = MathUtils.geographicToCartesianCoord(lon, lat);
    var result = this._isWorldVerticeVisibleInCanvas(verticeInWorld, options);
    return result;
  }

  /**
   * 算法，一个切片需要渲染需要满足如下三个条件:
   * 1.至少要有一个点在Canvas中可见
   * 2.NDC面积足够大
   * 3.形成的NDC四边形是顺时针方向
   */
  //获取level层级下的可见切片
  //options: threshold
  getVisibleTilesByLevel(level: number, options: any = {}): TileGrid[] {
    if (!(level >= 0)) {
      throw "invalid level";
    }
    console.time("getVisibleTilesByLevel");
    var result: TileGrid[] = [];
    //向左、向右、向上、向下最大的循环次数
    var LOOP_LIMIT = Math.min(10, Math.pow(2, level) - 1);

    var mathOptions = {
      maxSize: Math.pow(2, level)
    };

    function checkVisible(visibleInfo: any) {
      if (visibleInfo.area >= 5000 && visibleInfo.clockwise) {
        if (visibleInfo.visibleCount >= 1) {
          return true;
        }
      }
      return false;
    }

    //处理一整行
    function handleRow(centerRow: number, centerColumn: number): TileGrid[] {
      var result: TileGrid[] = [];
      var grid = new TileGrid(level, centerRow, centerColumn); // {level:level,row:centerRow,column:centerColumn};
      var visibleInfo = this._getTileVisibleInfo(grid.level, grid.row, grid.column, options);
      var isRowCenterVisible = checkVisible(visibleInfo);
      if (isRowCenterVisible) {
        (grid as any).visibleInfo = visibleInfo;
        result.push(grid);

        //向左遍历至不可见
        var leftLoopTime = 0; //向左循环的次数
        var leftColumn = centerColumn;
        var visible: boolean;
        while (leftLoopTime < LOOP_LIMIT) {
          leftLoopTime++;
          grid = TileGrid.getTileGridByBrother(level, centerRow, leftColumn, TileGridPosition.LEFT, mathOptions);
          leftColumn = grid.column;
          visibleInfo = this._getTileVisibleInfo(grid.level, grid.row, grid.column, options);
          visible = checkVisible(visibleInfo);
          if (visible) {
            (<any>grid).visibleInfo = visibleInfo;
            result.push(grid);
          } else {
            break;
          }
        }

        //向右遍历至不可见
        var rightLoopTime = 0; //向右循环的次数
        var rightColumn = centerColumn;
        while (rightLoopTime < LOOP_LIMIT) {
          rightLoopTime++;
          grid = TileGrid.getTileGridByBrother(level, centerRow, rightColumn, TileGridPosition.RIGHT, mathOptions);
          rightColumn = grid.column;
          visibleInfo = this._getTileVisibleInfo(grid.level, grid.row, grid.column, options);
          visible = checkVisible(visibleInfo);
          if (visible) {
            (<any>grid).visibleInfo = visibleInfo;
            result.push(grid);
          } else {
            break;
          }
        }
      }
      return result;
    }

    var verticalCenterInfo = this._getVerticalVisibleCenterInfo();
    var centerGrid = TileGrid.getTileGridByGeo(verticalCenterInfo.lon, verticalCenterInfo.lat, level);
    var handleRowThis = handleRow.bind(this);

    var rowResult = handleRowThis(centerGrid.row, centerGrid.column);
    result = result.concat(rowResult);
    var grid: TileGrid;

    //循环向下处理至不可见
    var bottomLoopTime = 0; //向下循环的次数
    var bottomRow = centerGrid.row;
    while (bottomLoopTime < LOOP_LIMIT) {
      bottomLoopTime++;
      grid = TileGrid.getTileGridByBrother(level, bottomRow, centerGrid.column, TileGridPosition.BOTTOM, mathOptions);
      bottomRow = grid.row;
      rowResult = handleRowThis(grid.row, grid.column);
      if (rowResult.length > 0) {
        result = result.concat(rowResult);
      } else {
        //已经向下循环到不可见，停止向下循环
        break;
      }
    }

    //循环向上处理至不可见
    var topLoopTime = 0; //向上循环的次数
    var topRow = centerGrid.row;
    while (topLoopTime < LOOP_LIMIT) {
      topLoopTime++;
      grid = TileGrid.getTileGridByBrother(level, topRow, centerGrid.column, TileGridPosition.TOP, mathOptions);
      topRow = grid.row;
      rowResult = handleRowThis(grid.row, grid.column);
      if (rowResult.length > 0) {
        result = result.concat(rowResult);
      } else {
        //已经向上循环到不可见，停止向上循环
        break;
      }
    }

    console.timeEnd("getVisibleTilesByLevel");

    return result;
  }

  getTileGridsOfBoundary(level: number, filterRepeat: boolean){
    var tileGrids:TileGrid[] = [];
    var ndcs:number[][] = [
      [-1, 1],//left top
      [-1, 0],//left middle
      [-1, -1],//left bottom
      [1, 1],//right top
      [1, 0],//right middle
      [1, -1],//right bottom
      [0, 1],//middle top
      [0, -1]//middle bottom
    ];
    ndcs.forEach((ndcXY:number[]) => {
      var lonlat = this._getPickLonLatByNDC(ndcXY[0], ndcXY[1]);
      if(lonlat && lonlat.length > 0){
        var tileGrid = TileGrid.getTileGridByGeo(lonlat[0], lonlat[1], level);
        tileGrids.push(tileGrid);
      }
    });
    return filterRepeat ? Utils.filterRepeatArray(tileGrids) : tileGrids;
  }

  //options: threshold
  private _getTileVisibleInfo(level: number, row: number, column: number, options: any): any {
    if (!(level >= 0)) {
      throw "invalid level";
    }
    if (!(row >= 0)) {
      throw "invalid row";
    }
    if (!(column >= 0)) {
      throw "invalid column";
    }

    //options中可以缓存计算过的点的信息

    var threshold = typeof options.threshold == "number" ? Math.abs(options.threshold) : 1;
    options.threshold = threshold;

    var result: any = {
      lb: {
        lon: null,
        lat: null,
        verticeInWorld: null,
        verticeInNDC: null,
        visible: false
      },
      lt: {
        lon: null,
        lat: null,
        verticeInWorld: null,
        verticeInNDC: null,
        visible: false
      },
      rt: {
        lon: null,
        lat: null,
        verticeInWorld: null,
        verticeInNDC: null,
        visible: false
      },
      rb: {
        lon: null,
        lat: null,
        verticeInWorld: null,
        verticeInNDC: null,
        visible: false
      },
      Egeo: null,
      visibleCount: 0,
      clockwise: false,
      width: null,
      height: null,
      area: null
    };

    result.Egeo = MathUtils.getTileGeographicEnvelopByGrid(level, row, column);
    var tileMinLon = result.Egeo.minLon;
    var tileMaxLon = result.Egeo.maxLon;
    var tileMinLat = result.Egeo.minLat;
    var tileMaxLat = result.Egeo.maxLat;

    //左下角
    result.lb.lon = tileMinLon;
    result.lb.lat = tileMinLat;
    result.lb.verticeInWorld = MathUtils.geographicToCartesianCoord(result.lb.lon, result.lb.lat);
    result.lb.verticeInNDC = this._convertVerticeFromWorldToNDC(result.lb.verticeInWorld);
    result.lb.visible = this._isWorldVerticeVisibleInCanvas(result.lb.verticeInWorld, {
      verticeInNDC: result.lb.verticeInNDC,
      threshold: threshold
    });
    if (result.lb.visible) {
      result.visibleCount++;
    }

    //左上角
    result.lt.lon = tileMinLon;
    result.lt.lat = tileMaxLat;
    result.lt.verticeInWorld = MathUtils.geographicToCartesianCoord(result.lt.lon, result.lt.lat);
    result.lt.verticeInNDC = this._convertVerticeFromWorldToNDC(result.lt.verticeInWorld);
    result.lt.visible = this._isWorldVerticeVisibleInCanvas(result.lt.verticeInWorld, {
      verticeInNDC: result.lt.verticeInNDC,
      threshold: threshold
    });
    if (result.lt.visible) {
      result.visibleCount++;
    }

    //右上角
    result.rt.lon = tileMaxLon;
    result.rt.lat = tileMaxLat;
    result.rt.verticeInWorld = MathUtils.geographicToCartesianCoord(result.rt.lon, result.rt.lat);
    result.rt.verticeInNDC = this._convertVerticeFromWorldToNDC(result.rt.verticeInWorld);
    result.rt.visible = this._isWorldVerticeVisibleInCanvas(result.rt.verticeInWorld, {
      verticeInNDC: result.rt.verticeInNDC,
      threshold: threshold
    });
    if (result.rt.visible) {
      result.visibleCount++;
    }

    //右下角
    result.rb.lon = tileMaxLon;
    result.rb.lat = tileMinLat;
    result.rb.verticeInWorld = MathUtils.geographicToCartesianCoord(result.rb.lon, result.rb.lat);
    result.rb.verticeInNDC = this._convertVerticeFromWorldToNDC(result.rb.verticeInWorld);
    result.rb.visible = this._isWorldVerticeVisibleInCanvas(result.rb.verticeInWorld, {
      verticeInNDC: result.rb.verticeInNDC,
      threshold: threshold
    });
    if (result.rb.visible) {
      result.visibleCount++;
    }

    var ndcs: Vertice[] = [result.lb.verticeInNDC, result.lt.verticeInNDC, result.rt.verticeInNDC, result.rb.verticeInNDC];
    //计算方向
    var vector03 = Vector.verticeMinusVertice(ndcs[3], ndcs[0]);
    vector03.z = 0;
    var vector01 = Vector.verticeMinusVertice(ndcs[1], ndcs[0]);
    vector01.z = 0;
    var cross = vector03.cross(vector01);
    result.clockwise = cross.z > 0;
    //计算面积
    var topWidth = Math.sqrt(Math.pow(ndcs[1].x - ndcs[2].x, 2) + Math.pow(ndcs[1].y - ndcs[2].y, 2)) * Kernel.canvas.width / 2;
    var bottomWidth = Math.sqrt(Math.pow(ndcs[0].x - ndcs[3].x, 2) + Math.pow(ndcs[0].y - ndcs[3].y, 2)) * Kernel.canvas.width / 2;
    result.width = Math.floor((topWidth + bottomWidth) / 2);
    var leftHeight = Math.sqrt(Math.pow(ndcs[0].x - ndcs[1].x, 2) + Math.pow(ndcs[0].y - ndcs[1].y, 2)) * Kernel.canvas.height / 2;
    var rightHeight = Math.sqrt(Math.pow(ndcs[2].x - ndcs[3].x, 2) + Math.pow(ndcs[2].y - ndcs[3].y, 2)) * Kernel.canvas.height / 2;
    result.height = Math.floor((leftHeight + rightHeight) / 2);
    result.area = result.width * result.height;

    return result;
  }

  // private _getTileVerticeInfo(tag: string, lon: number, lat: number, threshold: number, options: any): any{
  //   if(options.hasOwnProperty(tag)){
  //     //console.info("use cache");
  //     return options[tag];
  //   }
  //   var verticeInWorld = MathUtils.geographicToCartesianCoord(lon, lat);
  //   var verticeInNDC = this._convertVerticeFromWorldToNDC(verticeInWorld);
  //   var visible = this._isWorldVerticeVisibleInCanvas(verticeInWorld, {
  //     verticeInNDC: verticeInNDC,
  //     threshold: threshold
  //   });
  //   var result = {
  //     lon: lon,
  //     lat: lat,
  //     verticeInWorld: verticeInWorld,
  //     verticeInNDC: verticeInNDC,
  //     visible: visible
  //   };
  //   options[tag] = result;
  //   return result;
  // }

  // //options: threshold
  // private _getTileVisibleInfo2(level: number, row: number, column: number, options: any): any {
  //   if (!(level >= 0)) {
  //     throw "invalid level";
  //   }
  //   if (!(row >= 0)) {
  //     throw "invalid row";
  //   }
  //   if (!(column >= 0)) {
  //     throw "invalid column";
  //   }

  //   //options中可以缓存计算过的点的信息

  //   var threshold = typeof options.threshold === "number" ? Math.abs(options.threshold) : 1;
  //   // options.threshold = threshold;

  //   var result: any = {
  //     lb: null,
  //     lt: null,
  //     rt: null,
  //     rb: null,
  //     Egeo: null,
  //     visibleCount: 0,
  //     clockwise: false,
  //     width: null,
  //     height: null,
  //     area: null
  //   };

  //   result.Egeo = MathUtils.getTileGeographicEnvelopByGrid(level, row, column);
  //   var tileMinLon = result.Egeo.minLon;
  //   var tileMaxLon = result.Egeo.maxLon;
  //   var tileMinLat = result.Egeo.minLat;
  //   var tileMaxLat = result.Egeo.maxLat;

  //   //左下角
  //   result.lb = this._getTileVerticeInfo(`${level}_${row+1}_${column}`, tileMinLon, tileMinLat, threshold, options);
  //   if (result.lb.visible) {
  //     result.visibleCount++;
  //   }

  //   //左上角
  //   result.lt = this._getTileVerticeInfo(`${level}_${row}_${column}`, tileMinLon, tileMaxLat, threshold, options);
  //   if (result.lt.visible) {
  //     result.visibleCount++;
  //   }

  //   //右上角
  //   result.rt = this._getTileVerticeInfo(`${level}_${row}_${column+1}`, tileMaxLon, tileMaxLat, threshold, options);
  //   if (result.rt.visible) {
  //     result.visibleCount++;
  //   }

  //   //右下角
  //   result.rb = this._getTileVerticeInfo(`${level}_${row+1}_${column+1}`, tileMaxLon, tileMinLat, threshold, options);
  //   if (result.rb.visible) {
  //     result.visibleCount++;
  //   }

  //   var ndcs: Vertice[] = [result.lb.verticeInNDC, result.lt.verticeInNDC, result.rt.verticeInNDC, result.rb.verticeInNDC];
  //   //计算方向
  //   var vector03 = Vector.verticeMinusVertice(ndcs[3], ndcs[0]);
  //   vector03.z = 0;
  //   var vector01 = Vector.verticeMinusVertice(ndcs[1], ndcs[0]);
  //   vector01.z = 0;
  //   var cross = vector03.cross(vector01);
  //   result.clockwise = cross.z > 0;
  //   //计算面积
  //   var topWidth = Math.sqrt(Math.pow(ndcs[1].x - ndcs[2].x, 2) + Math.pow(ndcs[1].y - ndcs[2].y, 2)) * Kernel.canvas.width / 2;
  //   var bottomWidth = Math.sqrt(Math.pow(ndcs[0].x - ndcs[3].x, 2) + Math.pow(ndcs[0].y - ndcs[3].y, 2)) * Kernel.canvas.width / 2;
  //   result.width = Math.floor((topWidth + bottomWidth) / 2);
  //   var leftHeight = Math.sqrt(Math.pow(ndcs[0].x - ndcs[1].x, 2) + Math.pow(ndcs[0].y - ndcs[1].y, 2)) * Kernel.canvas.height / 2;
  //   var rightHeight = Math.sqrt(Math.pow(ndcs[2].x - ndcs[3].x, 2) + Math.pow(ndcs[2].y - ndcs[3].y, 2)) * Kernel.canvas.height / 2;
  //   result.height = Math.floor((leftHeight + rightHeight) / 2);
  //   result.area = result.width * result.height;

  //   return result;
  // }

  //地球一直是关于纵轴中心对称的，获取垂直方向上中心点信息
  private _getVerticalVisibleCenterInfo(): any {
    var result = {
      ndcY: <number>null,
      pIntersect: <Vertice>null,
      lon: <number>null,
      lat: <number>null
    };
    var pickResults: Vertice[];
    if (this.isZeroPitch) {
      result.ndcY = 0;
    } else {
      var count = 10;
      var delta = 2.0 / count;
      var topNdcY = 1;
      var bottomNdcY = -1;
      var ndcY: number;
      //从上往下找topNdcY
      for (ndcY = 1.0; ndcY >= -1.0; ndcY -= delta) {
        pickResults = this._getPickCartesianCoordInEarthByNDC(0, ndcY);
        if (pickResults.length > 0) {
          topNdcY = ndcY;
          break;
        }
      }

      //从下往上找
      for (ndcY = -1.0; ndcY <= 1.0; ndcY += delta) {
        pickResults = this._getPickCartesianCoordInEarthByNDC(0, ndcY);
        if (pickResults.length > 0) {
          bottomNdcY = ndcY;
          break;
        }
      }
      result.ndcY = (topNdcY + bottomNdcY) / 2;
    }
    pickResults = this._getPickCartesianCoordInEarthByNDC(0, result.ndcY);
    result.pIntersect = pickResults[0];
    var lonlat = MathUtils.cartesianCoordToGeographic(result.pIntersect);
    result.lon = lonlat[0];
    result.lat = lonlat[1];
    return result;
  }
}

export default Camera;