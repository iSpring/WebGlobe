///<amd-module name="world/Vertice"/>

class Vertice{
    constructor(public x = 0, public y = 0, public z = 0){}

    // minus(otherVertice: Vertice) : Vector {
    //   var x = this.x - otherVertice.x;
    //   var y = this.y - otherVertice.y;
    //   var z = this.z - otherVertice.z;
    //   return new Vector(x, y, z);
    // }

    // plus(otherVector: Vector) : Vertice {
    //   var x = this.x + otherVector.x;
    //   var y = this.y + otherVector.y;
    //   var z = this.z + otherVector.z;
    //   return new Vertice(x, y, z);
    // }

    // getVector(): Vector {
    //   return new Vector(this.x, this.y, this.z);
    // }

    getArray(): number[] {
      return [this.x, this.y, this.z];
    }

    getCopy(): Vertice {
      return new Vertice(this.x, this.y, this.z);
    }

    getOpposite(): Vertice {
      return new Vertice(-this.x, -this.y, -this.z);
    }
}

export = Vertice;