class Vertice{
    constructor(public x = 0, public y = 0, public z = 0){}

    getArray(): number[] {
      return [this.x, this.y, this.z];
    }

    clone(): Vertice {
      return new Vertice(this.x, this.y, this.z);
    }

    getOpposite(): Vertice {
      return new Vertice(-this.x, -this.y, -this.z);
    }
}

export = Vertice;