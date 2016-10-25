///<amd-module name="world/Object3D"/>
import Kernel = require('./Kernel');
import Matrix = require('./math/Matrix');
import Vertice = require('./math/Vertice');
import Vector = require('./math/Vector');
import TextureMaterial = require('./TextureMaterial');

class Object3D {
    matrix: Matrix;

    constructor() {
        this.matrix = new Matrix();
    }

    //需要子类重写
    getPosition(): Vertice {
        var position = this.matrix.getPosition();
        return position;
    }

    //需要子类重写
    setPosition(x: number, y: number, z: number): void {
        this.matrix.setColumnTrans(x, y, z);
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
        var directionX = this.matrix.getColumnX();
        directionX.normalize();
        return directionX;
    }

    getYAxisDirection(): Vector {
        var directionY = this.matrix.getColumnY();
        directionY.normalize();
        return directionY;
    }

    getZAxisDirection(): Vector {
        var directionZ = this.matrix.getColumnZ();
        directionZ.normalize();
        return directionZ;
    }
}

export = Object3D;