///<amd-module name="world/layers/TrafficLayer" />

import Camera from '../Camera';
import TileGrid from '../TileGrid';
import Kernel = require('../Kernel');
import Tile = require("../graphics/Tile");
import SubTiledLayer = require('./SubTiledLayer');

//http://gaode.com/

class TrafficLayer extends SubTiledLayer {

    protected minLevel: number = 4;

    private idx: number = 1;

    constructor() {
        super(-1);
    }

    onDraw(camera: Camera) {
        var program = Tile.findProgram();
        if (!program) {
            return;
        }
        program.use();
        var gl = Kernel.gl;

        //开启混合
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        //设置uniform变量的值
        //uPMVMatrix
        var pmvMatrix = camera.getProjViewMatrixForDraw();
        var locPMVMatrix = program.getUniformLocation('uPMVMatrix');
        gl.uniformMatrix4fv(locPMVMatrix, false, pmvMatrix.getFloat32Array());

        //uSampler
        gl.activeTexture(gl.TEXTURE0);
        var locSampler = program.getUniformLocation('uSampler');
        gl.uniform1i(locSampler, 0);

        //此处将深度测试设置为ALWAYS是为了解决两个不同层级的切片在拖动时一起渲染会导致屏闪的问题
        gl.depthFunc(gl.ALWAYS);
        super.onDraw(camera);
        //将深度测试恢复成LEQUAL
        gl.depthFunc(gl.LEQUAL);

        //禁用混合
        gl.disable(gl.BLEND);
    }

    getTileUrl(level: number, row: number, column: number): string {
        //不透明+有文字：http://webrd04.is.autonavi.com/appmaptile?x=51&y=24&z=6&lang=zh_cn&size=1&scl=1&style=8&type=11
        //透明+有文字：  http://wprd04.is.autonavi.com/appmaptile?x=51&y=24&z=6&lang=zh_cn&size=1&scl=1&style=8&type=11
        //透明+无文字：http://wprd04.is.autonavi.com/appmaptile?x=51&y=24&z=6&lang=zh_cn&size=1&scl=1&style=8&ltype=11

        if (this.idx === undefined) {
            this.idx = 1;
        }

        var url = `//wprd0${this.idx}.is.autonavi.com/appmaptile?x=${column}&y=${row}&z=${level}&lang=zh_cn&size=1&scl=1&style=8&type=11`;

        this.idx++;

        if (this.idx >= 5) {
            this.idx = 1;
        }

        return url;
    }

    updateTiles(level: number, visibleTileGrids: TileGrid[]) {
        var validTileGrids = visibleTileGrids.filter((tileGrid: TileGrid) => tileGrid.level >= this.minLevel);
        super.updateTiles(level, validTileGrids, true);
    }
}

export default TrafficLayer;