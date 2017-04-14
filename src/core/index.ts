import Kernel from './world/Kernel';
import Globe, {GlobeOptions} from './world/Globe';
import './index.scss';
// import es6Promise = require('es6-promise');
// es6Promise.polyfill();

(function () {
    var canvas1 = <HTMLCanvasElement>document.getElementById("canvas1");
    var options1 = new GlobeOptions();
    options1.satellite = true;
    var globe1 = new Globe(canvas1, options1);
    (<any>window).globe = globe1;
    (<any>window).kernel = Kernel;

    function resize(){
        globe1.resize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", resize, false);

    resize();
})();