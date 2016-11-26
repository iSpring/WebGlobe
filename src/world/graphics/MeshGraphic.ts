///<amd-module name="world/graphics/MeshGraphic"/>

import Kernel = require("../Kernel");
import Program = require("../Program");
import Graphic = require("./Graphic");
import Mesh = require("../geometries/Mesh");
import MeshTextureMaterial = require("../materials/MeshTextureMaterial");
import Camera = require("../Camera");

const vs =
`
attribute vec3 aPosition;
attribute vec2 aUV;
varying vec2 vUV;
uniform mat4 uPMVMatrix;

void main()
{
	gl_Position = uPMVMatrix * vec4(aPosition,1.0);
	vUV = aUV;
}
`;

const fs =
`
precision mediump float;
varying vec2 vUV;
uniform sampler2D uSampler;

void main()
{
	gl_FragColor = texture2D(uSampler, vec2(vUV.s, vUV.t));
}
`;

class MeshGraphic extends Graphic {
    constructor(public geometry: Mesh, public material: MeshTextureMaterial){
        super(geometry, material);
        this.geometry.calculateVBO();
        this.geometry.calculateIBO();
        this.geometry.calculateUVBO();
    }

    isGeometryReady():boolean{
        return !!this.geometry.vbo && !!this.geometry.ibo && !!this.geometry.uvbo;
    }

    isReady():boolean{
        return this.isGeometryReady() && super.isReady();
    }

    createProgram(): Program{
        return new Program(this.getProgramType(), vs, fs);
    }

    _drawTextureMaterial(program: any) {
        var gl = Kernel.gl;

        //set aUV
        var locUV = program.getAttribLocation('aUV');
        program.enableVertexAttribArray('aUV');
        this.geometry.uvbo.bind();
        gl.vertexAttribPointer(locUV, 2, gl.FLOAT, false, 0, 0);

        //set uSampler
        var locSampler = program.getUniformLocation('uSampler');
        gl.activeTexture(gl.TEXTURE0);
        //world.Cache.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.material.texture);
        gl.uniform1i(locSampler, 0);
    }

    onDraw(camera: Camera) {
        var gl = Kernel.gl;

        //aPosition
        var locPosition = this.program.getAttribLocation('aPosition');
        this.program.enableVertexAttribArray('aPosition');
        this.geometry.vbo.bind();
        gl.vertexAttribPointer(locPosition, 3, gl.FLOAT, false, 0, 0);

        //uPMVMatrix
        var pmvMatrix = camera.projViewMatrix.multiplyMatrix(this.geometry.matrix);
        var locPMVMatrix = this.program.getUniformLocation('uPMVMatrix');
        gl.uniformMatrix4fv(locPMVMatrix, false, pmvMatrix.elements);

        this._drawTextureMaterial(this.program);

        //设置索引，但不用往shader中赋值
        this.geometry.ibo.bind();

        //绘图
        var count = this.geometry.triangles.length * 3;
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);

        //释放当前绑定对象
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

export = MeshGraphic;