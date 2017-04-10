import Kernel from './Kernel';
import Matrix from './math/Matrix';
import Vertice from './math/Vertice';
import Vector from './math/Vector';

export default class Object3D {
    protected matrix: Matrix;

    constructor() {
      this.matrix = new Matrix();
    }

    getMatrix(): Matrix{
      return this.matrix;
    }

    cloneMatrix(): Matrix{
      return this.matrix.clone();
    }

    setVectorX(vector: Vector) {
      this.matrix.setVectorX(vector);
    }

    getVectorX(): Vector {
      return this.matrix.getVectorX();
    }

    setVectorY(vector: Vector) {
      this.matrix.setVectorY(vector);
    }

    getVectorY(): Vector {
      return this.matrix.getVectorY();
    }

    setVectorZ(vector: Vector) {
      this.matrix.setVectorZ(vector);
    }

    getVectorZ(): Vector {
      return this.matrix.getVectorZ();
    }

    setPosition(vertice: Vertice): void {
      this.matrix.setPosition(vertice);
    }

    getPosition(): Vertice {
      return this.matrix.getPosition();
    }

    worldTranslate(x: number, y: number, z: number): void {
      this.matrix.worldTranslate(x, y, z);
    }

    localTranslate(x: number, y: number, z: number): void {
      this.matrix.localTranslate(x, y, z);
    }

    worldScale(scaleX: number, scaleY: number, scaleZ: number): void {
      this.matrix.worldScale(scaleX, scaleY, scaleZ);
    }

    localScale(scaleX: number, scaleY: number, scaleZ: number): void {
      this.matrix.localScale(scaleX, scaleY, scaleZ);
    }

    worldRotateX(radian: number): void {
      this.matrix.worldRotateX(radian);
    }

    worldRotateY(radian: number): void {
      this.matrix.worldRotateY(radian);
    }

    worldRotateZ(radian: number): void {
      this.matrix.worldRotateZ(radian);
    }

    worldRotateByVector(radian: number, vector: Vector): void {
      this.matrix.worldRotateByVector(radian, vector);
    }

    localRotateX(radian: number): void {
      this.matrix.localRotateX(radian);
    }

    localRotateY(radian: number): void {
      this.matrix.localRotateY(radian);
    }

    localRotateZ(radian: number): void {
      this.matrix.localRotateZ(radian);
    }

    //localVector指的是相对于模型坐标系中的向量
    localRotateByVector(radian: number, localVector: Vector): void {
      this.matrix.localRotateByVector(radian, localVector);
    }

    getXAxisDirection(): Vector {
      var directionX = this.matrix.getVectorX();
      directionX.normalize();
      return directionX;
    }

    getYAxisDirection(): Vector {
      var directionY = this.matrix.getVectorY();
      directionY.normalize();
      return directionY;
    }

    getZAxisDirection(): Vector {
      var directionZ = this.matrix.getVectorZ();
      directionZ.normalize();
      return directionZ;
    }
};