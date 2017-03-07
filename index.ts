import Kernel = require("./src/world/Kernel");
import {Globe, GlobeOptions} from "./src/world/Globe";

// import "./index.css";

(function () {
    var canvas = <HTMLCanvasElement>document.getElementById("canvasId");
    var options = new GlobeOptions();
    options.satellite = true;
    var globe = new Globe(canvas, options);
    (<any>window).globe = globe;
    (<any>window).kernel = Kernel;
})();