///<amd-module name="world/Line"/>
import Vertice = require('./Vertice');
import Vector = require('./Vector');

class Line{
    public vertice: Vertice;
    public vector: Vector;

    constructor(position: Vertice, direction: Vector){
        this.vertice = position.clone();
        this.vector = direction.clone();
        this.vector.normalize();
    }

    setVertice(position: Vertice): Line {
        this.vertice = position.clone();
        return this;
    }
    
    setVector(direction: Vector): Line {
        this.vector = direction.clone();
        this.vector.normalize();
        return this;
    }

    clone(): Line {
        var lineCopy = new Line(this.vertice, this.vector);
        return lineCopy;
    }
}

export = Line;