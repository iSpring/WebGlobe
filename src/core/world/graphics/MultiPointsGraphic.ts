import Kernel from '../Kernel';
import Utils from '../Utils';
import Camera from '../Camera';
import MathUtils from '../math/Utils';
import Program from '../Program';
import Graphic from '../graphics/Graphic';
import MarkerTextureMaterial from '../materials/MarkerTextureMaterial';
import VertexBufferObject from '../VertexBufferObject';
import Vertice from '../math/Vertice';

const vs =
`
attribute vec3 aPosition;
uniform mat4 uPMVMatrix;
uniform float uSize;

void main(void) {
  gl_Position = uPMVMatrix * vec4(aPosition, 1.0);
  gl_PointSize = uSize;
}
`;

//http://stackoverflow.com/questions/3497068/textured-points-in-opengl-es-2-0
//gl_FragColor = texture2D(uSampler, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));

//https://www.opengl.org/sdk/docs/tutorials/ClockworkCoders/discard.php
//highp mediump
const fs =
`
precision mediump float;
uniform sampler2D uSampler;

void main()
{
	vec4 color = texture2D(uSampler, vec2(gl_PointCoord.x, gl_PointCoord.y));
    if(color.a == 0.0){
        discard;
    }
    gl_FragColor = color;
}
`;

export default class MultiPointsGraphic extends Graphic {
  private vbo: VertexBufferObject = null;
  private vertices: Vertice[] = null;

  constructor(public material: MarkerTextureMaterial) {
    super(null, material);
    this.vbo = new VertexBufferObject(Kernel.gl.ARRAY_BUFFER);
    this.vertices = [];
    // this._addPoi(116.408540, 39.902350, "3161565500563468633", "首都大酒店", "北京市东城区前门东大街3号", "");
  }

  // static getInstance(iconUrl: string, iconSize: number = 16) {
  //   var material = new MarkerTextureMaterial(iconUrl, iconSize);
  //   return new MultiPointsGraphic(material);
  // }

  createProgram() {
    return Program.getProgram(vs, fs);
  }

  isReady(): boolean {
    return !!(this.vertices.length > 0 && this.material && this.material.isReady());
  }

  onDraw(camera: Camera) {
    var gl = Kernel.gl;

    gl.disable(Kernel.gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.enable(Kernel.gl.BLEND);
    gl.blendFunc(Kernel.gl.SRC_ALPHA, Kernel.gl.ONE_MINUS_SRC_ALPHA);

    //aPosition
    var locPosition = this.program.getAttribLocation('aPosition');
    this.program.enableVertexAttribArray('aPosition');
    this.vbo.bind();
    var vertices: number[] = [];
    this.vertices.map(function (vertice) {
      vertices.push(vertice.x, vertice.y, vertice.z);
    });
    this.vbo.bufferData(vertices, Kernel.gl.DYNAMIC_DRAW, true);
    gl.vertexAttribPointer(locPosition, 3, Kernel.gl.FLOAT, false, 0, 0);

    //uPMVMatrix
    var pmvMatrix = camera.getProjViewMatrixForDraw();
    var locPMVMatrix = this.program.getUniformLocation('uPMVMatrix');
    gl.uniformMatrix4fv(locPMVMatrix, false, pmvMatrix.getFloat32Array());

    //uSize
    var locSize = this.program.getUniformLocation('uSize');
    gl.uniform1f(locSize, this.material.size);

    //set uSampler
    var locSampler = this.program.getUniformLocation('uSampler');
    gl.activeTexture(Kernel.gl.TEXTURE0);
    gl.bindTexture(Kernel.gl.TEXTURE_2D, this.material.texture);
    gl.uniform1i(locSampler, 0);

    //绘图,vertices.length / 3表示所绘点的个数
    gl.drawArrays(Kernel.gl.POINTS, 0, vertices.length / 3);

    //释放当前绑定对象
    gl.enable(Kernel.gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(Kernel.gl.BLEND);
    // gl.bindBuffer(Kernel.gl.ARRAY_BUFFER, null);
    // gl.bindBuffer(Kernel.gl.ELEMENT_ARRAY_BUFFER, null);
    // gl.bindTexture(Kernel.gl.TEXTURE_2D, null);
  }

  setLonlats(lonlats:number[][]){
    //不要调用this.clear()，否则会触发调用子类的clear方法
    MultiPointsGraphic.prototype.clear.apply(this);
    this.vertices = [];
    lonlats.forEach((lonlat) => {
      var p = MathUtils.geographicToCartesianCoord(lonlat[0], lonlat[1], Kernel.EARTH_RADIUS + 0.001);
      this.vertices.push(p);
    });
  }

  clear() {
    this.vertices = [];
  }
};