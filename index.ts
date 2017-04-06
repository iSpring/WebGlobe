import Kernel = require("./src/core/world/Kernel");
import {Globe, GlobeOptions} from "./src/core/world/Globe";

import "./index.scss";

(function () {
    var canvas = <HTMLCanvasElement>document.getElementById("canvasId");
    var options = new GlobeOptions();
    options.satellite = true;
    var globe = new Globe(canvas, options);
    (<any>window).globe = globe;
    (<any>window).kernel = Kernel;
})();