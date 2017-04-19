import Kernel from '../Kernel';
import Utils from '../Utils';
import MathUtils from '../math/Utils';
import Vertice from '../geometries/MeshVertice';
import Triangle from '../geometries/Triangle';
import Mesh from '../geometries/Mesh';
import MeshColorGraphic from '../graphics/MeshColorGraphic';
import MeshColorMaterial from '../materials/MeshColorMaterial';
import GraphicGroup from '../GraphicGroup';
import {Drawable} from '../Definitions.d';
import Camera from '../Camera';

export default class RouteLayer extends GraphicGroup<Drawable>{
    private constructor(){
        // Utils.subscribe('level-change', () => {
        //     ;
        // });
        super();
        const testGraphic = RouteLayer.testMeshColorGraphic();
        this.add(testGraphic);
    }

    protected onDraw(camera: Camera) {
        const gl = Kernel.gl;
        
        gl.disable(WebGLRenderingContext.DEPTH_TEST);
        gl.depthMask(false);

        super.onDraw(camera);

        gl.enable(WebGLRenderingContext.DEPTH_TEST);
        gl.depthMask(true);
    }

    static getInstance(){
        return new RouteLayer();
    }

    static testMeshColorGraphic(){
        /*对于一个面从外面向里面看的绘制顺序
		 * 0      2
		 *
		 * 1      3*/
		//0,1,2; 2,1,3
        const minLon: number = 116;
        const maxLon: number = 117;
        const minLat: number = - 40;
        const maxLat: number = 40;

        const startIndex: number = 0;
		
		//vertices
		var v0 = new Vertice({
			i: startIndex,
			p: MathUtils.geographicToCartesianCoord(minLon, maxLat).getArray()
		});

		var v1 = new Vertice({
			i: startIndex + 1,
			p: MathUtils.geographicToCartesianCoord(minLon, minLat).getArray()
		});

		var v2 = new Vertice({
			i: startIndex + 2,
			p: MathUtils.geographicToCartesianCoord(maxLon, maxLat).getArray()
		});

		var v3 = new Vertice({
			i: startIndex + 3,
			p: MathUtils.geographicToCartesianCoord(maxLon, minLat).getArray()
		});

        const mesh = new Mesh();
        mesh.vertices = [v0, v1, v2, v3];
        mesh.triangles = Mesh.buildPlane(v0, v1, v2, v3);
        const material = new MeshColorMaterial([0, 1, 0]);
        const graphic = new MeshColorGraphic(mesh, material);
        return graphic;
    }
};