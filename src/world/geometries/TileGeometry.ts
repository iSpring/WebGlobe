///<amd-module name="world/geometries/Box"/>

import Vertice = require("./Vertice");
import Triangle = require("./Triangle");
import Geometry = require("./Geometry");

class TileGeometry extends Geometry {
  constructor(public vertices: Vertice[], public triangles: Triangle[]) {
    super();
  }
}

export = TileGeometry;