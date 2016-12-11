///<amd-module name="world/graphics/Tile"/>
import Kernel = require('../Kernel');
import Enum = require('../Enum');
import Extent = require('../Extent');
import MathUtils = require('../math/Math');
import MeshGraphic = require('../graphics/MeshGraphic');
import TileMaterial = require('../materials/TileMaterial');
import TileGeometry = require("../geometries/TileGeometry");
import Vertice = require("../geometries/MeshVertice");
import Triangle = require("../geometries/Triangle");
import SubTiledLayer = require("../layers/SubTiledLayer");

class TileInfo {
  //type如果是GLOBE_TILE，表示其buffer已经设置为一般形式
  //type如果是TERRAIN_TILE，表示其buffer已经设置为高程形式
  //type如果是UNKNOWN，表示buffer没设置
  type: number = Enum.UNKNOWN;
  minLon: number = null;
  minLat: number = null;
  maxLon: number = null;
  maxLat: number = null;
  minX: number = null;
  minY: number = null;
  maxX: number = null;
  maxY: number = null;
  segment: number = 1;
  geometry: TileGeometry;
  material: TileMaterial;
  visible: boolean;

  constructor(public level: number, public row: number, public column: number, public url: string) {
    this._setTileInfo();
    if (this.type == Enum.UNKNOWN) {
      //初始type为UNKNOWN，还未初始化buffer，应该显示为GlobeTile
      this._handleGlobeTile();
    }
    this.material = new TileMaterial(this.level, this.url);
  }

  // 根据传入的切片的层级以及行列号信息设置切片的经纬度范围 以及设置其纹理
  _setTileInfo() {
    //经纬度范围
    var Egeo = MathUtils.getTileGeographicEnvelopByGrid(this.level, this.row, this.column);
    this.minLon = Egeo.minLon;
    this.minLat = Egeo.minLat;
    this.maxLon = Egeo.maxLon;
    this.maxLat = Egeo.maxLat;
    var minCoord = MathUtils.degreeGeographicToWebMercator(this.minLon, this.minLat);
    var maxCoord = MathUtils.degreeGeographicToWebMercator(this.maxLon, this.maxLat);

    //投影坐标范围
    this.minX = minCoord[0];
    this.minY = minCoord[1];
    this.maxX = maxCoord[0];
    this.maxY = maxCoord[1];
  }

  //处理球面的切片
  _handleGlobeTile() {
    this.type = Enum.GLOBE_TILE;
    var BASE_LEVEL = Kernel.BASE_LEVEL;
    if (this.level < BASE_LEVEL) {
      var changeLevel = BASE_LEVEL - this.level;
      this.segment = Math.pow(2, changeLevel);
    } else {
      this.segment = 1;
    }
    this._handleTile();
  }

  //如果是GlobeTile，那么elevations为null
  //如果是TerrainTile，那么elevations是一个一维数组，大小是(segment+1)*(segment+1)
  _handleTile() {
    this.visible = true;
    var verticeArray: Vertice[] = [];
    var triangleArray: Triangle[] = [];
    var vertices: number[] = [];
    var indices: number[] = [];
    var textureCoords: number[] = [];

    var deltaX = (this.maxX - this.minX) / this.segment;
    var deltaY = (this.maxY - this.minY) / this.segment;
    var deltaTextureCoord = 1.0 / this.segment;
    var changeElevation = 0;//this.type === Enum.TERRAIN_TILE && this.elevationInfo;
    //level不同设置的半径也不同
    var levelDeltaR = 0;//this.level * 2;
    //对WebMercator投影进行等间距划分格网
    var mercatorXs: number[] = []; //存储从最小的x到最大x的分割值
    var mercatorYs: number[] = []; //存储从最大的y到最小的y的分割值
    var textureSs: number[] = []; //存储从0到1的s的分割值
    var textureTs: number[] = []; //存储从1到0的t的分割值
    var i: number, j: number;

    for (i = 0; i <= this.segment; i++) {
      mercatorXs.push(this.minX + i * deltaX);
      mercatorYs.push(this.maxY - i * deltaY);
      var b = i * deltaTextureCoord;
      textureSs.push(b);
      textureTs.push(1 - b);
    }

    //从左上到右下遍历填充vertices和textureCoords
    //从最上面一行开始自左向右遍历一行，然后再以相同的方式遍历下面一行
    var index = 0;
    for (i = 0; i <= this.segment; i++) {
      for (j = 0; j <= this.segment; j++) {
        var merX = mercatorXs[j];
        var merY = mercatorYs[i];
        var ele:number = 0;//高程
        var lonlat = MathUtils.webMercatorToDegreeGeographic(merX, merY);
        var p = MathUtils.geographicToCartesianCoord(lonlat[0], lonlat[1], Kernel.EARTH_RADIUS + ele + levelDeltaR).getArray();
        vertices = vertices.concat(p); //顶点坐标
        textureCoords = textureCoords.concat(textureSs[j], textureTs[i]); //纹理坐标
        var v = new Vertice({
          p: p,
          i: index,
          uv: [textureSs[j], textureTs[i]]
        });
        verticeArray.push(v);
        index++;
      }
    }

    //从左上到右下填充indices
    //添加的点的顺序:左上->左下->右下->右上
    //0 1 2; 2 3 0;
    /*对于一个面从外面向里面看的绘制顺序
     * 0      3
     *
     * 1      2*/
    for (i = 0; i < this.segment; i++) {
      for (j = 0; j < this.segment; j++) {
        var idx0 = (this.segment + 1) * i + j;
        var idx1 = (this.segment + 1) * (i + 1) + j;
        var idx2 = idx1 + 1;
        var idx3 = idx0 + 1;
        indices = indices.concat(idx0, idx1, idx2); // 0 1 2
        indices = indices.concat(idx2, idx3, idx0); // 2 3 0
        var v0: Vertice = verticeArray[idx0];
        var v1: Vertice = verticeArray[idx1];
        var v2: Vertice = verticeArray[idx2];
        var v3: Vertice = verticeArray[idx3];
        var triangle1 = new Triangle(v0, v1, v2);
        var triangle2 = new Triangle(v2, v3, v0);
        triangleArray.push(triangle1, triangle2);
      }
    }

    this.geometry = new TileGeometry(verticeArray, triangleArray);
  }
}

class Tile extends MeshGraphic {
  subTiledLayer: SubTiledLayer;

  private constructor(public geometry: TileGeometry, public material: TileMaterial, public tileInfo: TileInfo) {
    super(geometry, material);
  }

  static getInstance(level: number, row: number, column: number, url: string) {
    var tileInfo = new TileInfo(level, row, column, url);
    return new Tile(tileInfo.geometry, tileInfo.material, tileInfo);
  }

  getExtent(){
    return new Extent(this.tileInfo.minLon, this.tileInfo.minLat, this.tileInfo.maxLon, this.tileInfo.maxLat);
  }

  isDrawable(){
    return this.tileInfo.visible　&& super.isDrawable();
  }

  destroy() {
    super.destroy();
    this.subTiledLayer = null;
  }
}

export = Tile;