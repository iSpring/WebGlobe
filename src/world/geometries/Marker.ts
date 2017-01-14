import Kernel = require("../Kernel");
import Geometry = require('./Geometry');
import VertexBufferObject = require("../VertexBufferObject");

class Marker implements Geometry{

    vbo: VertexBufferObject;

    constructor(public x: number, public y: number, public z: number){
        this.vbo = new VertexBufferObject(Kernel.gl.ARRAY_BUFFER);
        this.vbo.bind();
		this.vbo.bufferData([x,y,z], Kernel.gl.STATIC_DRAW, true);
		// this.vbo.unbind();
    }

    destroy(){
        this.vbo.destroy();
        this.vbo = null;
    }
}

export = Marker;