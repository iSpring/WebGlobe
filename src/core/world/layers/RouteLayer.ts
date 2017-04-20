import Kernel from '../Kernel';
import Utils from '../Utils';
import MathUtils from '../math/Utils';
import Vertice from '../math/Vertice';
import Vector from '../math/Vector';
import MeshVertice from '../geometries/MeshVertice';
import Triangle from '../geometries/Triangle';
import Mesh from '../geometries/Mesh';
import MeshColorGraphic from '../graphics/MeshColorGraphic';
import MeshColorMaterial from '../materials/MeshColorMaterial';
import GraphicGroup from '../GraphicGroup';
import {Drawable} from '../Definitions.d';
import Camera from '../Camera';

export default class RouteLayer extends GraphicGroup<Drawable>{
    private constructor(private camera: Camera){
        super();
        this.test();
        Utils.subscribe('level-change', () => {
            this.test();
        });
    }

    test(pixelWidth:number = 5, segments: number = 100){
        const startLonLat: number[] = [116, 40];//[116, -40];
        const endLonLat: number[] = [116, 25];// [116, 40];
        this.getLineMeshGraphic(startLonLat, endLonLat, pixelWidth, segments);
    }

    private getLineMeshGraphic(startLonLat: number[], endLonLat: number[], pixelWidth: number, segments: number){
        this.clear();
        const material = new MeshColorMaterial([0, 1, 0]);

        const deltaLon: number = (endLonLat[0] - startLonLat[0]) / segments;
        const deltaLat: number = (endLonLat[1] - startLonLat[1]) / segments;
        const lonlats: number[][] = [];
        for(let i = 0; i < segments; i++){
            let lonlat: number[] = [startLonLat[0] + deltaLon * i, startLonLat[1] + deltaLat * i];
            lonlats.push(lonlat);
        }
        lonlats.push(endLonLat);
        const mesh = this.getLineMeshByLonLats(lonlats, pixelWidth);
        const graphic = new MeshColorGraphic(mesh, material);
        this.add(graphic);
    }

    private getLineMeshByLonLats(lonlats: number[][], pixelWidth: number){
        const mesh =  new Mesh();

        //count
        const vertices: Vertice[] = lonlats.map((lonlat) => {
            return MathUtils.geographicToCartesianCoord(lonlat[0], lonlat[1]);
        });
        //count
        const start2EndVectors:Vector[] = [];
        for(let i = 0; i < vertices.length - 1; i++){
            let startVertice = vertices[i];
            let endVertice = vertices[i+1];
            const start2EndVector = Vector.verticeMinusVertice(endVertice, startVertice);
            start2EndVectors.push(start2EndVector);
        }
        start2EndVectors.push(start2EndVectors[start2EndVectors.length - 1]);

        let startIndex: number = 0;
        const meshVerticesList: MeshVertice[][] = [];
        for(let i = 0; i < vertices.length; i++){
            let startVertice = vertices[i];
            let start2EndVector = start2EndVectors[i];
            let result = this.getLineMesh(startIndex, startVertice, start2EndVector, pixelWidth);
            startIndex = result.startIndex;
            meshVerticesList.push([result.v1, result.v3]);
            mesh.vertices.push(result.v1, result.v3);
        }

        for(let i = 0; i < meshVerticesList.length - 1; i++){
            let v1 = meshVerticesList[i][0];
            let v3 = meshVerticesList[i][1];
            let v0 = meshVerticesList[i+1][0];
            let v2 = meshVerticesList[i+1][1];
            let triangles = Mesh.buildPlane(v0, v1, v2, v3);
            mesh.triangles.push(...triangles);
        }
        return mesh;
    }

    private getLineMesh(startIndex:number, startVertice: Vertice, start2EndVector: Vector, pixelWidth: number){
        // const lineMesh = this.getLineMesh([116, -40], [117, 40], 1);
        // const material = new MeshColorMaterial([0, 1, 0]);
        // const graphic = new MeshColorGraphic(lineMesh, material);
        /*对于一个面从外面向里面看的绘制顺序
		 * 0    end    2
		 *
		 * 1   start   3*/
        const origin2StartVector = Vector.fromVertice(startVertice);
        // const start2EndVector = Vector.verticeMinusVertice(endVertice, startVertice);
        const end2StartVector = start2EndVector.getOpposite();

        // const [resolution,bestLevel] = this.camera.calculateCurrentResolutionAndBestDisplayLevel();
        const {
            resolutionX,
            bestDisplayLevelFloatX,
            resolutionY,
            bestDisplayLevelFloatY
        } = this.camera.measureXYResolutionAndBestDisplayLevel();
        const resolution = (resolutionX + resolutionY) / 2;
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

        return {
            startIndex: startIndex,
            v1: v1,
            v3: v3
        };
    }

    // private getLineMesh(startIndex:number, startLonLat: number[], endLonLat: number[], pixelWidth: number){
    //     // const lineMesh = this.getLineMesh([116, -40], [117, 40], 1);
    //     // const material = new MeshColorMaterial([0, 1, 0]);
    //     // const graphic = new MeshColorGraphic(lineMesh, material);
    //     /*对于一个面从外面向里面看的绘制顺序
	// 	 * 0    end    2
	// 	 *
	// 	 * 1   start   3*/
    //     const startVertice = MathUtils.geographicToCartesianCoord(startLonLat[0], startLonLat[1]);
    //     const origin2StartVector = Vector.fromVertice(startVertice);
    //     const endVertice = MathUtils.geographicToCartesianCoord(endLonLat[0], endLonLat[1]);
    //     const origin2EndVector = Vector.fromVertice(endVertice);
    //     // const [resolution,bestLevel] = this.camera.calculateCurrentResolutionAndBestDisplayLevel();
    //     const {
    //         resolutionX,
    //         bestDisplayLevelFloatX,
    //         resolutionY,
    //         bestDisplayLevelFloatY
    //     } = this.camera.measureXYResolutionAndBestDisplayLevel();
    //     const resolution = (resolutionX + resolutionY) / 2;
    //     const offset = resolution * pixelWidth / 2;
    //     const start2EndVector = Vector.verticeMinusVertice(endVertice, startVertice);
    //     const end2StartVector = start2EndVector.getOpposite();

    //     const start2LeftBottomVector = origin2StartVector.cross(start2EndVector).setLength(offset);
    //     const p1 = Vector.verticePlusVector(startVertice, start2LeftBottomVector).getArray();
    //     const v1 = new MeshVertice({
    //         i: startIndex++,
    //         p: p1
    //     });

    //     const start2RightBottomVector = origin2StartVector.cross(end2StartVector).setLength(offset);
    //     const p3 = Vector.verticePlusVector(startVertice, start2RightBottomVector).getArray();
    //     const v3 = new MeshVertice({
    //         i: startIndex++,
    //         p: p3
    //     });

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

    //     const mesh = new Mesh();
    //     mesh.vertices = [v0, v1, v2, v3];
    //     mesh.triangles = Mesh.buildPlane(v0, v1, v2, v3);
    //     return mesh;
    // }

    protected onDraw(camera: Camera) {
        const gl = Kernel.gl;

        gl.disable(WebGLRenderingContext.DEPTH_TEST);
        gl.depthMask(false);

        super.onDraw(camera);

        gl.enable(WebGLRenderingContext.DEPTH_TEST);
        gl.depthMask(true);
    }

    destroy(){
        this.camera = null;
        super.destroy();
    }

    static getInstance(camera: Camera){
        return new RouteLayer(camera);
    }
};