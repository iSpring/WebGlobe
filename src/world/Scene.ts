///<amd-module name="world/Scene" />

import {Drawable} from './Definitions.d';
import GraphicGroup = require('./GraphicGroup');
import TiledLayer = require("./layers/TiledLayer");

class Scene extends GraphicGroup<Drawable>{
    tiledLayer: TiledLayer;
}

export = Scene;