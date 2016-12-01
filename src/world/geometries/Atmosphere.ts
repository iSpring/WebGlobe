///<amd-module name="world/geometries/Atmosphere"/>

import Kernel = require("../Kernel");
import MeshVertice = require("./MeshVertice");
import Triangle = require("./Triangle");
import Mesh = require("./Mesh");
import Vertice = require("../math/Vertice");
import Matrix = require("../math/Matrix");

class Atmosphere  extends Mesh {
  private readonly segment: number = 36;
  private readonly radius1: number = Kernel.EARTH_RADIUS;
  private readonly radius2: number = Kernel.EARTH_RADIUS * 1.1;

  constructor() {
    super();
  }

  buildTriangles(){
    this.vertices = [];
    this.triangles = [];

    var mat1 = new Matrix();
    mat1.setColumnTrans(0, this.radius1, 0);
    var meshVertices1: MeshVertice[] = [];

    var mat2 = new Matrix();
    mat2.setColumnTrans(0, this.radius2, 0);
    var meshVertices2: MeshVertice[] = [];

    var deltaRadian = Math.PI * 2 / this.segment;

    for(var i = 0; i < this.segment; i++){
      meshVertices1.push(new MeshVertice({
        i: i,
        p: mat1.getPosition().getArray()
      }));

      meshVertices2.push(new MeshVertice({
        i: this.segment + i,
        p: mat2.getPosition().getArray()
      }));

      //don't flip Y
      if(i % 2 === 0){
        //meshVertices1[i] left bottom
        meshVertices1[i].uv = [0, 1];
        //meshVertices2[i] left top
        meshVertices2[i].uv = [0, 0];
      }else{
        //meshVertices1[i] right bottom
        meshVertices1[i].uv = [1, 1];
        //meshVertices2[i] right top
        meshVertices2[i].uv = [1, 0];

        var vLeftTop = meshVertices2[i-1];
        var vLeftBottom = meshVertices1[i-1];
        var vRightTop = meshVertices2[i];
        var vRightBottom = meshVertices1[i];
        this.triangles.push(...Triangle.assembleQuad(vLeftTop, vLeftBottom, vRightTop, vRightBottom));
      }

      mat1.worldRotateZ(deltaRadian);
      mat2.worldRotateZ(deltaRadian);
    }
  }
}

export = Atmosphere;