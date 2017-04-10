import Vertice from './MeshVertice';
import Triangle from './Triangle';
import Mesh from './Mesh';

export default class TileGeometry extends Mesh {
  constructor(public vertices: Vertice[], public triangles: Triangle[]) {
    super();
  }
};