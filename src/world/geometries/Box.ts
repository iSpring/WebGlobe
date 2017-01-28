import Vertice = require("./MeshVertice");
import Triangle = require("./Triangle");
import Mesh = require("./Mesh");

class Box extends Mesh {
	constructor(public length: number, public width: number, public height: number) {
		super();
		this.buildTriangles();
	}

	buildTriangles() {
		this.vertices = [];
		this.triangles = [];

		var halfLength = this.length / 2;
		var halfHeight = this.height / 2;
		var halfWidth = this.width / 2;

		/*
					  B1---- B3
					/ |     / |
					F1----F3  |
					| B2- |--B4
					|/    | /
					F2----F4
		*/

		//前面四个顶点
		var vF1 = [-halfLength, halfHeight, halfWidth]; //前面左上角点 F1,索引0
		var vF2 = [-halfLength, -halfHeight, halfWidth]; //前面左下角点 F2,索引1
		var vF3 = [halfLength, halfHeight, halfWidth]; //前面右上角点 F3,索引2
		var vF4 = [halfLength, -halfHeight, halfWidth]; //前面右下角点 F4,索引3

		//后面四个顶点
		var vB1 = [-halfLength, halfHeight, -halfWidth]; //后面左上角点 B1,索引4
		var vB2 = [-halfLength, -halfHeight, -halfWidth]; //后面左下角点 B2,索引5
		var vB3 = [halfLength, halfHeight, -halfWidth]; //后面右上角点 B3,索引6
		var vB4 = [halfLength, -halfHeight, -halfWidth]; //后面右下角点 B4,索引7

		/*对于一个面从外面向里面看的绘制顺序
		 * 0      2
		 *
		 * 1      3*/
		//0,1,2; 2,1,3

		var index = 0;

		//加入前面四个顶点,索引号:0,1,2,3
		var pzResult = this._buildPlane(index, vF1, vF2, vF3, vF4, [0, 0, 1]);
		this.vertices = this.vertices.concat(pzResult.vertices);
		this.triangles = this.triangles.concat(pzResult.triangles);
		index += 4;

		//加入右面四个顶点,索引号:4,5,6,7
		var pxResult = this._buildPlane(index, vF3, vF4, vB3, vB4, [1, 0, 0]);
		this.vertices = this.vertices.concat(pxResult.vertices);
		this.triangles = this.triangles.concat(pxResult.triangles);
		index += 4;

		//加入后面四个顶点,索引号:8,9,10,11
		var nzResult = this._buildPlane(index, vB3, vB4, vB1, vB2, [0, 0, -1]);
		this.vertices = this.vertices.concat(nzResult.vertices);
		this.triangles = this.triangles.concat(nzResult.triangles);
		index += 4;

		//加入左面四个顶点,索引号:12,13,14,15
		var nxResult = this._buildPlane(index, vB1, vB2, vF1, vF2, [-1, 0, 0]);
		this.vertices = this.vertices.concat(nxResult.vertices);
		this.triangles = this.triangles.concat(nxResult.triangles);
		index += 4;

		//加入上面的四个顶点,索引号:16,17,18,19
		var pyResult = this._buildPlane(index, vB1, vF1, vB3, vF3, [0, 1, 0]);
		this.vertices = this.vertices.concat(pyResult.vertices);
		this.triangles = this.triangles.concat(pyResult.triangles);
		index += 4;


		//加入下面四个顶点,索引号:20,21,22,23
		var nyResult = this._buildPlane(index, vF2, vB2, vF4, vB4, [0, -1, 0]);
		this.vertices = this.vertices.concat(nyResult.vertices);
		this.triangles = this.triangles.concat(nyResult.triangles);
	}

	_buildPlane(startIndex: number, pLT: number[], pLB: number[], pRT: number[], pRB: number[], nortal: number[]) {
		/*对于一个面从外面向里面看的绘制顺序
		 * 0      2
		 *
		 * 1      3*/
		//0,1,2; 2,1,3

		var result = {
			vertices: <Vertice[]>[],
			triangles: <Triangle[]>[]
		};

		//vertices

		var v0 = new Vertice({
			i: startIndex,
			p: pLT,
			uv: [0, 0],
			n: nortal,
			c: null
		});

		var v1 = new Vertice({
			i: startIndex + 1,
			p: pLB,
			uv: [0, 1],
			n: nortal,
			c: null
		});

		var v2 = new Vertice({
			i: startIndex + 2,
			p: pRT,
			uv: [1, 0],
			n: nortal,
			c: null
		});

		var v3 = new Vertice({
			i: startIndex + 3,
			p: pRB,
			uv: [1, 1],
			n: nortal,
			c: null
		});

		result.vertices = [v0, v1, v2, v3];

		//triangles

		var tri0 = new Triangle(v0, v1, v2);

		var tri1 = new Triangle(v2, v1, v3);

		result.triangles = [tri0, tri1];

		return result;
	}
}

export = Box;