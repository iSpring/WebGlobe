///<amd-module name="world/geometries/Triangle"/>
import Vertice = require("./Vertice");

class Triangle{

	constructor(public v1: Vertice, public v2: Vertice, public v3: Vertice){}

	setColor(c: number[]){
		this.v1.c = this.v2.c = this.v3.c = c;
	}
}

export = Triangle;