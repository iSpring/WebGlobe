///<amd-module name="world/graphics/Poi"/>

import Kernel = require("../Kernel");
import MeshGraphic = require('./MeshGraphic');
import Marker = require('../geometries/Marker');
import MeshTextureMaterial = require('../materials/MeshTextureMaterial');
import Program = require("../Program");
import Camera from "../Camera";
import AtmosphereGeometry = require("../geometries/Atmosphere");

class Atmosphere extends MeshGraphic {
    constructor(public geometry: AtmosphereGeometry, public material: MeshTextureMaterial){
        super(geometry, material);
    }

    onDraw(camera: Camera){
        super.onDraw(camera);
        // var gl = Kernel.gl;

        // //gl.disable(gl.DEPTH_TEST);
        // gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // //aPosition
        // var locPosition = this.program.getAttribLocation('aPosition');
        // this.program.enableVertexAttribArray('aPosition');
        // this.geometry.vbo.bind();
        // gl.vertexAttribPointer(locPosition, 3, gl.FLOAT, false, 0, 0);

        // //uPMVMatrix
        // var pmvMatrix = camera.getProjViewMatrixForDraw();
        // var locPMVMatrix = this.program.getUniformLocation('uPMVMatrix');
        // gl.uniformMatrix4fv(locPMVMatrix, false, pmvMatrix.elements);

        // //uSize
        // var locSize = this.program.getUniformLocation('uSize');
        // gl.uniform1f(locSize, this.material.size);

        // //set uSampler
        // var locSampler = this.program.getUniformLocation('uSampler');
        // gl.activeTexture(gl.TEXTURE0);
        // //world.Cache.activeTexture(gl.TEXTURE0);
        // gl.bindTexture(gl.TEXTURE_2D, this.material.texture);
        // gl.uniform1i(locSampler, 0);

        // //绘图,1表示1个点
        // gl.drawArrays(gl.POINTS, 0, 1);

        // //释放当前绑定对象
        // //gl.enable(gl.DEPTH_TEST);
        // gl.disable(gl.BLEND);
        // gl.bindBuffer(gl.ARRAY_BUFFER, null);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        // gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

export = Atmosphere;