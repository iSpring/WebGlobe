import Kernel = require("./src/world/Kernel");
import Globe = require("./src/world/Globe");

import "./index.css";

(function () {
    var canvas = <HTMLCanvasElement>document.getElementById("canvasId");
    var globe = new Globe(canvas);
    (<any>window).globe = globe;
    (<any>window).kernel = Kernel;
})();