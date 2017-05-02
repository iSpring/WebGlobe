import Kernel from '../Kernel';
import Camera from '../Camera';
import Globe from '../Globe';
import Utils from '../Utils';
import TileGrid from '../TileGrid';
import Tile from '../graphics/Tile';
import GraphicGroup from '../GraphicGroup';
import SubTiledLayer from './SubTiledLayer';

abstract class TiledLayer extends GraphicGroup<SubTiledLayer> {
  private readonly imageRequestOptimizeDeltaLevel = 2;
  public globe: Globe = null;

  constructor(protected style: string = "") {
    super();

    //添加第0级的子图层
    const subLayer0 = new SubTiledLayer(0);
    this.add(subLayer0);

    //添加第1级的子图层要
    const subLayer1 = new SubTiledLayer(1);
    this.add(subLayer1);
  }

  destroy(){
    this.globe = null;
    super.destroy();
  }

  private _checkSubLayer1(){
    const subLayer1 = this.children[1];
    if(subLayer1 && subLayer1.getLevel() === 1){
      if(subLayer1.children.length !== 4){
        //对level为1的图层进行特殊处理，创建其中的全部的四个tile
        subLayer1.children = [];
        for (let m = 0; m <= 1; m++) {
          for (let n = 0; n <= 1; n++) {
            let args = {
              level: 1,
              row: m,
              column: n,
              url: ""
            };
            args.url = this.getTileUrl(args.level, args.row, args.column);
            let tile = Tile.getInstance(args.level, args.row, args.column, args.url);
            subLayer1.add(tile);
          }
        }
      }
    }
  }

  refresh() {
    if(!this.globe){
      return;
    }
    this._checkSubLayer1();
    var camera = this.globe.camera;
    var level = this.globe.getLevel();
    var options = {
      threshold: 1
    };
    // var pitch = camera.getPitch();
    options.threshold = 1;// options.threshold = Math.min(90 / (90 - pitch), 1.5);
    //最大级别的level所对应的可见TileGrids
    var lastLevelTileGrids = camera.getVisibleTilesByLevel(level, options);

    // this.updateSubLayerCount();

    var levelsTileGrids: TileGrid[][] = [];
    var parentTileGrids = lastLevelTileGrids;
    var subLevel: number;

    for (subLevel = level; subLevel >= 2; subLevel--) {
      levelsTileGrids[subLevel] = parentTileGrids;//此行代码表示第subLevel层级的可见切片
      parentTileGrids = parentTileGrids.map(function (item: TileGrid) {
        return item.getParent();
      });
      parentTileGrids = Utils.filterRepeatArray(parentTileGrids);
    }

    for (subLevel = 2; subLevel <= level; subLevel++) {
      var addNew = level === subLevel || (level - subLevel) > this.imageRequestOptimizeDeltaLevel;
      this.children[subLevel].updateTiles(subLevel, levelsTileGrids[subLevel], addNew);
    }

    // this.updateTileVisibility();
  }

  //根据传入的level更新SubTiledLayer的数量
  updateSubLayerCount() {
    if(!this.globe){
      return;
    }
    var level: number = this.globe.getLevel();
    var subLayerCount = this.children.length;
    var deltaLevel = level + 1 - subLayerCount;
    var i: number, subLayer: SubTiledLayer;
    if (deltaLevel > 0) {
      //需要增加子图层
      for (i = 0; i < deltaLevel; i++) {
        subLayer = new SubTiledLayer(i + subLayerCount);
        this.add(subLayer);
      }
    } else if (deltaLevel < 0) {
      //需要删除多余的子图层
      deltaLevel *= -1;
      for (i = 0; i < deltaLevel; i++) {
        var removeLevel = this.children.length - 1;
        //第0级和第1级不删除
        if (removeLevel >= 2) {
          subLayer = this.children[removeLevel];
          this.remove(subLayer);
        } else {
          break;
        }
      }
    }
  }

  private _getReadyTile(tileGrid: TileGrid): Tile{
    var level = tileGrid.level;
    var row = tileGrid.row;
    var column = tileGrid.column;
    var tile = this.children[level].findTile(level, row, column);
    if(level === 1){
      return tile;
    }else{
      if(tile && tile.isReady()){
        return tile;
      }else{
        return this._getReadyTile(tileGrid.getParent());
      }
    }
  }

  updateTileVisibility() {
    if(!this.globe){
      return;
    }
    var level = this.globe.getLevel();

    this.children.forEach((subTiledLayer) => {
      subTiledLayer.showAllTiles();
    });

    var ancesorLevel = level - this.imageRequestOptimizeDeltaLevel - 1;
    if(ancesorLevel >= 1){
      var camera = this.globe.camera;
      var tileGrids = camera.getTileGridsOfBoundary(ancesorLevel, false);
      if(tileGrids.length === 8){
        tileGrids = Utils.filterRepeatArray(tileGrids);
        for(var i: number = 0; i <= ancesorLevel; i++){
          this.children[i].hideAllTiles();
        }
        tileGrids.forEach((tileGrid: TileGrid) => {
          var tile = this._getReadyTile(tileGrid);
          if(tile){
            tile.setVisible(true);
            tile.parent.visible = true;
          }
        });
      }
    }
  }

  onDraw(camera: Camera) {
    var gl = this.globe && this.globe.gl;
    if(!gl){
      return;
    }
    var program = Tile.findProgram();
    if (!program) {
      return;
    }
    program.use();
    

    //设置uniform变量的值
    //uPMVMatrix
    var pmvMatrix = camera.getProjViewMatrixForDraw();
    var locPMVMatrix = program.getUniformLocation('uPMVMatrix');
    gl.uniformMatrix4fv(locPMVMatrix, false, pmvMatrix.getFloat32Array());

    //uSampler
    gl.activeTexture(Kernel.gl.TEXTURE0);
    var locSampler = program.getUniformLocation('uSampler');
    gl.uniform1i(locSampler, 0);

    //此处将深度测试设置为ALWAYS是为了解决两个不同层级的切片在拖动时一起渲染会导致屏闪的问题
    gl.depthFunc(Kernel.gl.ALWAYS);
    super.onDraw(camera);
    //将深度测试恢复成LEQUAL
    gl.depthFunc(Kernel.gl.LEQUAL);
  }

  getExtent() {
    if(this.globe.isRenderingPaused()){
      return null;
    }
    var subTiledLayer = this.children[this.children.length - 1];
    return subTiledLayer.getExtent();
  }

  protected wrapUrlWithProxy(url: string): string {
    return Utils.wrapUrlWithProxy(url);
  }

  getLastLevelVisibleTileGrids(){
    var tileGrids: TileGrid[] = null;
    var subTiledLayer = this.children[this.children.length - 1];
    if(subTiledLayer){
      tileGrids = subTiledLayer.getVisibleTileGrids();
    }
    return tileGrids;
  }

  abstract getTileUrl(level: number, row: number, column: number): string

  logVisibleTiles() {
    var result: any[] = [];
    this.children.forEach((subLayer) => {
      var allCount = subLayer.children.length;
      var visibleCount = subLayer.getShouldDrawTilesCount();
      result.push({
        level: subLayer.getLevel(),
        allCount: allCount,
        visibleCount: visibleCount
      });
    });
    console.table(result);
  }
};

export default TiledLayer;