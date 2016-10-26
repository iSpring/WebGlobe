///<amd-module name="world/Tile"/>
import Kernel = require('../Kernel');
import Enum = require('../Enum');
import Elevation = require('../Elevation');
import MathUtils = require('../math/Math');
import MeshGraphic = require('../graphics/MeshGraphic');
import MeshTextureMaterial = require('../materials/MeshTextureMaterial');
import Geometry = require("../geometries/Geometry");
import Vertice = require("../geometries/Vertice");
import Triangle = require("../geometries/Triangle");

class TileGeometry extends Geometry{
  constructor(public tileInfo: TileInfo){
    super();
  }

  buildTriangles(){

  }
}

class TileInfo{
  //type如果是GLOBE_TILE，表示其buffer已经设置为一般形式
  //type如果是TERRAIN_TILE，表示其buffer已经设置为高程形式
  //type如果是UNKNOWN，表示buffer没设置
  type: number = Enum.UNKNOWN;
  elevationLevel: number = 0;//高程level
  minLon: number = null;
  minLat: number = null;
  maxLon: number = null;
  maxLat: number = null;
  minX: number = null;
  minY: number = null;
  maxX: number = null;
  maxY: number = null;
  segment: number = 1;
  elevationInfo: any = null;
  geometry: TileGeometry;
  material: MeshTextureMaterial;

  constructor(public level: number, public row: number, public column: number, public url: string){
    this._setTileInfo();
    this._createGeometry();
    this._createMaterial();
  }

  // 根据传入的切片的层级以及行列号信息设置切片的经纬度范围 以及设置其纹理
  _setTileInfo() {
    this.elevationLevel = Elevation.getAncestorElevationLevel(this.level);
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

  _createGeometry(){
    this.geometry = null;
  }

  _createMaterial(){
    var matArgs = {
      level: this.level,
      url: this.url
    };
    this.material = new MeshTextureMaterial(matArgs);
  }
}

class Tile extends MeshGraphic {
  subTiledLayer: any;

  private constructor(public geometry: TileGeometry, public material: MeshTextureMaterial, public tileInfo: TileInfo) {
    super(geometry, material);
  }

  static getTile(level: number, row: number, column: number, url: string){
    var tileInfo = new TileInfo(level, row, column, url);
    return new Tile(tileInfo.geometry, tileInfo.material, tileInfo);
  }

  // createVerticeData(args: any) {
  //   if (!args) {
  //     return;
  //   }
  //   this.setTileInfo(args);
  //   this.checkTerrain();
  // }

  /**
     * 判断是否满足现实Terrain的条件，若满足则转换为三维地形
     * 条件:
     * 1.当前显示的是GlobeTile
     * 2.该切片的level大于TERRAIN_LEVEL
     * 3.pich不为90
     * 4.当前切片的高程数据存在
     * 5.如果bForce为true，则表示强制显示为三维，不考虑level
     */
  checkTerrain(bForce: boolean = false) {
    // var globe = Kernel.globe;
    // var a = bForce === true ? true : this.tileInfo.level >= Kernel.TERRAIN_LEVEL;
    // var shouldShowTerrain = this.tileInfo.type != Enum.TERRAIN_TILE && a && globe && globe.camera && globe.camera.pitch != 90;
    // if (shouldShowTerrain) {
    //   //应该以TerrainTile显示
    //   if (!this.tileInfo.elevationInfo) {
    //     this.tileInfo.elevationInfo = Elevation.getExactElevation(this.tileInfo.level, this.tileInfo.row, this.tileInfo.column);
    //   }
    //   var canShowTerrain = this.tileInfo.elevationInfo ? true : false;
    //   if (canShowTerrain) {
    //     //能够显示为TerrainTile
    //     this.handleTerrainTile();
    //   } else {
    //     //不能够显示为TerrainTile
    //     this.visible = false;
    //     //this.handleGlobeTile();
    //   }
    // } else {
    //   if (this.tileInfo.type == Enum.UNKNOWN) {
    //     //初始type为UNKNOWN，还未初始化buffer，应该显示为GlobeTile
    //     this.handleGlobeTile();
    //   }
    // }
  }

  //处理球面的切片
  handleGlobeTile() {
    this.tileInfo.type = Enum.GLOBE_TILE;
    if (this.tileInfo.level < Kernel.BASE_LEVEL) {
      var changeLevel = Kernel.BASE_LEVEL - this.tileInfo.level;
      this.tileInfo.segment = Math.pow(2, changeLevel);
    } else {
      this.tileInfo.segment = 1;
    }
    this.handleTile();
  }

  //处理地形的切片
  handleTerrainTile() {
    this.tileInfo.type = Enum.TERRAIN_TILE;
    this.tileInfo.segment = 10;
    this.handleTile();
  };

  //如果是GlobeTile，那么elevations为null
  //如果是TerrainTile，那么elevations是一个一维数组，大小是(segment+1)*(segment+1)
  handleTile() {
    this.visible = true;
    var vertices:number[] = [];
    var indices:number[] = [];
    var textureCoords:number[] = [];

    var deltaX = (this.tileInfo.maxX - this.tileInfo.minX) / this.tileInfo.segment;
    var deltaY = (this.tileInfo.maxY - this.tileInfo.minY) / this.tileInfo.segment;
    var deltaTextureCoord = 1.0 / this.tileInfo.segment;
    var changeElevation = this.tileInfo.type == Enum.TERRAIN_TILE && this.tileInfo.elevationInfo;
    //level不同设置的半径也不同
    var levelDeltaR = 0; //this.level * 100;
    //对WebMercator投影进行等间距划分格网
    var mercatorXs:number[] = []; //存储从最小的x到最大x的分割值
    var mercatorYs:number[] = []; //存储从最大的y到最小的y的分割值
    var textureSs:number[] = []; //存储从0到1的s的分割值
    var textureTs:number[] = []; //存储从1到0的t的分割值
    var i:number, j:number;

    for (i = 0; i <= this.tileInfo.segment; i++) {
      mercatorXs.push(this.tileInfo.minX + i * deltaX);
      mercatorYs.push(this.tileInfo.maxY - i * deltaY);
      var b = i * deltaTextureCoord;
      textureSs.push(b);
      textureTs.push(1 - b);
    }
    //从左上到右下遍历填充vertices和textureCoords:从最上面一行开始自左向右遍历一行，然后再以相同的方式遍历下面一行
    for (i = 0; i <= this.tileInfo.segment; i++) {
      for (j = 0; j <= this.tileInfo.segment; j++) {
        var merX = mercatorXs[j];
        var merY = mercatorYs[i];
        var ele = changeElevation ? this.tileInfo.elevationInfo.elevations[(this.tileInfo.segment + 1) * i + j] : 0;
        var lonlat = MathUtils.webMercatorToDegreeGeographic(merX, merY);
        var p = MathUtils.geographicToCartesianCoord(lonlat[0], lonlat[1], Kernel.EARTH_RADIUS + ele + levelDeltaR).getArray();
        vertices = vertices.concat(p); //顶点坐标
        textureCoords = textureCoords.concat(textureSs[j], textureTs[i]); //纹理坐标
      }
    }

    //从左上到右下填充indices
    //添加的点的顺序:左上->左下->右下->右上
    //0 1 2; 2 3 0;
    /*对于一个面从外面向里面看的绘制顺序
     * 0      3
     *
     * 1      2*/
    for (i = 0; i < this.tileInfo.segment; i++) {
      for (j = 0; j < this.tileInfo.segment; j++) {
        var idx0 = (this.tileInfo.segment + 1) * i + j;
        var idx1 = (this.tileInfo.segment + 1) * (i + 1) + j;
        var idx2 = idx1 + 1;
        var idx3 = idx0 + 1;
        indices = indices.concat(idx0, idx1, idx2); // 0 1 2
        indices = indices.concat(idx2, idx3, idx0); // 2 3 0
      }
    }

    var infos = {
      vertices: vertices,
      indices: indices,
      textureCoords: textureCoords
    };
    // this.setBuffers(infos);
  }

  //重写Object3D的destroy方法
  destroy() {
    super.destroy();
    this.subTiledLayer = null;
  }
}

export = Tile;