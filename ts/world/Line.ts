///<amd-module name="world/Line"/>
import Vertice = require('./Vertice');
import Vector = require('./Vector');

class Line{
    public vertice: Vertice;
    public vector: Vector;

    constructor(position: Vertice, direction: Vector){
        this.vertice = position.getCopy();
        this.vector = direction.getCopy();
        this.vector.normalize();
    }

    setVertice(position: Vertice): Line {
        this.vertice = position.getCopy();
        return this;
    }
    
    setVector(direction: Vector): Line {
        this.vector = direction.getCopy();
        this.vector.normalize();
        return this;
    }

    getCopy(): Line {
        var lineCopy = new Line(this.vertice, this.vector);
        return lineCopy;
    }
}

export = Line;