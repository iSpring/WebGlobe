import Globe = require('./world/Globe');
import TiledLayer = require('./world/layers/TiledLayer');
import OsmTiledLayer from './world/layers/OsmTiledLayer';
import BingTiledLayer = require('./world/layers/BingTiledLayer');
import SosoTiledLayer = require('./world/layers/SosoTiledLayer');

var canvas = <HTMLCanvasElement>document.getElementById("canvasId");
var globe = new Globe(canvas);
(<any>window).globe = globe;

var mapSelector = <HTMLSelectElement>document.getElementById("mapSelector");
var mapSelectorChange = function () {
    mapSelector.blur();
    var newTiledLayer: TiledLayer = null;
    var value = mapSelector.value;
    switch (value) {
        case "bing":
            newTiledLayer = new BingTiledLayer();
            break;
        case "osm":
            newTiledLayer = new OsmTiledLayer("Humanitarian")
            break;
        case "soso":
            newTiledLayer = new SosoTiledLayer();
            break;
        default:
            break;
    }

    if (newTiledLayer) {
        globe.setTiledLayer(newTiledLayer);
    }
};
mapSelector.onchange = mapSelectorChange;
mapSelectorChange();
