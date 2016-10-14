import Object3DComponents = require('./Object3DComponents');
import TiledLayer = require("./TiledLayer");

class Scene extends Object3DComponents{
    tiledLayer: TiledLayer;
}

export = Scene;