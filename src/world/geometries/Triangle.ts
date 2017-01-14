import Vertice = require("./MeshVertice");

class Triangle{

	constructor(public v1: Vertice, public v2: Vertice, public v3: Vertice){}

	setColor(c: number[]){
		this.v1.c = this.v2.c = this.v3.c = c;
	}

  static assembleQuad(leftTop: Vertice, leftBottom: Vertice, rightTop: Vertice, rightBottom: Vertice): Triangle[]{
    return [new Triangle(leftTop, leftBottom, rightTop), new Triangle(rightTop, leftBottom, rightBottom)];
  }
}

export = Triangle;