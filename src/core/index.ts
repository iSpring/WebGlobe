import Kernel from './world/Kernel';
import Globe, {GlobeOptions} from './world/Globe';
import './index.scss';

(function () {
    var options1 = new GlobeOptions();
    options1.satellite = true;
    var globe1 = Globe.getInstance(options1);
    globe1.placeAt(document.body);
    (<any>window).globe = globe1;
    (<any>window).kernel = Kernel;

    function resize(){
        globe1.resize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", resize, false);

    resize();
})();