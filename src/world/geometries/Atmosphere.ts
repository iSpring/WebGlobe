///<amd-module name="world/geometries/Atmosphere"/>

import Vertice = require("./MeshVertice");
import Triangle = require("./Triangle");
import Mesh = require("./Mesh");

class Atmosphere  extends Mesh {
  constructor(public vertices: Vertice[], public triangles: Triangle[]) {
    super();
  }
}

export = Atmosphere;