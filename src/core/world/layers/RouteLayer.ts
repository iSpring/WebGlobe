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
        // Utils.subscribe('level-change', () => {
        //     ;
        // });
        super();
    }

    test(){
        this.clear();
        const startLonLat: number[] = [116, 40];//[116, -40];
        const endLonLat: number[] = [119.20411664179007, 25.383673329851703];// [116, 40];
        const pixelWidth = 5;
        const lineMesh = this.getLineMesh(startLonLat, endLonLat, pixelWidth);
        const material = new MeshColorMaterial([0, 1, 0]);
        const graphic = new MeshColorGraphic(lineMesh, material);
        this.add(graphic);
    }

    private getLineMesh(startLonLat: number[], endLonLat: number[], pixelWidth: number){
        // const lineMesh = this.getLineMesh([116, -40], [117, 40], 1);
        // const material = new MeshColorMaterial([0, 1, 0]);
        // const graphic = new MeshColorGraphic(lineMesh, material);
        /*对于一个面从外面向里面看的绘制顺序
		 * 0    end    2
		 *
		 * 1   start   3*/
        const startVertice = MathUtils.geographicToCartesianCoord(startLonLat[0], startLonLat[1]);
        const origin2StartVector = Vector.fromVertice(startVertice);
        const endVertice = MathUtils.geographicToCartesianCoord(endLonLat[0], endLonLat[1]);
        const origin2EndVector = Vector.fromVertice(endVertice);
        const [resolution,bestLevel] = this.camera.calculateCurrentResolutionAndBestDisplayLevel();
        const offset = resolution * pixelWidth / 2;
        const start2EndVector = Vector.verticeMinusVertice(endVertice, startVertice);
        const end2StartVector = start2EndVector.getOpposite();

        let startIndex: number = 0;

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

        const end2LeftTopVector = origin2EndVector.cross(start2EndVector).setLength(offset);
        const p0 = Vector.verticePlusVector(endVertice, end2LeftTopVector).getArray();
        const v0 = new MeshVertice({
            i: startIndex++,
            p: p0
        });

        const end2RightTopVector = origin2EndVector.cross(end2StartVector).setLength(offset);
        const p2 = Vector.verticePlusVector(endVertice, end2RightTopVector).getArray();
        const v2 = new MeshVertice({
            i: startIndex++,
            p: p2
        });

        const mesh = new Mesh();
        mesh.vertices = [v0, v1, v2, v3];
        mesh.triangles = Mesh.buildPlane(v0, v1, v2, v3);
        return mesh;
    }

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