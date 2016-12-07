///<amd-module name="world/Scene"/>
import GraphicGroup = require('./GraphicGroup');
import TiledLayer = require("./layers/TiledLayer");

class Scene extends GraphicGroup{
    tiledLayer: TiledLayer;
}

export = Scene;