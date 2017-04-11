import Kernel from './world/Kernel';
import Globe, {GlobeOptions} from './world/Globe';
import './index.scss';
// import es6Promise = require('es6-promise');
// es6Promise.polyfill();

(function () {
    var canvas = <HTMLCanvasElement>document.getElementById("canvasId");
    var options = new GlobeOptions();
    options.satellite = true;
    var globe = new Globe(canvas, options);
    (<any>window).globe = globe;
    (<any>window).kernel = Kernel;
})();