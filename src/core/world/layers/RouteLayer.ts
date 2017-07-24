declare function require(name: string): any;
import Kernel from '../Kernel';
import Utils from '../Utils';
import MathUtils from '../math/Utils';
import Vertice from '../math/Vertice';
import Vector from '../math/Vector';
import MeshVertice from '../geometries/MeshVertice';
import Triangle from '../geometries/Triangle';
import Mesh from '../geometries/Mesh';
import MeshColorGraphic from '../graphics/MeshColorGraphic';
import ColorMaterial from '../materials/ColorMaterial';
import MarkerTextureMaterial from '../materials/MarkerTextureMaterial';
import Graphic from '../graphics/Graphic';
import MultiPointsGraphic from '../graphics/MultiPointsGraphic';
// import Line from '../geometries/Line';
// import LineGraphic from '../graphics/LineGraphic';
import GraphicGroup from '../GraphicGroup';
import { Drawable } from '../Definitions.d';
import Camera from '../Camera';
import Service from '../Service';
import Extent from '../Extent';
import Program from '../Program';

const startPointImageUrl = require('../images/start.png');
const startPointImageSize = 80;

const endPointImageUrl = require('../images/end.png');
const endPointImageSize = 80;

interface RoutePoint {
    lonlat: number[];
    vertice: Vertice;
    start2EndVector: Vector;
    v1: MeshVertice;
    v3: MeshVertice;
    // B12: boolean;
    // B34: boolean;
}

type RouteType = 'driving' | 'bus' | 'walking';

// const isWindows = Utils.isWindows();

class MeshRouteGraphic extends MeshColorGraphic {
    private readonly inflexionPointAngle = 30;//认为两条道路出现近乎垂直情况时候的夹角

    constructor(private originalLonlats: number[][], private pixelWidth: number, resolution: number, material: ColorMaterial) {
        super(null, material);
        this._removeDuplicatePoints(this.originalLonlats);
        this.updateGeometry(resolution);
    }

    updateGeometry(resolution: number) {
        var lonlats = this._handleCurveJoin(this.originalLonlats, resolution, this.pixelWidth);
        const geometry = this._getRouteGeometryByLonlats(lonlats, resolution, this.pixelWidth);
        this.setGeometry(geometry);
    }

    private _removeDuplicatePoints(lonlats: number[][]){
        let cursor: number = 0;
        while(cursor <= (lonlats.length - 2)){
            let currentLonlat = lonlats[cursor];
            let nextLonlat = lonlats[cursor + 1];
            if(currentLonlat[0] === nextLonlat[0] && currentLonlat[1] === nextLonlat[1]){
                //删除重复点，不移动游标
                lonlats.splice(cursor + 1, 1);
            }else{
                //移动游标
                cursor += 1;
            }
        }
    }

    /**
     * 
     * @param _lonlats 传入经纬度坐标数组，如果两条线段之间夹角大于一定角度，就认为是拐点，针对拐点生成贝塞尔曲线点，该方法不会修原数组
     */
    private _handleCurveJoin(_lonlats: number[][], resolution: number, pixelWidth: number){
        //把所有的经纬度转换为WebMercator坐标，方便进行对拐点进行曲线拟合
        // var xyArr = lonlats.map((lonlat: number[]) => {
        //     MathUtils.degreeGeographicToWebMercator(lonlat[0], lonlat[1]);
        // });

        var lonlats = [].concat(_lonlats);

        var cursor: number = 1;

        //在用p0、p1、p2生成贝塞尔曲线点的时候，offsetLonlat是理想的p0p1(p1p2)的距离，单位是角度
        const offsetLonlat = MathUtils.radianToDegree(resolution * pixelWidth / Kernel.EARTH_RADIUS);

        //每次都要动态判断lonlats.length，因为lonlats的内容可能是在不断增加的
        while(cursor <= (lonlats.length - 2)){
            const currentLonlat = lonlats[cursor];
            const prevLonlat = lonlats[cursor - 1];
            const nextLonlat = lonlats[cursor + 1];
            const currentPoint = new Vertice(currentLonlat[0], currentLonlat[1], 0);
            const prevPoint = new Vertice(prevLonlat[0], prevLonlat[1], 0);
            const nextPoint = new Vertice(nextLonlat[0], nextLonlat[1], 0);
            //prevPoint -> currentPoint
            const vector1 = Vector.verticeMinusVertice(currentPoint, prevPoint);
            //currentPoint -> nextPoint
            const vector2 = Vector.verticeMinusVertice(nextPoint, currentPoint);
            //有可能nextPoint和currentPoint是相同的点，这样计算出的vector2长度为0，计算出的夹角为0
            const radian = Vector.getRadianOfTwoVectors(vector1, vector2);
            const angle = MathUtils.radianToDegree(radian);
            if(angle > this.inflexionPointAngle){
                //currentLonlat是拐点，需要对拐点进行处理
                let p0: number[] = null;//经纬度
                let p1: number[] = currentLonlat;//经纬度
                let p2: number[] = null;//经纬度
                //保证p0到p1的距离与p1到p2的距离相等，都只占Math.min(length1, length2)的N分之一
                let length1 = vector1.getLength();
                let length2 = vector2.getLength();
                //length1和length2都是以米为单位的
                // let length1 = MathUtils.getRealArcDistanceBetweenLonLats(currentLonlat[0], currentLonlat[1], prevLonlat[0], prevLonlat[1]);
                // let length2 = MathUtils.getRealArcDistanceBetweenLonLats(currentLonlat[0], currentLonlat[1], nextLonlat[0], nextLonlat[1]);
                let minLength = Math.min(length1, length2);
                //deltaLength单位是角度
                let deltaLength = Math.min(offsetLonlat, minLength / 2);
                //计算p0
                let p0Vertice = Vector.verticePlusVector(currentPoint, vector1.getOpposite().setLength(deltaLength));
                p0 = [p0Vertice.x, p0Vertice.y];
                //计算p2
                let p2Vertice = Vector.verticePlusVector(currentPoint, vector2.clone().setLength(deltaLength));
                p2 = [p2Vertice.x, p2Vertice.y];
                //curveLonlats包含了p0和p2
                const curveLonlats = MathUtils.quad(p0, p1, p2, 10);
                //删除拐点currentLonlat，加入数组curveLonlats
                lonlats.splice(cursor, 1, ...curveLonlats);
                //让游标指向下一个点
                cursor += curveLonlats.length;
            }else{
                //让游标指向下一个点
                cursor++;
            }
        }
        return lonlats;
    }

    private _getRouteGeometryByLonlats(lonlats: number[][], resolution: number, pixelWidth: number) {
        const mesh = new Mesh();

        const points: RoutePoint[] = lonlats.map((lonlat: number[]) => {
            return {
                lonlat: lonlat,
                vertice: MathUtils.geographicToCartesianCoord(lonlat[0], lonlat[1]),
                start2EndVector: null,
                v1: null,
                v3: null
                // B12: false,//起始拐点
                // B34: false//终止拐点，需要额外插入
            } as RoutePoint;
        });

        //检查路口拐点的情况，如果不做处理，那么就会形成箭头形状的道路，
        //比如道路AB和道路BC是垂直的，AB方向在B点生成的是B1和B2，BC在B点生成的是B3和B4，对于这种情况，我们人为再插入一个B点
        //这样就相当于绘制了AB12、B12B34、B34C
        /*const B12Indexes: number[] = [];//所有起始拐点的索引
        points.forEach((point: RoutePoint, index) => {
            if (index > 0 && index < points.length - 1) {
                const prevPoint = points[index - 1];
                const nextPoint = points[index + 1];
                const vector1 = Vector.verticeMinusVertice(point.vertice, prevPoint.vertice);
                const vector2 = Vector.verticeMinusVertice(nextPoint.vertice, point.vertice);
                const radian = Vector.getRadianOfTwoVectors(vector1, vector2);
                const angle = MathUtils.radianToDegree(radian);
                if (angle > this.inflexionPointAngle) {
                    //point就是B点，即道路的拐点
                    point.B12 = true;
                    point.B34 = false;
                    B12Indexes.push(index);
                    console.log("拐点:", point);
                }
            }
        });*/

        //逆向遍历B12Indexes，在所有起始拐点B12后面插入额外的终止拐点B34
        /*for (let i = B12Indexes.length - 1; i >= 0; i--) {
            const B12Index = B12Indexes[i];
            const B12 = points[B12Index];
            const B34 = {
                ...B12,
                B12: false,
                B34: true
            } as RoutePoint;
            points.splice(B12Index + 1, 0, B34);
        }*/

        points.forEach((startPoint: RoutePoint, index: number) => {
            if (index !== points.length - 1) {
                // if (startPoint.B12) {
                //     //B12为true时，B12向量与AB相同
                //     const prevPoint = points[index - 1];
                //     startPoint.start2EndVector = prevPoint.start2EndVector;
                // } else {
                    const endPoint = points[index + 1];
                    startPoint.start2EndVector = Vector.verticeMinusVertice(endPoint.vertice, startPoint.vertice);
                // }
            } else {
                const prevPoint = points[index - 1];
                startPoint.start2EndVector = prevPoint.start2EndVector;
            }
        });

        let startIndex: number = 0;

        points.forEach((point: RoutePoint, index: number) => {
            const result = this._getRouteVertices(startIndex, point.vertice, point.start2EndVector, resolution, pixelWidth);
            startIndex = result.startIndex;
            point.v1 = result.v1;
            point.v3 = result.v3;
            mesh.vertices.push(point.v1, point.v3);
            if (index !== 0) {
                const prevPoint = points[index - 1];
                const v1 = prevPoint.v1;
                const v3 = prevPoint.v3;
                const v0 = point.v1;
                const v2 = point.v3;
                const triangles = Mesh.buildPlane(v0, v1, v2, v3);
                mesh.triangles.push(...triangles);
            }
        });

        return mesh;
    }

    private _getRouteVertices(startIndex: number, startVertice: Vertice, start2EndVector: Vector, resolution: number, pixelWidth: number) {
        /*对于一个面从外面向里面看的绘制顺序
		 * 0    end    2
		 *
		 * 1   start   3*/
        const origin2StartVector = Vector.fromVertice(startVertice);
        // const start2EndVector = Vector.verticeMinusVertice(endVertice, startVertice);
        const end2StartVector = start2EndVector.getOpposite();

        // const [resolution,bestLevel] = this.camera.calculateCurrentResolutionAndBestDisplayLevel();
        // const {
        //     resolutionX,
        //     bestDisplayLevelFloatX,
        //     resolutionY,
        //     bestDisplayLevelFloatY
        // } = this.camera.measureXYResolutionAndBestDisplayLevel();
        // const resolution = (resolutionX + resolutionY) / 2;
        const offset = resolution * pixelWidth / 2;

        const start2LeftBottomVector = origin2StartVector.cross(start2EndVector).setLength(offset);
        const p1 = Vector.verticePlusVector(startVertice, start2LeftBottomVector).getArray();
        const v1 = new MeshVertice({
            i: startIndex++,
            p: p1
        });

        const start2RightBottomVector = origin2StartVector.cross(end2StartVector).setLength(offset);
        const p3 = Vector.verticePlusVector(startVertice, start2RightBottomVector).getArray();
        const v3 = new MeshVertice({
            i: startIndex++,
            p: p3
        });

        //     const end2LeftTopVector = origin2EndVector.cross(start2EndVector).setLength(offset);
        //     const p0 = Vector.verticePlusVector(endVertice, end2LeftTopVector).getArray();
        //     const v0 = new MeshVertice({
        //         i: startIndex++,
        //         p: p0
        //     });

        //     const end2RightTopVector = origin2EndVector.cross(end2StartVector).setLength(offset);
        //     const p2 = Vector.verticePlusVector(endVertice, end2RightTopVector).getArray();
        //     const v2 = new MeshVertice({
        //         i: startIndex++,
        //         p: p2
        //     });

        return {
            startIndex: startIndex,
            v1: v1,
            v3: v3
        };
    }
}

export default class RouteLayer extends GraphicGroup<Drawable>{
    private pixelWidth: number = 5;
    private busColor: number[] = [82, 153, 255];
    private drivingColor: number[] = [0, 189, 0];
    private walkingColor: number[] = [76, 221, 38];
    private startLonlat: number[] = null;//起点
    private endLonlat: number[] = null;//终点
    private route: any = null;//路径查询结果
    //将1米的作为连接两个经纬度点的最小阈值的平方
    private deltaLonlatSquareThreshold: number = Math.pow(1 / (2 * Math.PI * Kernel.REAL_EARTH_RADIUS) * 360, 2);

    private constructor(private camera: Camera, private key: string) {
        super();
        // this.test();
        Utils.subscribe('level-change', () => {
            if (this.children.length > 0) {
                const resolution = this._getResolution();
                this.children.forEach((graphic: Drawable) => {
                    if (graphic instanceof MeshRouteGraphic) {
                        graphic.updateGeometry(resolution);
                    }
                });
            }
        });
    }

    test(pixelWidth: number = 5, segments: number = 100, rgb: number[] = [0, 255, 0]) {
        // this.clear();
        // const startLonLat: number[] = [116, 40];//[116, -40];
        // const endLonLat: number[] = [116, 25];// [116, 40];
        const resolution = this._getResolution();
        // this._addRouteByLonlat(startLonLat, endLonLat, resolution, pixelWidth, segments, rgb);
        this._addRouteByLonlats([[90, 0], [120, 0], [120, 40]], resolution, this.pixelWidth, rgb);
    }

    private _addRouteByLonlat(startLonLat: number[], endLonLat: number[], resolution: number, pixelWidth: number, segments: number, rgb: number[]) {
        const lonlats = this._getLonlatsBySegments(startLonLat, endLonLat, segments);
        return this._addRouteByLonlats(lonlats, resolution, pixelWidth, rgb);
    }

    private _addRouteByLonlats(lonlats: number[][], resolution: number, pixelWidth: number, rgb: number[]) {
        var graphic: Graphic = null;
        if (lonlats.length >= 2) {
            let validLonlats: number[][] = lonlats;

            // lonlats.forEach((lonlat:number[], index) => {
            //     if(index === 0){
            //         validLonlats.push(lonlat);
            //     }else{
            //         const lastLonlat = validLonlats[validLonlats.length - 1];
            //         const deltaLon = lonlat[0] - lastLonlat[0];
            //         const deltaLat = lonlat[1] - lastLonlat[1];
            //         const square = deltaLon * deltaLon + deltaLat * deltaLat;
            //         // if(square > this.deltaLonlatSquareThreshold){
            //         //     validLonlats.push(lonlat);
            //         // }else{
            //         //     const realDistance = MathUtils.getRealArcDistanceBetweenLonLats(lastLonlat[0], lastLonlat[1], lonlat[0], lonlat[1]);
            //         //     console.log(`距离太短:${realDistance}`);
            //         // }
            //         validLonlats.push(lonlat);
            //         const realDistance = MathUtils.getRealArcDistanceBetweenLonLats(lastLonlat[0], lastLonlat[1], lonlat[0], lonlat[1]);
            //         console.log(`距离:${realDistance}`);
            //     }
            // });

            if (validLonlats.length >= 2) {
                // if(isWindows){
                //     graphic = new MeshRouteGraphic(validLonlats, pixelWidth, resolution, new ColorMaterial(rgb));
                // }else{
                //     const vertices = validLonlats.map((lonlat) => {
                //         return MathUtils.geographicToCartesianCoord(lonlat[0], lonlat[1]);
                //     });
                //     const line = new Line(vertices);
                //     graphic = new LineGraphic(line, new ColorMaterial(rgb), pixelWidth);
                // }
                // this.add(graphic);
                // return graphic;
                graphic = new MeshRouteGraphic(validLonlats, pixelWidth, resolution, new ColorMaterial(rgb));
                this.add(graphic);
            }
        }
        return graphic;
    }

    private _getResolution() {
        const {
            resolutionX,
            bestDisplayLevelFloatX,
            resolutionY,
            bestDisplayLevelFloatY
        } = this.camera.measureXYResolutionAndBestDisplayLevel();
        return (resolutionX + resolutionY) / 2;
    }

    private _getLonlatsBySegments(startLonLat: number[], endLonLat: number[], segments: number) {
        const deltaLon: number = (endLonLat[0] - startLonLat[0]) / segments;
        const deltaLat: number = (endLonLat[1] - startLonLat[1]) / segments;
        const lonlats: number[][] = [];
        for (let i = 0; i < segments; i++) {
            let lonlat: number[] = [startLonLat[0] + deltaLon * i, startLonLat[1] + deltaLat * i];
            lonlats.push(lonlat);
        }
        lonlats.push(endLonLat);
        return lonlats;
    }

    showPath(pathIndex: number) {
        if (this.route) {
            if (this.route.type === 'driving') {
                this._showDrivingPath(pathIndex);
            } else if (this.route.type === 'bus') {
                this._showBusPath(pathIndex);
            } else if( this.route.type === 'walking'){
                this._showWalkingPath(pathIndex);
            }
        }
    }

    routeByDriving(fromLon: number, fromLat: number, toLon: number, toLat: number, strategy: number = 5) {
        return Service.routeByDriving(fromLon, fromLat, toLon, toLat, this.key, strategy).then((response: any) => {
            this._clearAll();
            if (response.route && response.route.paths && response.route.paths.length > 0) {
                this.startLonlat = [fromLon, fromLat];
                this.endLonlat = [toLon, toLat];
                this.route = response.route;
                this.showPath(0);
            }
            return response;
        });
    }

    private _showDrivingPath(pathIndex: number) {
        if (this.route && this.route.paths && this.route.paths.length > 0) {
            const path: any = this.route.paths[pathIndex];
            if (path && path.steps && path.steps.length > 0) {
                this.clear();
                const lonlats: number[][] = [];
                // const lonlatsSegments: number[][][] = [];

                path.steps.forEach((step: any, index: number, steps: any[]) => {
                    /*
                    if (index !== 0) {
                        let prevStep = steps[index - 1];
                        const joinLonlats: number[][] = [prevStep.lastLonlat, step.firstLonlat];
                        // this._addRouteByLonlats(joinLonlats, resolution, this.pixelWidth, this.drivingColor);
                        lonlatsSegments.push(joinLonlats);
                        lonlats.push(...joinLonlats);
                    }
                    // this._addRouteByLonlats(step.lonlats, resolution, this.pixelWidth, this.drivingColor);
                    lonlatsSegments.push(step.lonlats);
                    */
                    lonlats.push(...step.lonlats);
                });

                const extent = Extent.fromLonlats(lonlats);

                if (extent) {
                    this.camera.setExtent(extent);

                    setTimeout(() => {
                        //It's better to show path after extent changed because we can use the new resolution.
                        const resolution = this._getResolution();
                        /*lonlatsSegments.forEach((lonlats: number[][]) => {
                            this._addRouteByLonlats(lonlats, resolution, this.pixelWidth, this.drivingColor);
                        });*/
                        this._addRouteByLonlats(lonlats, resolution, this.pixelWidth, this.drivingColor);
                        this._showStartEndPoints();
                    }, 0);
                }
            }
        }
    }

    routeByBus(fromLon: number, fromLat: number, toLon: number, toLat: number, startCity: string, endCity: string, strategy: number = 0) {
        return Service.routeByBus(fromLon, fromLat, toLon, toLat, startCity, endCity, this.key, strategy).then((response: any) => {
            this._clearAll();
            if (response.route && response.route.transits && response.route.transits.length > 0) {
                this.startLonlat = [fromLon, fromLat];
                this.endLonlat = [toLon, toLat];
                this.route = response.route;
                this.showPath(0);
            }
            return response;
        });
    }

    private _showBusPath(pathIndex: number) {
        if (this.route && this.route.transits && this.route.transits.length > 0) {
            const transit = this.route.transits[pathIndex];
            if (transit && transit.segments && transit.segments.length > 0) {
                this.clear();
                const lonlats: number[][] = [];
                const lonlatsSegments: number[][][] = [];

                transit.segments.forEach((segment: any) => {
                    if (segment.walking && segment.walking.lonlats && segment.walking.lonlats.length > 0) {
                        // this._addRouteByLonlats(segment.walking.lonlats, resolution, this.pixelWidth, this.walkingColor);
                        segment.walking.lonlats.color = this.walkingColor;
                        lonlatsSegments.push(segment.walking.lonlats);
                        lonlats.push(...segment.walking.lonlats);
                    }

                    if (segment.bus && segment.bus.lonlats && segment.bus.lonlats.length > 0) {
                        // this._addRouteByLonlats(segment.bus.lonlats, resolution, this.pixelWidth, this.busColor);
                        segment.bus.lonlats.color = this.busColor;
                        lonlatsSegments.push(segment.bus.lonlats);
                        lonlats.push(...segment.bus.lonlats);
                    }

                    if (segment.railway && segment.railway.lonlats && segment.railway.lonlats.length > 0) {
                        segment.railway.lonlats.color = this.busColor;
                        lonlatsSegments.push(segment.railway.lonlats);
                        lonlats.push(...segment.railway.lonlats);
                    }
                });

                const extent = Extent.fromLonlats(lonlats);

                if (extent) {
                    this.camera.setExtent(extent);

                    setTimeout(() => {
                        const resolution = this._getResolution();
                        lonlatsSegments.forEach((lonlats: number[][]) => {
                            this._addRouteByLonlats(lonlats, resolution, this.pixelWidth, (lonlats as any).color);
                        });
                        this._showStartEndPoints();
                    }, 0);
                }
            }
        }
    }

    routeByWalking(fromLon: number, fromLat: number, toLon: number, toLat: number) {
        return Service.routeByWalking(fromLon, fromLat, toLon, toLat, this.key).then((response: any) => {
            this._clearAll();
            if (response.route && response.route.paths && response.route.paths.length > 0) {
                this.startLonlat = [fromLon, fromLat];
                this.endLonlat = [toLon, toLat];
                this.route = response.route;
                this._showWalkingPath(0);
            }
            return response;
        });
    }

    private _showWalkingPath(pathIndex: number) {
        if (this.route && this.route.paths && this.route.paths.length > 0) {
            const path = this.route.paths[pathIndex];
            if (path && path.steps && path.steps.length > 0) {
                this.clear();
                const lonlats: number[][] = [];

                path.steps.forEach((step: any) => {
                    lonlats.push(...step.lonlats);
                });

                const extent = Extent.fromLonlats(lonlats);

                if (extent) {
                    this.camera.setExtent(extent);

                    setTimeout(() => {
                        const resolution = this._getResolution();
                        this._addRouteByLonlats(lonlats, resolution, this.pixelWidth, this.walkingColor);
                        this._showStartEndPoints();
                    }, 0);
                }
            }
        }
    }

    private _showStartEndPoints(){
        if(this.startLonlat){
            let material = new MarkerTextureMaterial(startPointImageUrl, startPointImageSize);
            let startPointGraphic = new MultiPointsGraphic(material);
            startPointGraphic.setLonlats([this.startLonlat]);
            this.add(startPointGraphic);
        }

        if(this.endLonlat){
            let material = new MarkerTextureMaterial(endPointImageUrl, endPointImageSize);
            let endPointGraphic = new MultiPointsGraphic(material);
            endPointGraphic.setLonlats([this.endLonlat]);
            this.add(endPointGraphic);
        }
    }

    private _clearAll() {
        this.startLonlat = null;
        this.endLonlat = null;
        this.route = null;
        this.clear();
    }

    protected onDraw(camera: Camera) {
        const gl = Kernel.gl;

        gl.disable(Kernel.gl.DEPTH_TEST);
        gl.depthMask(false);

        super.onDraw(camera);

        gl.enable(Kernel.gl.DEPTH_TEST);
        gl.depthMask(true);
    }

    destroy() {
        this.camera = null;
        super.destroy();
    }

    test2(str: string) {
        const splits = str.split(";");
        const splits1 = splits[0].split(",");
        const splits2 = splits[1].split(",");
        var lon1 = parseFloat(splits1[0]);
        var lat1 = parseFloat(splits1[1]);
        var lon2 = parseFloat(splits2[0]);
        var lat2 = parseFloat(splits2[1]);
        var s = Math.pow((lon1 - lon2), 2) + Math.pow((lat1 - lat2), 2);
        const distance = MathUtils.getRealArcDistanceBetweenLonLats(lon1, lat1, lon2, lat2);
        return {
            lon1: lon1,
            lat1: lat1,
            lon2: lon2,
            lat2: lat2,
            s: s,
            distance: distance
        };
    }

    static getInstance(camera: Camera, key: string) {
        return new RouteLayer(camera, key);
    }
};