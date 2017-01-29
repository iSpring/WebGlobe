import Vertice = require("./MeshVertice");
import Triangle = require("./Triangle");
import Mesh = require("./Mesh");

class TileGeometry extends Mesh {
  constructor(public vertices: Vertice[], public triangles: Triangle[]) {
    super();
  }
}

export = TileGeometry;