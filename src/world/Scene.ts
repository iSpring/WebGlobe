///<amd-module name="world/Scene"/>
import Object3DComponents = require('./Object3DComponents');
import TiledLayer = require("./layers/TiledLayer");

class Scene extends Object3DComponents{
    tiledLayer: TiledLayer;
}

export = Scene;