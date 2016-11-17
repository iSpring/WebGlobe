///<amd-module name="world/graphics/Poi"/>

import Kernel = require("../Kernel");
import Graphic = require('./Graphic');
import Marker = require('../geometries/Marker');
import PoiMaterial = require('../materials/PoiMaterial');
import Program = require("../Program");
import PerspectiveCamera = require("../PerspectiveCamera");

const vs =
`
attribute vec3 aPosition;
uniform mat4 uPMVMatrix;
				
void main(void) {
  gl_Position = uPMVMatrix * vec4(aPosition, 1.0);
  gl_PointSize = 10.0;
}
`;

const fs =
`
precision mediump float;

void main()
{
	gl_FragColor = vec4(1.0, 1.0, 0.0, 0.5);
}
`;

class Poi extends Graphic {
    constructor(public geometry: Marker, public material: PoiMaterial){
        super(geometry, material);
    }

    createProgram(){
        return new Program(this.getProgramType(), vs, fs);
    }

    onDraw(camera: PerspectiveCamera){
        //aPosition
        var locPosition = this.program.getAttribLocation('aPosition');
        this.program.enableVertexAttribArray('aPosition');
        this.geometry.vbo.bind();
        Kernel.gl.vertexAttribPointer(locPosition, 3, Kernel.gl.FLOAT, false, 0, 0);

        //uPMVMatrix
        var pmvMatrix = camera.projViewMatrix;//.multiplyMatrix(this.geometry.matrix);
        var locPMVMatrix = this.program.getUniformLocation('uPMVMatrix');
        Kernel.gl.uniformMatrix4fv(locPMVMatrix, false, pmvMatrix.elements);

        //绘图,1表示1个点
        Kernel.gl.drawArrays(Kernel.gl.POINTS, 0, 1);
    }
}

export = Poi;