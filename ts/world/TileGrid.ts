import Utils = require('./Utils');

class TileGrid{
    constructor(public level: number, public row: number, public column: number){}

    equals(other: TileGrid): boolean{
        return other && this.level === other.level && this.row === other.row && this.column === other.column;
    }

    getLeft(): TileGrid{
        //return MathUtils.getTileGridByBrother(this.level, this.row, this.column, MathUtils.LEFT);
        return null;
    }

    getRight(): TileGrid{
        //return MathUtils.getTileGridByBrother(this.level, this.row, this.column, MathUtils.RIGHT);
        return null;
    }

    getTop(): TileGrid{
        //return MathUtils.getTileGridByBrother(this.level, this.row, this.column, MathUtils.TOP);
        return null;
    }

    getBottom(): TileGrid{
        //return MathUtils.getTileGridByBrother(this.level, this.row, this.column, MathUtils.BOTTOM);
        return null;
    }

    getParent(): TileGrid{
        //return MathUtils.getTileGridAncestor(this.level - 1, this.level, this.row, this.column);
        return null;
    }

    getAncestor(ancestorLevel: number): TileGrid{
        //return MathUtils.getTileGridAncestor(ancestorLevel, this.level, this.row, this.column);
        return null;
    }
}

export = TileGrid;