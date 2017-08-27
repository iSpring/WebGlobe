import Kernel from '../Kernel';
import Program from '../Program';
import Graphic from './Graphic';
import Mesh from '../geometries/Mesh';
import MeshTextureMaterial from '../materials/MeshTextureMaterial';
import Camera from '../Camera';
import Line from '../math/Line';
import {Drawable, Pickable, Attributes} from '../Definitions.d';

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

export default class MeshTextureGraphic extends Graphic implements Pickable {
    constructor(public geometry: Mesh, public material: MeshTextureMaterial, public attributes: Attributes = null){
        super(geometry, material, attributes);
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

    static findProgram(): Program{
        return Program.findProgram(vs, fs);
    }

    createProgram(): Program{
        return Program.getProgram(vs, fs);
    }

    protected updateShaderUniforms(camera: Camera){
        //uPMVMatrix
        var gl = Kernel.gl;
        var pmvMatrix = camera.getProjViewMatrixForDraw().multiplyMatrix(this.geometry.getMatrix());
        var locPMVMatrix = this.program.getUniformLocation('uPMVMatrix');
        gl.uniformMatrix4fv(locPMVMatrix, false, pmvMatrix.getFloat32Array());

        //uSampler
        gl.activeTexture(Kernel.gl.TEXTURE0);
        var locSampler = this.program.getUniformLocation('uSampler');
        gl.uniform1i(locSampler, 0);
    }

    protected onDraw(camera: Camera) {
        var gl = Kernel.gl;

        this.updateShaderUniforms(camera);

        //aPosition
        var locPosition = this.program.getAttribLocation('aPosition');
        this.program.enableVertexAttribArray('aPosition');
        this.geometry.vbo.bind();
        gl.vertexAttribPointer(locPosition, 3, Kernel.gl.FLOAT, false, 0, 0);

        //set aUV
        var locUV = this.program.getAttribLocation('aUV');
        this.program.enableVertexAttribArray('aUV');
        this.geometry.uvbo.bind();
        gl.vertexAttribPointer(locUV, 2, Kernel.gl.FLOAT, false, 0, 0);

        //set uSampler
        gl.bindTexture(Kernel.gl.TEXTURE_2D, this.material.texture);

        //设置索引，但不用往shader中赋值
        this.geometry.ibo.bind();

        //绘图
        var count = this.geometry.triangles.length * 3;
        gl.drawElements(Kernel.gl.TRIANGLES, count, Kernel.gl.UNSIGNED_SHORT, 0);

        //释放当前绑定对象
        // gl.bindBuffer(gl.ARRAY_BUFFER, null);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        // gl.bindTexture(gl.TEXTURE_2D, null);
    }

    ifIntersectLocalLine(localLine: Line):boolean {
        if(this.geometry){
            return this.geometry.ifIntersectLocalLine(localLine);
        }
        return false;
    }

    ifIntersectWorldLine(worldLine: Line): boolean{
        if(this.geometry){
            return this.geometry.ifIntersectWorldLine(worldLine);
        }
        return false;
    }
};