///<amd-module name="world/geometries/Geometry"/>
import Kernel = require("../Kernel");
import Vertice = require("./Vertice");
import Triangle = require("./Triangle");
import VertexBufferObject = require("../VertexBufferObject");

class Geometry {
	vertices: Vertice[];
	triangles: Triangle[];
	vbo: any;
	ibo: any;
	nbo: any;
	uvbo: any;
	cbo: any;

	constructor() {
		this.buildTriangles();
	}

	//set vertices and triangles
	buildTriangles(){
		this.vertices = [];
		this.triangles = [];
	}

	calculateVBO(force:boolean = false) {
		if (!this.vbo || force) {
			var vboData:number[] = [], vertex:Vertice;

			for (var i = 0, length = this.vertices.length; i < length; i++) {
				vertex = this.vertices[i];
				vboData.push(vertex.p[0]);
				vboData.push(vertex.p[1]);
				vboData.push(vertex.p[2]);
			}

			if (!this.vbo) {
				this.vbo = new VertexBufferObject(Kernel.gl.ARRAY_BUFFER);
			}
			this.vbo.bind();
			this.vbo.bufferData(vboData, Kernel.gl.STATIC_DRAW, true);
			this.vbo.unbind();
		}
		return this.vbo;
	}

	calculateIBO(force:boolean = false) {
		if (!this.ibo || force) {
			var iboData:number[] = [], triangle:Triangle;

			for (var i = 0, length = this.triangles.length; i < length; i++) {
				triangle = this.triangles[i];
				iboData.push(triangle.v1.i);
				iboData.push(triangle.v2.i);
				iboData.push(triangle.v3.i);
			}

			if (!this.ibo) {
				this.ibo = new VertexBufferObject(Kernel.gl.ELEMENT_ARRAY_BUFFER);
			}
			this.ibo.bind();
			this.ibo.bufferData(iboData, Kernel.gl.STATIC_DRAW, true);
			this.ibo.unbind();
		}
		return this.ibo;
	}

	calculateNBO(force:boolean = false) {
		if (!this.nbo || force) {
			var nboData:number[] = [], vertex:Vertice;

			for (var i = 0, length = this.vertices.length; i < length; i++) {
				vertex = this.vertices[i];
				nboData.push(vertex.n[0]);
				nboData.push(vertex.n[1]);
				nboData.push(vertex.n[2]);
			}

			if (!this.nbo) {
				this.nbo = new VertexBufferObject(Kernel.gl.ARRAY_BUFFER);
			}
			this.nbo.bind();
			this.nbo.bufferData(nboData, Kernel.gl.STATIC_DRAW, true);
			this.nbo.unbind();
		}
		return this.nbo;
	}

	calculateUVBO(force:boolean = false) {
		if (!this.uvbo || force) {
			var uvboData:number[] = [], vertex:Vertice;

			for (var i = 0, length = this.vertices.length; i < length; i++) {
				vertex = this.vertices[i];
				uvboData.push(vertex.uv[0]);
				uvboData.push(vertex.uv[1]);
			}

			if (!this.uvbo) {
				this.uvbo = new VertexBufferObject(Kernel.gl.ARRAY_BUFFER);
			}
			this.uvbo.bind();
			this.uvbo.bufferData(uvboData, Kernel.gl.STATIC_DRAW, true);
			this.uvbo.unbind();
		}
		return this.uvbo;
	}

	calculateCBO(force:boolean = false) {
		if (!this.cbo || force) {
			var cboData:number[] = [], vertex:Vertice;

			for (var i = 0, length = this.vertices.length; i < length; i++) {
				vertex = this.vertices[i];
				cboData.push(vertex.c[0]);
				cboData.push(vertex.c[1]);
				cboData.push(vertex.c[2]);
			}

			if (!this.cbo) {
				this.cbo = new VertexBufferObject(Kernel.gl.ARRAY_BUFFER);
			}
			this.cbo.bind();
			this.cbo.bufferData(cboData, Kernel.gl.STATIC_DRAW, true);
			this.cbo.unbind();
		}
		return this.cbo;
	}

	destroy() {
		if (this.vbo) {
			Kernel.gl.deleteBuffer(this.vbo);
		}
		if (this.ibo) {
			Kernel.gl.deleteBuffer(this.ibo);
		}
		if (this.nbo) {
			Kernel.gl.deleteBuffer(this.nbo);
		}
		if (this.cbo) {
			Kernel.gl.deleteBuffer(this.cbo);
		}
		if (this.uvbo) {
			Kernel.gl.deleteBuffer(this.uvbo);
		}

		this.vbo = null;
		this.ibo = null;
		this.nbo = null;
		this.cbo = null;
		this.uvbo = null;
		this.vertices = [];
		this.triangles = [];
	}
}

//world.geometries._Geometry.prototype = new world._Object3D();

//world.geometries._Geometry.prototype.constructor = world.geometries._Geometry;

export = Geometry;