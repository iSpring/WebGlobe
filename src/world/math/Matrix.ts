///<amd-module name="world/math/Matrix"/>

import Utils = require('../Utils');
import Vertice = require('./Vertice');
import Vector = require('./Vector');

class Matrix{

    private elements: Float64Array;

    constructor(m11 = 1, m12 = 0, m13 = 0, m14 = 0,
                m21 = 0, m22 = 1, m23 = 0, m24 = 0,
                m31 = 0, m32 = 0, m33 = 1, m34 = 0,
                m41 = 0, m42 = 0, m43 = 0, m44 = 1){
      this.elements = new Float64Array(16);
      this.setElements(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44);
    }

    getFloat32Array(): Float32Array {
      return new Float32Array(this.elements);
    }

    equals(matrix: Matrix): boolean{
      if(this === matrix){
        return true;
      }
      return Utils.every(this.elements, (ele: number, index: number) => {
        return ele === matrix.elements[index];
      });
    }

    setElements(m11: number, m12: number, m13: number, m14: number,
                m21: number, m22: number, m23: number, m24: number,
                m31: number, m32: number, m33: number, m34: number,
                m41: number, m42: number, m43: number, m44: number) {
      var count = arguments.length;
      if (count < 16) {
        throw "invalid arguments:arguments length error";
      }
      var values = this.elements;
      values[0] = m11;
      values[4] = m12;
      values[8] = m13;
      values[12] = m14;
      values[1] = m21;
      values[5] = m22;
      values[9] = m23;
      values[13] = m24;
      values[2] = m31;
      values[6] = m32;
      values[10] = m33;
      values[14] = m34;
      values[3] = m41;
      values[7] = m42;
      values[11] = m43;
      values[15] = m44;
      return this;
    }

    setVectorX(vector: Vector) {
      this.elements[0] = vector.x;
      this.elements[1] = vector.y;
      this.elements[2] = vector.z;
    }

    getVectorX(): Vector {
      return new Vector(this.elements[0], this.elements[1], this.elements[2]);
    }

    setVectorY(vector: Vector) {
      this.elements[4] = vector.x;
      this.elements[5] = vector.y;
      this.elements[6] = vector.z;
    }

    getVectorY(): Vector {
      return new Vector(this.elements[4], this.elements[5], this.elements[6]);
    }

    setVectorZ(vector: Vector) {
      this.elements[8] = vector.x;
      this.elements[9] = vector.y;
      this.elements[10] = vector.z;
    }

    getVectorZ(): Vector {
      return new Vector(this.elements[8], this.elements[9], this.elements[10]);
    }

    setPosition(vertice: Vertice) {
      this.elements[12] = vertice.x;
      this.elements[13] = vertice.y;
      this.elements[14] = vertice.z;
    }

    getPosition(): Vertice {
      return new Vertice(this.elements[12], this.elements[13], this.elements[14]);
    }

    setLastRowDefault(): void {
      this.elements[3] = 0;
      this.elements[7] = 0;
      this.elements[11] = 0;
      this.elements[15] = 1;
    }

    //对当前矩阵进行转置，并对当前矩阵产生影响
    transpose(): void {
      var result = this.getTransposeMatrix();
      this.setMatrixByOther(result);
    }

    //返回当前矩阵的转置矩阵,不对当前矩阵产生影响
    getTransposeMatrix(): Matrix {
      var result: Matrix = new Matrix();
      result.elements[0] = this.elements[0];
      result.elements[4] = this.elements[1];
      result.elements[8] = this.elements[2];
      result.elements[12] = this.elements[3];

      result.elements[1] = this.elements[4];
      result.elements[5] = this.elements[5];
      result.elements[9] = this.elements[6];
      result.elements[13] = this.elements[7];

      result.elements[2] = this.elements[8];
      result.elements[6] = this.elements[9];
      result.elements[10] = this.elements[10];
      result.elements[14] = this.elements[11];

      result.elements[3] = this.elements[12];
      result.elements[7] = this.elements[13];
      result.elements[11] = this.elements[14];
      result.elements[15] = this.elements[15];
      return result;
    }

    //对当前矩阵进行取逆操作，并对当前矩阵产生影响
    inverse(): void {
      var result = this.getInverseMatrix();
      this.setMatrixByOther(result);
    }

    //返回当前矩阵的逆矩阵，不对当前矩阵产生影响
    getInverseMatrix(): Matrix {
      var a = this.elements;
      var result: Matrix = new Matrix();
      var b = result.elements;
      var c = a[0],
          d = a[1],
          e = a[2],
          g = a[3],
          f = a[4],
          h = a[5],
          i = a[6],
          j = a[7],
          k = a[8],
          l = a[9],
          n = a[10],
          o = a[11],
          m = a[12],
          p = a[13],
          r = a[14],
          s = a[15];
      var A = c * h - d * f;
      var B = c * i - e * f;
      var t = c * j - g * f;
      var u = d * i - e * h;
      var v = d * j - g * h;
      var w = e * j - g * i;
      var x = k * p - l * m;
      var y = k * r - n * m;
      var z = k * s - o * m;
      var C = l * r - n * p;
      var D = l * s - o * p;
      var E = n * s - o * r;
      var q = A * E - B * D + t * C + u * z - v * y + w * x;
      if (!q) {
        console.log("can't get inverse matrix");
        return null
      }
      q = 1 / q;
      b[0] = (h * E - i * D + j * C) * q;
      b[1] = (-d * E + e * D - g * C) * q;
      b[2] = (p * w - r * v + s * u) * q;
      b[3] = (-l * w + n * v - o * u) * q;
      b[4] = (-f * E + i * z - j * y) * q;
      b[5] = (c * E - e * z + g * y) * q;
      b[6] = (-m * w + r * t - s * B) * q;
      b[7] = (k * w - n * t + o * B) * q;
      b[8] = (f * D - h * z + j * x) * q;
      b[9] = (-c * D + d * z - g * x) * q;
      b[10] = (m * v - p * t + s * A) * q;
      b[11] = (-k * v + l * t - o * A) * q;
      b[12] = (-f * C + h * y - i * x) * q;
      b[13] = (c * C - d * y + e * x) * q;
      b[14] = (-m * u + p * B - r * A) * q;
      b[15] = (k * u - l * B + n * A) * q;
      return result;
    }

    setMatrixByOther(otherMatrix: Matrix): void {
      for (var i = 0; i < otherMatrix.elements.length; i++) {
        this.elements[i] = otherMatrix.elements[i];
      }
    }

    /**
     * 将矩阵设置为单位阵
     */
    setUnitMatrix(): void {
      this.setElements(
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
      );
    }

    setUniqueValue(value: number){
      //TypeArray of IE11 doesn't support forEach method
      var length = this.elements.length;
      for(var i = 0; i < length; i++){
        this.elements[i] = value;
      }
    }

    /**
     * 判断矩阵是否为单位阵
     * @returns {boolean}
     */
    isUnitMatrix(): boolean {
      var values = this.elements;
      for (var i = 0; i < values.length; i++) {
        if (i % 4 === 0) {
          if (values[i] != 1) {
            //斜对角线上的值需要为1
            return false;
          }
        } else {
          if (values[i] !== 0) {
            //非斜对角线上的值需要为0
            return false;
          }
        }
      }
      return true;
    }

    clone(): Matrix {
      return new Matrix(
          this.elements[0], this.elements[4], this.elements[8], this.elements[12],
          this.elements[1], this.elements[5], this.elements[9], this.elements[13],
          this.elements[2], this.elements[6], this.elements[10], this.elements[14],
          this.elements[3], this.elements[7], this.elements[11], this.elements[15]
      );
    }

    multiplyMatrix(otherMatrix: Matrix): Matrix {
      var values1 = this.elements;
      var values2 = otherMatrix.elements;
      var m11 = values1[0] * values2[0] + values1[4] * values2[1] + values1[8] * values2[2] + values1[12] * values2[3];
      var m12 = values1[0] * values2[4] + values1[4] * values2[5] + values1[8] * values2[6] + values1[12] * values2[7];
      var m13 = values1[0] * values2[8] + values1[4] * values2[9] + values1[8] * values2[10] + values1[12] * values2[11];
      var m14 = values1[0] * values2[12] + values1[4] * values2[13] + values1[8] * values2[14] + values1[12] * values2[15];
      var m21 = values1[1] * values2[0] + values1[5] * values2[1] + values1[9] * values2[2] + values1[13] * values2[3];
      var m22 = values1[1] * values2[4] + values1[5] * values2[5] + values1[9] * values2[6] + values1[13] * values2[7];
      var m23 = values1[1] * values2[8] + values1[5] * values2[9] + values1[9] * values2[10] + values1[13] * values2[11];
      var m24 = values1[1] * values2[12] + values1[5] * values2[13] + values1[9] * values2[14] + values1[13] * values2[15];
      var m31 = values1[2] * values2[0] + values1[6] * values2[1] + values1[10] * values2[2] + values1[14] * values2[3];
      var m32 = values1[2] * values2[4] + values1[6] * values2[5] + values1[10] * values2[6] + values1[14] * values2[7];
      var m33 = values1[2] * values2[8] + values1[6] * values2[9] + values1[10] * values2[10] + values1[14] * values2[11];
      var m34 = values1[2] * values2[12] + values1[6] * values2[13] + values1[10] * values2[14] + values1[14] * values2[15];
      var m41 = values1[3] * values2[0] + values1[7] * values2[1] + values1[11] * values2[2] + values1[15] * values2[3];
      var m42 = values1[3] * values2[4] + values1[7] * values2[5] + values1[11] * values2[6] + values1[15] * values2[7];
      var m43 = values1[3] * values2[8] + values1[7] * values2[9] + values1[11] * values2[10] + values1[15] * values2[11];
      var m44 = values1[3] * values2[12] + values1[7] * values2[13] + values1[11] * values2[14] + values1[15] * values2[15];
      return new Matrix(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44);
    }

    /**
     * 计算矩阵与列向量的乘积
     * @param c 四元数组
     * @return {Matrix} 列向量，四元数组
     */
    multiplyColumn(c: number[]) : number[] {
      var valid = c.length == 4;
      if (!valid) {
        throw "invalid c";
      }
      var values1 = this.elements;
      var values2 = c;
      var m11 = values1[0] * values2[0] + values1[4] * values2[1] + values1[8] * values2[2] + values1[12] * values2[3];
      var m21 = values1[1] * values2[0] + values1[5] * values2[1] + values1[9] * values2[2] + values1[13] * values2[3];
      var m31 = values1[2] * values2[0] + values1[6] * values2[1] + values1[10] * values2[2] + values1[14] * values2[3];
      var m41 = values1[3] * values2[0] + values1[7] * values2[1] + values1[11] * values2[2] + values1[15] * values2[3];
      return [m11, m21, m31, m41];
    }

    hasNaN():boolean{
      return Utils.some(this.elements, function(v){
        return isNaN(v);
      });
    }

    divide(a: number) {
      if (a === 0) {
        throw "invalid a:a is 0";
      }
      if (a !== 0) {
        for (var i = 0, length = this.elements.length; i < length; i++) {
          this.elements[i] /= a;
        }
      }
    }

    worldTranslate(x: number, y: number, z: number) {
      this.elements[12] += x;
      this.elements[13] += y;
      this.elements[14] += z;
    }

    localTranslate(x: number, y: number, z: number) {
      var localColumn = [x, y, z, 1];
      var worldColumn = this.multiplyColumn(localColumn);
      var origin = this.getPosition();
      this.worldTranslate(worldColumn[0] - origin.x, worldColumn[1] - origin.y, worldColumn[2] - origin.z);
    }

    worldScale(scaleX: number, scaleY: number, scaleZ: number): void {
      scaleX = (scaleX !== undefined) ? scaleX : 1;
      scaleY = (scaleY !== undefined) ? scaleY : 1;
      scaleZ = (scaleZ !== undefined) ? scaleZ : 1;
      var m = new Matrix(scaleX, 0, 0, 0,
        0, scaleY, 0, 0,
        0, 0, scaleZ, 0,
        0, 0, 0, 1);
      var result = m.multiplyMatrix(this);
      this.setMatrixByOther(result);
    }

    localScale(scaleX: number, scaleY: number, scaleZ: number): void {
      var transVertice = this.getPosition();
      this.setPosition(new Vertice(0, 0, 0));
      this.worldScale(scaleX, scaleY, scaleZ);
      this.setPosition(transVertice);
    }

    worldRotateX(radian: number): void {
      var c = Math.cos(radian);
      var s = Math.sin(radian);
      var m = new Matrix(1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1);
      var result = m.multiplyMatrix(this);
      this.setMatrixByOther(result);
    }

    worldRotateY(radian: number): void {
      var c = Math.cos(radian);
      var s = Math.sin(radian);
      var m = new Matrix(c, 0, s, 0,
        0, 1, 0, 0, -s, 0, c, 0,
        0, 0, 0, 1);
      var result = m.multiplyMatrix(this);
      this.setMatrixByOther(result);
    }

    worldRotateZ(radian: number) {
      var c = Math.cos(radian);
      var s = Math.sin(radian);
      var m = new Matrix(c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);
      var result = m.multiplyMatrix(this);
      this.setMatrixByOther(result);
    }

    worldRotateByVector(radian: number, vector: Vector): void {
      var x = vector.x;
      var y = vector.y;
      var z = vector.z;

      var length:number, s:number, c:number;
      var xx:number, yy:number, zz:number, xy:number, yz:number, zx:number, xs:number, ys:number, zs:number, one_c:number;

      s = Math.sin(radian);
      c = Math.cos(radian);

      length = Math.sqrt(x * x + y * y + z * z);

      // Rotation matrix is normalized
      x /= length;
      y /= length;
      z /= length;

      xx = x * x;
      yy = y * y;
      zz = z * z;
      xy = x * y;
      yz = y * z;
      zx = z * x;
      xs = x * s;
      ys = y * s;
      zs = z * s;
      one_c = 1.0 - c;

      var m11 = (one_c * xx) + c; //M(0,0)
      var m12 = (one_c * xy) - zs; //M(0,1)
      var m13 = (one_c * zx) + ys; //M(0,2)
      var m14 = 0.0; //M(0,3) 表示平移X

      var m21 = (one_c * xy) + zs; //M(1,0)
      var m22 = (one_c * yy) + c; //M(1,1)
      var m23 = (one_c * yz) - xs; //M(1,2)
      var m24 = 0.0; //M(1,3)  表示平移Y

      var m31 = (one_c * zx) - ys; //M(2,0)
      var m32 = (one_c * yz) + xs; //M(2,1)
      var m33 = (one_c * zz) + c; //M(2,2)
      var m34 = 0.0; //M(2,3)  表示平移Z

      var m41 = 0.0; //M(3,0)
      var m42 = 0.0; //M(3,1)
      var m43 = 0.0; //M(3,2)
      var m44 = 1.0; //M(3,3)

      var mat = new Matrix(m11, m12, m13, m14,
        m21, m22, m23, m24,
        m31, m32, m33, m34,
        m41, m42, m43, m44);
      var result = mat.multiplyMatrix(this);
      this.setMatrixByOther(result);
    }

    localRotateX(radian: number): void {
      var transVertice = this.getPosition();
      this.setPosition(new Vertice(0, 0, 0));
      var columnX = this.getVectorX();
      this.worldRotateByVector(radian, columnX);
      this.setPosition(transVertice);
    }

    localRotateY(radian: number): void {
      var transVertice = this.getPosition();
      this.setPosition(new Vertice(0, 0, 0));
      var columnY = this.getVectorY();
      this.worldRotateByVector(radian, columnY);
      this.setPosition(transVertice);
    }

    localRotateZ(radian: number): void {
      var transVertice = this.getPosition();
      this.setPosition(new Vertice(0, 0, 0));
      var columnZ = this.getVectorZ();
      this.worldRotateByVector(radian, columnZ);
      this.setPosition(transVertice);
    }

    //localVector指的是相对于模型坐标系中的向量
    localRotateByVector(radian: number, localVector: Vector) {
      var localColumn = localVector.getArray();
      localColumn.push(1); //四元数组
      var worldColumn = this.multiplyColumn(localColumn); //模型坐标转换为世界坐标
      var worldVector = new Vector(worldColumn[0], worldColumn[1], worldColumn[2]);

      var transVertice = this.getPosition();
      this.setPosition(new Vertice(0, 0, 0));
      this.worldRotateByVector(radian, worldVector);
      this.setPosition(transVertice);
    }
  };

  export = Matrix;