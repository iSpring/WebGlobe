///<amd-module name="world/layers/PoiLayer" />

import Kernel = require('../Kernel');
import Utils = require('../Utils');
import Extent = require('../Extent');
import Camera from '../Camera';
import MathUtils = require('../math/Utils');
import Program = require('../Program');
import Graphic = require('../graphics/Graphic');
import PoiMaterial = require('../materials/PoiMaterial');
import VertexBufferObject = require('../VertexBufferObject');

class Poi {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public uuid: string,
    public name: string,
    public address: string,
    public phone: string) { }
}

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

class PoiLayer extends Graphic {
  private keyword: string = null;
  private pois: Poi[] = null;
  private vbo: VertexBufferObject = null;

  private constructor(public material: PoiMaterial) {
    super(null, material);
    this.pois = [];
    this.vbo = new VertexBufferObject(Kernel.gl.ARRAY_BUFFER);
    this._addPoi(116.408540, 39.902350, "3161565500563468633", "首都大酒店", "北京市东城区前门东大街3号", "")
  }

  static getInstance() {
    var url = "/WebGlobe/src/world/images/poi.png";
    var material = new PoiMaterial(url, 24);
    return new PoiLayer(material);
  }

  createProgram() {
    return Program.getProgram(vs, fs);
  }

  isReady(): boolean {
    return !!(this.pois.length > 0 && this.material && this.material.isReady());
  }

  onDraw(camera: Camera) {
    var gl = Kernel.gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //aPosition
    var locPosition = this.program.getAttribLocation('aPosition');
    this.program.enableVertexAttribArray('aPosition');
    this.vbo.bind();
    var vertices: number[] = [];
    this.pois.map(function (poi) {
      vertices.push(poi.x, poi.y, poi.z);
    });
    this.vbo.bufferData(vertices, gl.DYNAMIC_DRAW, true);
    gl.vertexAttribPointer(locPosition, 3, gl.FLOAT, false, 0, 0);

    //uPMVMatrix
    var pmvMatrix = camera.getProjViewMatrixForDraw();
    var locPMVMatrix = this.program.getUniformLocation('uPMVMatrix');
    gl.uniformMatrix4fv(locPMVMatrix, false, pmvMatrix.getFloat32Array());

    //uSize
    var locSize = this.program.getUniformLocation('uSize');
    gl.uniform1f(locSize, this.material.size);

    //set uSampler
    var locSampler = this.program.getUniformLocation('uSampler');
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.material.texture);
    gl.uniform1i(locSampler, 0);

    //绘图,vertices.length / 3表示所绘点的个数
    gl.drawArrays(gl.POINTS, 0, vertices.length / 3);

    //释放当前绑定对象
    gl.disable(gl.BLEND);
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    // gl.bindTexture(gl.TEXTURE_2D, null);
  }

  clear() {
    this.keyword = null;
    this.pois = [];
  }

  private _addPoi(lon: number, lat: number, uuid: string, name: string, address: string, phone: string) {
    var p = MathUtils.geographicToCartesianCoord(lon, lat, Kernel.EARTH_RADIUS + 0.001);
    var poi = new Poi(p.x, p.y, p.z, uuid, name, address, phone);
    this.pois.push(poi);
    return poi;
  }

  static search(wd: string, level: number, minLon: number, minLat: number, maxLon: number, maxLat: number, callback: (response: any) => void, pageCapacity: number = 50, pageIndex: number = 0) {
    var url = `//apis.map.qq.com/jsapi?qt=syn&wd=${wd}&pn=${pageIndex}&rn=${pageCapacity}&output=jsonp&b=${minLon},${minLat},${maxLon},${maxLat}&l=${level}&c=000000`;
    Utils.jsonp(url, callback);
  }

  search(keyword: string) {
    this.clear();
    this.keyword = keyword;
    var globe = Kernel.globe;
    var level = globe.getLastLevel();
    var extents = globe.getExtents(level);
    extents.forEach((extent: Extent) => {
      PoiLayer.search(keyword, level, extent.getMinLon(), extent.getMinLat(), extent.getMaxLon(), extent.getMaxLat(), (response) => {
        console.log(`${keyword} response:`, response);
        var data = response.detail.pois || [];
        data.forEach((item: any) => {
          var lon = parseFloat(item.pointx);
          var lat = parseFloat(item.pointy);
          this._addPoi(lon, lat, item.uid, item.name, item.addr, item.phone);
        })
      });
    });
  }
}

export = PoiLayer;