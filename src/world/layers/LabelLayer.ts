///<amd-module name="world/layers/LabelLayer" />

import Camera from '../Camera';
import TileGrid from '../TileGrid';
import Kernel = require('../Kernel');
import Tile = require("../graphics/Tile");
import SubTiledLayer = require('./SubTiledLayer');

abstract class LabelLayer extends SubTiledLayer {

    protected minLevel: number = 4;

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

    abstract getTileUrl(level: number, row: number, column: number): string 

    updateTiles(level: number, visibleTileGrids: TileGrid[]) {
        var validTileGrids = visibleTileGrids.filter((tileGrid: TileGrid) => tileGrid.level >= this.minLevel);
        super.updateTiles(level, validTileGrids, true);
    }
}

export default LabelLayer;