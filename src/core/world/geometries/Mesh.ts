import Kernel from '../Kernel';
import MeshVertice from './MeshVertice';
import Triangle from './Triangle';
import Object3D from '../Object3D';
import VertexBufferObject from '../VertexBufferObject';
import Vertice from '../math/Vertice';
import Ray from '../math/Ray';
import Line from '../math/Line';
import MathUtils from '../math/Utils';

interface Box{
	center: Vertice;//中心点，模型坐标系中的中心点
	radius: number;//半径，模型坐标系中的半径
}

export default class Mesh extends Object3D {
	vertices: MeshVertice[] = null;
	triangles: Triangle[] = null;
	vbo: VertexBufferObject = null;
	ibo: VertexBufferObject = null;
	nbo: VertexBufferObject = null;
	uvbo: VertexBufferObject = null;
	cbo: VertexBufferObject = null;
	box: Box = null;//local box

	static buildPlane(vLeftTop: MeshVertice, vLeftBottom: MeshVertice, vRightTop: MeshVertice, vRightBottom: MeshVertice) {
		/*对于一个面从外面向里面看的绘制顺序
		 * 0      2
		 *
		 * 1      3*/
		//0,1,2; 2,1,3

		//triangles

		var tri0 = new Triangle(vLeftTop, vLeftBottom, vRightTop);

		var tri1 = new Triangle(vRightTop, vLeftBottom, vRightBottom);

		return [tri0, tri1];
	}

	static buildMesh(vLeftTop: MeshVertice, vLeftBottom: MeshVertice, vRightTop: MeshVertice, vRightBottom: MeshVertice){
		const mesh = new Mesh();
		mesh.vertices = [vLeftTop, vLeftBottom, vRightTop, vRightBottom];
		mesh.triangles = this.buildPlane(vLeftTop, vLeftBottom, vRightTop, vRightBottom);
		return mesh;
	}

	constructor(){
		super();
		this.vertices = [];
		this.triangles = [];
	}

	updateBox(force: boolean = false){
		const triCount = this.triangles.length;
		const verCount = this.vertices.length;
		if(triCount === 0 || verCount <= 3){
			this.box = null;
			return;
		}
		if(!this.box || force){
			let maxX = -Infinity;
			let maxY = -Infinity;
			let maxZ = -Infinity;
			let minX = Infinity;
			let minY = Infinity;
			let minZ = Infinity;
			for(let i = 0; i < verCount; i++){
				const vertice = this.vertices[i];
				const [x, y, z] = vertice.p;
				if(x > maxX){
					maxX = x;
				}
				if(y > maxY){
					maxY = y;
				}
				if(z > maxZ){
					maxZ = z;
				}
				if(x < minX){
					minX = x;
				}
				if(y < minY){
					minY = y;
				}
				if(z < minZ){
					minZ = z;
				}
			}
			const deltaX = maxX - minX;
			const deltaY = maxY - minY;
			const deltaZ = maxZ - minZ;
			const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
			const center = new Vertice(
				(maxX + minX) / 2,
				(maxY + minY) / 2,
				(maxZ + minZ) / 2
			);
			this.box = {
				center: center,
				radius: radius
			};
		}
	}

	/**
	 * 判断mesh是否与直线相交，其中直线为世界坐标系中的坐标
	 * @param worldLine 
	 */
	ifIntersectWorldLine(worldLine: Line){
		const localLine = MathUtils.convertWorldLineToLocalLine(worldLine, this.matrix);
		return this.ifIntersectLocalLine(localLine);
	}

	/**
	 * 判断mesh是否与直线相交，其中直线为模型坐标系中的坐标
	 * @param localLine 
	 */
	ifIntersectLocalLine(localLine: Line){
		this.updateBox(false);
		if(!this.box){
			return false;
		}

		//首先判断射线是否与box相交，如果与box不想交，则肯定不想交
		const distance = MathUtils.getLengthFromVerticeToLine(this.box.center, localLine);
		if(distance > this.box.radius){
			return false;
		}

		//在射线与box相交的前提下再判断射线是否与Mesh具体相交
		const count = this.triangles.length;
		for(let i = 0; i < count; i++){
			const tri = this.triangles[i];
			const v1 = new Vertice(tri.v1.p[0], tri.v1.p[1], tri.v1.p[2]);
			const v2 = new Vertice(tri.v2.p[0], tri.v2.p[1], tri.v2.p[2]);
			const v3 = new Vertice(tri.v3.p[0], tri.v3.p[1], tri.v3.p[2]);
			const isIntersected = MathUtils.intersectTriangle(localLine.vertice, localLine.vector, v1, v2, v3);
			if(isIntersected){
				return true;
			}
		}
		return false;
	}

	//set vertices and triangles
	buildTriangles(){
		this.vertices = [];
		this.triangles = [];
	}

	calculateVBO(force:boolean = false) {
		if (!this.vbo || force) {
			var vboData:number[] = [], vertex:MeshVertice;

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
			// this.vbo.unbind();
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
			// this.ibo.unbind();
		}
		return this.ibo;
	}

	calculateNBO(force:boolean = false) {
		if (!this.nbo || force) {
			var nboData:number[] = [], vertex:MeshVertice;

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
			// this.nbo.unbind();
		}
		return this.nbo;
	}

	calculateUVBO(force:boolean = false) {
		if (!this.uvbo || force) {
			var uvboData:number[] = [], vertex:MeshVertice;

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
			// this.uvbo.unbind();
		}
		return this.uvbo;
	}

	calculateCBO(force:boolean = false) {
		if (!this.cbo || force) {
			var cboData:number[] = [], vertex:MeshVertice;

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
			// this.cbo.unbind();
		}
		return this.cbo;
	}

	destroy() {
		if (this.vbo) {
			this.vbo.destroy();
		}
		if (this.ibo) {
			this.ibo.destroy();
		}
		if (this.nbo) {
			this.nbo.destroy();
		}
		if (this.cbo) {
			this.cbo.destroy();
		}
		if (this.uvbo) {
			this.uvbo.destroy();
		}

		this.vbo = null;
		this.ibo = null;
		this.nbo = null;
		this.cbo = null;
		this.uvbo = null;
		this.vertices = [];
		this.triangles = [];
	}
};