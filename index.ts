import Globe = require('./src/world/Globe');
import TiledLayer = require('./src/world/layers/TiledLayer');
import GoogleTiledLayer = require('./src/world/layers/GoogleTiledLayer');
import OsmTiledLayer from './src/world/layers/OsmTiledLayer';
import BingTiledLayer = require('./src/world/layers/BingTiledLayer');
import SosoTiledLayer = require('./src/world/layers/SosoTiledLayer');

(function () {
    var canvas = <HTMLCanvasElement>document.getElementById("canvasId");
    var globe = new Globe(canvas);
    (<any>window).globe = globe;

    var stylesObj:any = {
        google: ["Satellite", "Default"],
        osm: ["Default", "Cycle", "Transport", "Humanitarian"],        
        bing: ["Default"],
        soso: ["Default"]
    };

    var mapSelector = <HTMLSelectElement>document.getElementById("mapSelector");
    var styleSelector = <HTMLSelectElement>document.getElementById("styleSelector");
    var handleStyleChange = true;

    styleSelector.onchange = () => {
        if(!handleStyleChange){
            return;
        }

        var newTiledLayer: TiledLayer = null;
        var mapType = mapSelector.value;
        var styleType = styleSelector.value;

        switch (mapType) {
            case "google":
                newTiledLayer = new GoogleTiledLayer(<any>styleType);
                break;
            case "bing":
                newTiledLayer = new BingTiledLayer(styleType);
                break;
            case "osm":
                newTiledLayer = new OsmTiledLayer(<any>styleType)
                break;
            case "soso":
                newTiledLayer = new SosoTiledLayer(styleType);
                break;
            default:
                break;
        }

        if (newTiledLayer) {
            globe.setTiledLayer(newTiledLayer);
        }
    };

    mapSelector.onchange = () => {
        handleStyleChange = false;
        while(styleSelector.children.length > 0){
            styleSelector.removeChild(styleSelector.children[0]);
        }
        var mapType = mapSelector.value;
        var styles:string[] = stylesObj[mapType];
        handleStyleChange = true;
        styles.forEach(function(style){
            var option = document.createElement("option");
            option.setAttribute("value", style);
            option.innerHTML = style;
            styleSelector.appendChild(option);
        });
        (<any>styleSelector).onchange();
    };

    (<any>mapSelector).onchange();

})();