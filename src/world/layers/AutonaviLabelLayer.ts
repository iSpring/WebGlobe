///<amd-module name="world/layers/AutonaviLabelLayer" />

import Camera from '../Camera';
import TileGrid from '../TileGrid';
import Kernel = require('../Kernel');
import Tile = require("../graphics/Tile");
import LabelLayer from './LabelLayer';

//http://gaode.com/

class AutonaviLabelLayer extends LabelLayer {
    private idx: number = 1;
    
    getTileUrl(level: number, row: number, column: number): string {
        //不透明+有文字：http://webrd04.is.autonavi.com/appmaptile?x=51&y=24&z=6&lang=zh_cn&size=1&scl=1&style=8&type=11
        //透明+有文字：  http://wprd04.is.autonavi.com/appmaptile?x=51&y=24&z=6&lang=zh_cn&size=1&scl=1&style=8&type=11
        //透明+无文字：http://wprd04.is.autonavi.com/appmaptile?x=51&y=24&z=6&lang=zh_cn&size=1&scl=1&style=8&ltype=11

        if (this.idx === undefined) {
            this.idx = 1;
        }

        //Chrome doesn't trust the SSL certificate of autonavi.com.
        var url = `http://wprd0${this.idx}.is.autonavi.com/appmaptile?x=${column}&y=${row}&z=${level}&lang=zh_cn&size=1&scl=1&style=8&type=11`;

        this.idx++;

        if (this.idx >= 5) {
            this.idx = 1;
        }

        return url;
    }
}

export default AutonaviLabelLayer;