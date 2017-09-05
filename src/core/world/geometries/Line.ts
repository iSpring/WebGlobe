import Kernel from '../Kernel';
import Object3D from '../Object3D';
import Vertice from '../math/Vertice';
import VertexBufferObject from '../VertexBufferObject';

export default class Line extends Object3D{
    public vbo: VertexBufferObject = null;
    private verticeCount: number = 0;

    constructor(vertices: Vertice[]){
        super();
        const data:number[] = [];
        this.verticeCount = vertices.length;
        for(var i = 0; i < this.verticeCount; i++){
            const vertice = vertices[i];
            data.push(vertice.x);
            data.push(vertice.y);
            data.push(vertice.z);
        }
        this.vbo = new VertexBufferObject(Kernel.gl.ARRAY_BUFFER);
        this.vbo.bind();
        this.vbo.bufferData(data, Kernel.gl.STATIC_DRAW, true);
    }

    isReady(){
        return this.verticeCount >= 2;
    }

    getVerticeCount(){
        return this.verticeCount;
    }

    destroy(){
        if(this.vbo){
            this.vbo.destroy();
        }
        this.vbo = null;
    }
}