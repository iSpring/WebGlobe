///<amd-module name="world/TileGrid"/>
import Kernel = require('./Kernel');
import Utils = require('./Utils');
import MathUtils = require('./Math');

class TileGrid {
    static LEFT_TOP = "LEFT_TOP";
    static RIGHT_TOP = "RIGHT_TOP";
    static LEFT_BOTTOM = "LEFT_BOTTOM";
    static RIGHT_BOTTOM = "RIGHT_BOTTOM";
    static LEFT = "LEFT";
    static RIGHT = "RIGHT";
    static TOP = "TOP";
    static BOTTOM = "BOTTOM";

    constructor(public level: number, public row: number, public column: number) { }

    equals(other: TileGrid): boolean {
        return other && this.level === other.level && this.row === other.row && this.column === other.column;
    }

    getLeft(): TileGrid {
        return TileGrid.getTileGridByBrother(this.level, this.row, this.column, MathUtils.LEFT);
    }

    getRight(): TileGrid {
        return TileGrid.getTileGridByBrother(this.level, this.row, this.column, MathUtils.RIGHT);
    }

    getTop(): TileGrid {
        return TileGrid.getTileGridByBrother(this.level, this.row, this.column, MathUtils.TOP);
    }

    getBottom(): TileGrid {
        return TileGrid.getTileGridByBrother(this.level, this.row, this.column, MathUtils.BOTTOM);
    }

    getParent(): TileGrid {
        return TileGrid.getTileGridAncestor(this.level - 1, this.level, this.row, this.column);
    }

    getAncestor(ancestorLevel: number): TileGrid {
        return TileGrid.getTileGridAncestor(ancestorLevel, this.level, this.row, this.column);
    }

    /**
     * 根据tile在父tile中的位置获取该tile的行列号等信息
     * @param parentLevel 父tile的层级
     * @param parentRow 父tile的行号
     * @param parentColumn 父tile的列号
     * @param position tile在父tile中的位置
     * @return {Object}
     */
    static getTileGridByParent(parentLevel: number, parentRow: number, parentColumn: number, position: string): TileGrid {
        var level = parentLevel + 1;
        var row = -1;
        var column = -1;
        if (position == TileGrid.LEFT_TOP) {
            row = 2 * parentRow;
            column = 2 * parentColumn;
        }
        else if (position == TileGrid.RIGHT_TOP) {
            row = 2 * parentRow;
            column = 2 * parentColumn + 1;
        }
        else if (position == TileGrid.LEFT_BOTTOM) {
            row = 2 * parentRow + 1;
            column = 2 * parentColumn;
        }
        else if (position == TileGrid.RIGHT_BOTTOM) {
            row = 2 * parentRow + 1;
            column = 2 * parentColumn + 1;
        }
        else {
            throw "invalid position";
        }
        return new TileGrid(level, row, column);
    }

    //返回切片在直接付切片中的位置
    static getTilePositionOfParent(level: number, row: number, column: number, parent?: TileGrid): any {
        var position = "UNKNOWN";
        parent = parent || this.getTileGridAncestor(level - 1, level, row, column);
        var ltTileGrid = this.getTileGridByParent(parent.level, parent.row, parent.column, this.LEFT_TOP);
        if (ltTileGrid.row == row) {
            //上面那一行
            if (ltTileGrid.column == column) {
                //处于左上角
                position = this.LEFT_TOP;
            }
            else if (ltTileGrid.column + 1 == column) {
                //处于右上角
                position = this.RIGHT_TOP;
            }
        }
        else if (ltTileGrid.row + 1 == row) {
            //下面那一行
            if (ltTileGrid.column == column) {
                //处于左下角
                position = this.LEFT_BOTTOM;
            }
            else if (ltTileGrid.column + 1 == column) {
                //处于右下角
                position = this.RIGHT_BOTTOM;
            }
        }
        return position;
    }

    //获取在某一level周边position的切片
    static getTileGridByBrother(brotherLevel: number, brotherRow: number, brotherColumn: number, position: string, options?: any): TileGrid {
        options = options || {};
        var result = new TileGrid(brotherLevel, brotherRow, brotherColumn);

        //TODO maxSize可优化 该level下row/column的最大数量
        if (position === TileGrid.LEFT) {
            if (brotherColumn == 0) {
                var maxSize = options.maxSize || Math.pow(2, brotherLevel);
                result.column = maxSize - 1;
            }
            else {
                result.column = brotherColumn - 1;
            }
        }
        else if (position == TileGrid.RIGHT) {
            var maxSize = options.maxSize || Math.pow(2, brotherLevel);
            if (brotherColumn == maxSize - 1) {
                result.column = 0;
            }
            else {
                result.column = brotherColumn + 1;
            }
        }
        else if (position == TileGrid.TOP) {
            if (brotherRow == 0) {
                var maxSize = options.maxSize || Math.pow(2, brotherLevel);
                result.row = maxSize - 1;
            }
            else {
                result.row = brotherRow - 1;
            }
        }
        else if (position == TileGrid.BOTTOM) {
            var maxSize = options.maxSize || Math.pow(2, brotherLevel);
            if (brotherRow == maxSize - 1) {
                result.row = 0;
            }
            else {
                result.row = brotherRow + 1;
            }
        }
        else {
            throw "invalid position";
        }
        return result;
    }

    /**
     * 获取切片的祖先切片，
     * @param ancestorLevel 祖先切片的level
     * @param level 当前切片level
     * @param row 当前切片row
     * @param column 当前切片column
     * @returns {null}
     */
    static getTileGridAncestor(ancestorLevel: number, level: number, row: number, column: number): TileGrid {
        var result: TileGrid = null;
        if (ancestorLevel < level) {
            var deltaLevel = level - ancestorLevel;
            //ancestor能够包含a*a个当前切片
            var a = Math.pow(2, deltaLevel);
            var ancestorRow = Math.floor(row / a);
            var ancestorColumn = Math.floor(column / a);
            result = new TileGrid(ancestorLevel, ancestorRow, ancestorColumn);
        }
        else if (ancestorLevel == level) {
            result = new TileGrid(level, row, column);
        }
        return result;
    }

    static getTileGridByGeo(lon: number, lat: number, level: number): TileGrid {
        if (!(lon >= -180 && lon <= 180)) {
            throw "invalid lon";
        }
        if (!(lat >= -90 && lat <= 90)) {
            throw "invalid lat";
        }
        var coordWebMercator = MathUtils.degreeGeographicToWebMercator(lon, lat);
        var x = coordWebMercator[0];
        var y = coordWebMercator[1];
        var horX = x + Kernel.MAX_PROJECTED_COORD;
        var verY = Kernel.MAX_PROJECTED_COORD - y;
        var size = Kernel.MAX_PROJECTED_COORD / Math.pow(2, level - 1);
        var row = Math.floor(verY / size);
        var column = Math.floor(horX / size);
        return new TileGrid(level, row, column);
    }
}

export = TileGrid;