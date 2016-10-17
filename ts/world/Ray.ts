///<amd-module name="world/Ray"/>
import Vertice = require('./Vertice');
import Vector = require('./Vector');

class Ray{
    public vertice: Vertice;
    public vector: Vector;
    /**
     * 射线
     * @param position 射线起点 World.Vertice类型
     * @param direction 射线方向 World.Vector类型
     * @constructor
     */
    constructor(position: Vertice, direction: Vector){
        this.vertice = position.getCopy();
        this.vector = direction.getCopy();
        this.vector.normalize();
    }

    setVertice(position: Vertice): Ray {
        this.vertice = position.getCopy();
        return this;
    }

    setVector(direction: Vector): Ray {
        this.vector = direction.getCopy();
        this.vector.normalize();
        return this;
    }

    getCopy(): Ray {
        var rayCopy = new Ray(this.vertice, this.vector);
        return rayCopy;
    }
    
    rotateVertice(vertice: Vertice): Vertice {
        return null;
    }
}

export = Ray;