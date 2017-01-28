import Globe = require('./src/world/Globe');

(function () {
    var canvas = <HTMLCanvasElement>document.getElementById("canvasId");
    var globe = new Globe(canvas, 3);
    (<any>window).globe = globe;
})();