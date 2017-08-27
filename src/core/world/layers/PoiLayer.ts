declare function require(name: string): any;
import Kernel from '../Kernel';
import Utils from '../Utils';
import MathUtils from '../math/Utils';
import Vector from '../math/Vector';
import MeshVertice from '../geometries/MeshVertice';
import Mesh from '../geometries/Mesh';
import Graphic from '../graphics/Graphic';
import MeshTextureGraphic from '../graphics/MeshTextureGraphic';
import GraphicGroup,{PickableGraphicGroup} from '../GraphicGroup';
import MeshTextureMaterial from '../materials/MeshTextureMaterial';
import Service, { Location, SearchType } from '../Service';
import Globe from '../Globe';
import Extent from '../Extent';
const poiImgUrl = require('../images/icons.png');

type HighlightListener = (graphic: MeshTextureGraphic) => void;
type UnHighlightListener = () => void;

export default class PoiLayer extends PickableGraphicGroup<MeshTextureGraphic>{
  private keyword: string = null;
  private searchExtentMode: boolean = false;
  public globe: Globe = null;
  private currentHighLightPoi: MeshTextureGraphic = null;
  private highlightListener: HighlightListener = null;
  private unHighlightListener: UnHighlightListener = null;
  
  //icons.png的尺寸是874X524
  private readonly iconsWidth = 874;
  private readonly iconsHeight = 524;

  //icons划分为6行10列
  private readonly iconsRow = 6;
  private readonly iconsColumn = 10;
  private readonly MAX_POI_COUNT = this.iconsColumn;//一次最多显示10个poi

  //每个小图标有效范围大小为50X70
  private readonly validPinIconWidth = 50;
  private readonly validPinIconHeight = 70;

  //使用icons.png中的第三行（0 based）作为normal material
  private readonly normalMaterialRow = 3;
  //使用icons.png中的第一行（0 based）作为highlight material
  private readonly highLightMaterialRow = 1;

  //需要计算
  //每个图标占据的范围（包括周围的透明）
  private readonly pinIconWidth = this.iconsWidth / this.iconsColumn;
  private readonly pinIconHeight = this.iconsHeight / this.iconsRow;
  //每个小图标（包括周围的透明）所占用的U空间和V空间
  private pinIconDeltaU = this.pinIconWidth / this.iconsWidth;
  private pinIconDeltaV = this.pinIconHeight / this.iconsHeight;
  //每个小图标的有效部分所占用的U空间和V空间
  private validPinIconDeltaU = this.validPinIconWidth / this.iconsWidth;
  private validPinIconDeltaV = this.validPinIconHeight / this.iconsHeight;
  //计算小图标有效区域左上角到整个小图标左上角的UV偏移量
  private validPinIconOffsetU = (this.pinIconDeltaU - this.validPinIconDeltaU) / 2;
  private validPinIconOffsetV = (this.pinIconDeltaV - this.validPinIconDeltaV) / 2;

  //在屏幕上绘制的时候POI的像素大小，宽高比需要和validPinIconHeight/validPinIconWidth保持一致
  private readonly poiPixelWidth = 30;
  private readonly poiPixelHeight = 42;
  
  private constructor() {
    super();
    Utils.subscribe('extent-change', () => {
      if (this.searchExtentMode && this.keyword) {
        this.search(this.keyword);
      }
    });

    Utils.subscribe('level-change', () => {
      if (this.children.length > 0) {
        const resolution = this.globe.camera.measureResolution();
        this.children.forEach((graphic: MeshTextureGraphic) => {
          const scale = resolution / (graphic.geometry as any).resolution;
          graphic.geometry.localScale(scale, scale, scale);
          (graphic.geometry as any).resolution = resolution;
        });
      }
    });
    this.setPickListener((target: MeshTextureGraphic) => {
      if(this.currentHighLightPoi !== target){
        this.unHighlightPoi();
        this.highlightPoi(target);
      }
    });
  }

  static getInstance(): PoiLayer {
    return new PoiLayer();
  }

  /**
   * 传入行列号，返回该图标的四个角点的UV值
   * @param row 0 based
   * @param column 0 based
   */
  private _getUV(row: number, column: number):number[][]{
    const smallV = this.pinIconDeltaV * row + this.validPinIconOffsetV;
    const bigV = smallV + this.validPinIconDeltaV;
    const smallU = this.pinIconDeltaU * column + this.validPinIconOffsetU;
    const bigU = smallU + this.validPinIconDeltaU;
    const v0:number[] = [smallU, smallV];//左上
    const v1:number[] = [smallU, bigV];//左下
    const v2:number[] = [bigU, smallV];//右上
    const v3:number[] = [bigU, bigV];//右下
    return [v0, v1, v2, v3];
  }

  getHighlightPoi(){
    return this.currentHighLightPoi;
  }

  highlightPoi(target: MeshTextureGraphic){
    if(this.currentHighLightPoi === target){
      return;
    }
    this.unHighlightPoi();
    this.currentHighLightPoi = target;
    this._updateMaterial(this.currentHighLightPoi, this.highLightMaterialRow);
    this.moveChildToLastPosition(this.currentHighLightPoi);
    if(this.highlightListener){
      this.highlightListener(this.currentHighLightPoi);
    }
  }

  unHighlightPoi(){
    if(this.currentHighLightPoi){
      this._updateMaterial(this.currentHighLightPoi, this.normalMaterialRow);
      this.currentHighLightPoi = null;
      if(this.unHighlightListener){
        this.unHighlightListener();
      }
    }
  }

  setHighlightListener(listener: HighlightListener){
    this.highlightListener = listener;
  }

  setUnHighlightListener(listener: UnHighlightListener){
    this.unHighlightListener = listener;
  }

  private _updateMaterial(target: MeshTextureGraphic, row: number){
    const columnIndex = (target as any).columnIndex;
    const uv = this._getUV(row, columnIndex);
    const [vLeftTop, vLeftBottom, vRightTop, vRightBottom] = target.geometry.vertices;
    vLeftTop.uv = uv[0];
    vLeftBottom.uv = uv[1];
    vRightTop.uv = uv[2];
    vRightBottom.uv = uv[3];
    target.geometry.calculateUVBO(true);
  }

  shouldDraw() {
    return this.globe && this.globe.camera.isEarthFullOverlapScreen() && super.shouldDraw();
  }

  onBeforeDraw(){
    const gl = Kernel.gl;
    gl.disable(gl.DEPTH_TEST);
    // gl.depthMask(false);
    gl.enable(Kernel.gl.BLEND);
    gl.blendFunc(Kernel.gl.SRC_ALPHA, Kernel.gl.ONE_MINUS_SRC_ALPHA);
  }

  onAfterDraw(){
    const gl = Kernel.gl;
    gl.enable(gl.DEPTH_TEST);
    // gl.depthMask(true);
    gl.disable(Kernel.gl.BLEND);
  }

  destroy() {
    this.globe = null;
    super.destroy();
  }

  clear(){
    this.currentHighLightPoi = null;
    super.clear();
  }

  clearAll() {
    this.clear();
    this.keyword = null;
  }

  private _addPoi(lon: number, lat: number, resolution: number, item: any, index: number) {
    const localMatrix = this.globe.camera.getMatrix().clone();
    const pCenterBottom = MathUtils.geographicToCartesianCoord(lon, lat, Kernel.EARTH_RADIUS + 0.001);
    localMatrix.setPosition(pCenterBottom);

    const localXAxisVector = new Vector(1, 0, 0);
    const halfWidth = resolution * this.poiPixelWidth / 2;
    localXAxisVector.setLength(halfWidth);
    const v3 = localXAxisVector.getVertice();
    const v1 = localXAxisVector.getOpposite().getVertice();

    const localUp = new Vector(0, 1, 0);
    const height = resolution * this.poiPixelHeight;
    localUp.setLength(height);
    const v0 = Vector.verticePlusVector(v1, localUp);
    const v2 = Vector.verticePlusVector(v3, localUp);

    const uv = this._getUV(this.normalMaterialRow, index);

    //左上角
    const meshV0 = new MeshVertice({
      i: 0,
      p: v0.getArray(),
      uv: uv[0]
    });
    //左下角
    const meshV1 = new MeshVertice({
      i: 1,
      p: v1.getArray(),
      uv: uv[1]
    });
    //右上角
    const meshV2 = new MeshVertice({
      i: 2,
      p: v2.getArray(),
      uv: uv[2]
    });
    //右下角
    const meshV3 = new MeshVertice({
      i: 3,
      p: v3.getArray(),
      uv: uv[3]
    });

    const mesh = Mesh.buildMesh(meshV0, meshV1, meshV2, meshV3);
    mesh.setMatrix(localMatrix);
    const material = new MeshTextureMaterial(poiImgUrl);
    const graphic = new MeshTextureGraphic(mesh, material, item);
    (graphic.geometry as any).resolution = resolution;
    (graphic as any).columnIndex = index;

    this.add(graphic);
    return graphic;
  }

  private _showPois(searchResponse: any) {
    this.clear();
    let pois: any[] = searchResponse.detail.pois || [];
    if (pois.length === 0) {
      return;
    }

    if(pois.length > this.MAX_POI_COUNT){
      pois = pois.slice(0, this.MAX_POI_COUNT);
    }

    const lonlats: number[][] = pois.map((item: any) => {
      var lon = parseFloat(item.pointx);
      var lat = parseFloat(item.pointy);
      return [lon, lat];
    });

    if (lonlats.length > 1) {
      const extent = Extent.fromLonlats(lonlats);
      this.globe.setExtent(extent);
    } else {
      const lonlat = lonlats[0];
      this.globe.centerTo(lonlat[0], lonlat[1]);
    }

    const resolution = this.globe.camera.measureResolution();

    //添加graphics
    searchResponse.detail.graphics = pois.map((item: any, index: number) => {
      var lon = parseFloat(item.pointx);
      var lat = parseFloat(item.pointy);
      return this._addPoi(lon, lat, resolution, item, index);
    });
  }

  search(keyword: string) {
    this.searchExtentMode = true;
    this.clearAll();
    this.keyword = keyword;
    var level = this.globe.getLevel();
    if (level >= 10) {
      var extent = this.globe.getExtent();
      if (extent) {
        Service.searchByExtent(keyword, level, extent).then((response: any) => {
          this._showPois(response);
        });
      }
    }
  }

  searchNearby(keyword: string, radius: number, searchType: SearchType = 'Auto', pageCapacity: number = 50, pageIndex: number = 0) {
    this.clearAll();
    this.keyword = keyword;
    this.searchExtentMode = false;
    return Service.searchNearby(keyword, radius, searchType, false, pageCapacity, pageIndex).then((response: any) => {
      this._showPois(response);
      return response;
    });
  }

  searchByCurrentCity(keyword: string, searchType: SearchType = 'Auto', pageCapacity: number = 50, pageIndex: number = 0) {
    this.clearAll();
    this.keyword = keyword;
    return Service.searchByCurrentCity(keyword, searchType, pageCapacity, pageIndex).then((response: any) => {
      if (response) {
        if (!response.location) {
          response.location = this.globe.getLonlat();
        }
      }
      this._showPois(response);
      return response;
    });
  }
};