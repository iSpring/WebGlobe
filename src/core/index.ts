import Kernel from './world/Kernel';
import Globe, {GlobeOptions} from './world/Globe';
import './index.scss';
// declare function require(name: string): any;
// const template = require('./template.html');
// console.log(template);

(function () {
    var options = new GlobeOptions();
    options.satellite = true;
    options.level = 3;
    options.lonlat = 'auto';
    var globe = Globe.getInstance(options);
    globe.placeAt(document.body);
    (<any>window).globe = globe;
    (<any>window).kernel = Kernel;

    function resize(){
        globe.resize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", resize, false);

    resize();
})();