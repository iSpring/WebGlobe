import {Drawable} from './Definitions.d';
import GraphicGroup from './GraphicGroup';
import TiledLayer from './layers/TiledLayer';

export default class Scene extends GraphicGroup<Drawable>{
    tiledLayer: TiledLayer;
};