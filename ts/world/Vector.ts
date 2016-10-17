///<amd-module name="world/Vector"/>
import Vertice = require('./Vertice');

class Vector{
    constructor(public x = 0, public y = 0, public z = 0){}

    static verticeAsVector(vertice: Vertice): Vector{
      return new Vector(vertice.x, vertice.y, vertice.z);
    }

    static verticeMinusVertice(endVertice: Vertice, startVertice: Vertice): Vector{
      return new Vector(endVertice.x - startVertice.x, endVertice.y - startVertice.y, endVertice.z - startVertice.z);
    }

    static verticePlusVector(vertice: Vertice, vector: Vector): Vertice{
      return new Vertice(vertice.x + vector.x, vertice.y + vector.y, vertice.z + vector.z);
    }

    getVertice(): Vertice {
      return new Vertice(this.x, this.y, this.z);
    }

    getArray(): number[] {
      return [this.x, this.y, this.z];
    }

    getCopy(): Vector {
      return new Vector(this.x, this.y, this.z);
    }

    getOpposite(): Vector {
      return new Vector(-this.x, -this.y, -this.z);
    }

    getLength(): number {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize(): Vector {
      var length = this.getLength();
      if(Math.abs(length) >= 0.000001) {
        this.x /= length;
        this.y /= length;
        this.z /= length;
      } else {
        this.x = 0;
        this.y = 0;
        this.z = 0;
      }

      return this;
    }

    setLength(length: number): Vector {
      this.normalize();
      this.x *= length;
      this.y *= length;
      this.z *= length;
      return this;
    }

    /**
     * 得到该向量的一个随机垂直向量
     * @return {*}
     */
    getRandomVerticalVector(): Vector {
      var result: Vector;
      var length = this.getLength();
      if (length === 0) {
        result = new Vector(0, 0, 0);
      } else {
        var x2:number, y2:number, z2:number;
        if (this.x !== 0) {
          y2 = 1;
          z2 = 0;
          x2 = -this.y / this.x;
        } else if (this.y !== 0) {
          z2 = 1;
          x2 = 0;
          y2 = -this.z / this.y;
        } else if (this.z !== 0) {
          x2 = 1;
          y2 = 0;
          z2 = -this.x / this.z;
        }
        result = new Vector(x2, y2, z2);
        result.normalize();
      }
      return result;
    }

    /**
     * 计算与另一个向量的叉乘
     * @param other
     * @return {World.Vector}
     */
    cross(other: Vector): Vector {
      if (!(other instanceof Vector)) {
        throw "invalid other";
      }
      var x = this.y * other.z - this.z * other.y;
      var y = this.z * other.x - this.x * other.z;
      var z = this.x * other.y - this.y * other.x;
      return new Vector(x, y, z);
    }

    /**
     * 计算与另一个向量的点乘
     * @param other 另一个向量
     * @return {*} 数字
     */
    dot(other: Vector): number {
      if (!(other instanceof Vector)) {
        throw "invalid other";
      }
      return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    /**
     * 得到某点绕该向量旋转radian弧度后的新点
     * @param vertice 初始点
     * @param radian 旋转的角度
     * @return {World.Vertice} 被旋转之后的点
     */
    /*rotateVertice: function(vertice, radian) {
      var Matrix = this._requireMatrix();
      var Vertice = this._requireVertice();
      if (!(vertice instanceof Vertice)) {
        throw "invalid vertice";
      }
      if (!Utils.isNumber(radian)) {
        throw "invalid radian";
      }
      var mat = new Matrix();
      mat.worldRotateByVector(radian, this);
      var point = [vertice.x, vertice.y, vertice.z, 1];
      var newPoint = mat.multiplyColumn(point);
      var newVertice = new Vertice(newPoint[0], newPoint[1], newPoint[2]);
      return newVertice;
    },*/

    /**
     * 得到other向量绕该向量旋转radian弧度后的新向量
     * @param other 初始向量
     * @param radian 旋转的角度
     * @return {World.Vector} 被旋转之后的向量
     */
    /*rotateVector: function(otherVector, radian) {
      if (!(otherVector instanceof Vector)) {
        throw "invalid otherVector";
      }
      if (!Utils.isNumber(radian)) {
        throw "invalid radian";
      }
      var vertice = otherVector.getVertice();
      var newVertice = this.rotateVertice(vertice, radian);
      var newVector = newVertice.getVector();
      return newVector;
    }*/
}

export = Vector;