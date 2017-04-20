import Kernel from '../Kernel';
import Program from '../Program';
import Graphic from './Graphic';
import Mesh from '../geometries/Mesh';
import MeshVertice from '../geometries/MeshVertice';
import MeshColorMaterial from '../materials/MeshColorMaterial';
import Camera from '../Camera';

const vs =
`
attribute vec3 aPosition;
attribute vec3 aColor;
varying vec4 vColor;
uniform mat4 uPMVMatrix;

void main()
{
	gl_Position = uPMVMatrix * vec4(aPosition,1.0);
	vColor = vec4(aColor,1.0);
}
`;

const fs =
`
precision mediump float;
varying vec4 vColor;

void main()
{
	gl_FragColor = vColor;
}
`;

export default class MeshColorGraphic extends Graphic {
    constructor(public geometry: Mesh, public material: MeshColorMaterial){
        super(geometry, material);
        this.setGeometry(geometry);
    }

    setGeometry(geometry: Mesh){
        if(this.geometry){
            this.geometry.destroy();
        }
        this.geometry = geometry;
        if(this.geometry){
            this.geometry.vertices.forEach((vertice: MeshVertice) => {
                vertice.c = this.material.color;
            });
            this.geometry.calculateVBO();
            this.geometry.calculateIBO();
            this.geometry.calculateCBO();
        }
    }

    isGeometryReady():boolean{
        return !!this.geometry.vbo && !!this.geometry.ibo && !!this.geometry.cbo;
    }

    isReady():boolean{
        return this.isGeometryReady() && super.isReady();
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
    }

    protected onDraw(camera: Camera) {
        var gl = Kernel.gl;

        this.updateShaderUniforms(camera);

        //aPosition
        var locPosition = this.program.getAttribLocation('aPosition');
        this.program.enableVertexAttribArray('aPosition');
        this.geometry.vbo.bind();
        gl.vertexAttribPointer(locPosition, 3, WebGLRenderingContext.FLOAT, false, 0, 0);

        //aColor
        var locColor = this.program.getAttribLocation('aColor');
        this.program.enableVertexAttribArray('aColor');
        this.geometry.cbo.bind();
        gl.vertexAttribPointer(locColor, 3, WebGLRenderingContext.FLOAT, false, 0, 0);

        //设置索引，但不用往shader中赋值
        this.geometry.ibo.bind();

        //绘图
        var count = this.geometry.triangles.length * 3;
        gl.drawElements(WebGLRenderingContext.TRIANGLES, count, WebGLRenderingContext.UNSIGNED_SHORT, 0);

        //释放当前绑定对象
        // gl.bindBuffer(gl.ARRAY_BUFFER, null);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
};