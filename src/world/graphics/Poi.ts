///<amd-module name="world/graphics/Poi"/>

import Kernel = require("../Kernel");
import Graphic = require('./Graphic');
import Marker = require('../geometries/Marker');
import PoiMaterial = require('../materials/PoiMaterial');
import Program = require("../Program");
import Camera from "../Camera";
import MathUtils = require("../math/Math");

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
const fs =
    `
precision mediump float;
uniform sampler2D uSampler;

void main()
{
	gl_FragColor = texture2D(uSampler, vec2(gl_PointCoord.x, gl_PointCoord.y));
}
`;

class Poi extends Graphic {
    private constructor(
        public geometry: Marker, 
        public material: PoiMaterial, 
        public uuid: string,        
        public name: string, 
        public address: string,
        public phone: string) {
        super(geometry, material);
    }

    createProgram() {
        return new Program(this.getProgramType(), vs, fs);
    }

    onDraw(camera: Camera) {
        var gl = Kernel.gl;

        //gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        //aPosition
        var locPosition = this.program.getAttribLocation('aPosition');
        this.program.enableVertexAttribArray('aPosition');
        this.geometry.vbo.bind();
        gl.vertexAttribPointer(locPosition, 3, gl.FLOAT, false, 0, 0);

        //uPMVMatrix
        var pmvMatrix = camera.getProjViewMatrixForDraw();
        var locPMVMatrix = this.program.getUniformLocation('uPMVMatrix');
        gl.uniformMatrix4fv(locPMVMatrix, false, pmvMatrix.elements);

        //uSize
        var locSize = this.program.getUniformLocation('uSize');
        gl.uniform1f(locSize, this.material.size);

        //set uSampler
        var locSampler = this.program.getUniformLocation('uSampler');
        gl.activeTexture(gl.TEXTURE0);
        //world.Cache.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.material.texture);
        gl.uniform1i(locSampler, 0);

        //绘图,1表示1个点
        gl.drawArrays(gl.POINTS, 0, 1);

        //释放当前绑定对象
        //gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    static getInstance(lon: number, lat: number, uuid: string, name: string, address: string, phone: string) {
        var p = MathUtils.geographicToCartesianCoord(lon, lat, Kernel.EARTH_RADIUS + 0.001);
        var marker = new Marker(p.x, p.y, p.z);
        var url = "/WebGlobe/src/world/images/poi.png";
        var material = new PoiMaterial(url, 24);
        var poi = new Poi(marker, material, uuid, name, address, phone);
        return poi;
    }
}

export = Poi;