import Kernel = require('./Kernel');
import Matrix = require('./Matrix');
import Vertice = require('./Vertice');
import Vector = require('./Vector');
import TextureMaterial = require('./TextureMaterial');

class Object3D {
    id: number;
    matrix: Matrix;
    parent: any;
    vertices: number[];
    vertexBuffer: WebGLBuffer;
    indices: number[];
    indexBuffer: WebGLBuffer;
    textureCoords: number[];
    textureCoordBuffer: WebGLBuffer;
    material: TextureMaterial;
    visible: boolean;

    constructor(args?: any) {
        this.id = ++Kernel.idCounter;
        this.matrix = new Matrix();
        this.parent = null;
        this.vertices = [];
        this.vertexBuffer = null;
        this.indices = [];
        this.indexBuffer = null;
        this.textureCoords = [];
        this.textureCoordBuffer = null;
        this.material = null;
        this.visible = true;
        if (args && args.material) {
            this.material = args.material;
        }
        this.createVerticeData(args);
    }

    /**
       * 根据传入的参数生成vertices和indices，然后通过调用setBuffers初始化buffer
       * @param params 传入的参数
       */
    createVerticeData(params: any): void {
        /*var infos = {
            vertices:vertices,
            indices:indices
        };
        this.setBuffers(infos);*/
    }

    /**
     * 设置buffer，由createVerticeData函数调用
     * @param infos 包含vertices和indices信息，由createVerticeData传入参数
     */
    setBuffers(infos: any): void {
        if (infos) {
            this.vertices = infos.vertices || [];
            this.indices = infos.indices || [];
            this.textureCoords = infos.textureCoords || [];
            if (this.vertices.length > 0 && this.indices.length > 0) {
                if (!(Kernel.gl.isBuffer(this.vertexBuffer))) {
                    this.vertexBuffer = Kernel.gl.createBuffer();
                }
                Kernel.gl.bindBuffer(Kernel.gl.ARRAY_BUFFER, this.vertexBuffer);
                Kernel.gl.bufferData(Kernel.gl.ARRAY_BUFFER, new Float32Array(this.vertices), Kernel.gl.STATIC_DRAW);

                if (!(Kernel.gl.isBuffer(this.indexBuffer))) {
                    this.indexBuffer = Kernel.gl.createBuffer();
                }
                Kernel.gl.bindBuffer(Kernel.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                Kernel.gl.bufferData(Kernel.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), Kernel.gl.STATIC_DRAW);
            }

            //使用纹理
            if (this.material instanceof TextureMaterial) {
                if (this.textureCoords.length > 0) { //提供了纹理坐标
                    if (!(Kernel.gl.isBuffer(this.textureCoordBuffer))) {
                        this.textureCoordBuffer = Kernel.gl.createBuffer();
                    }
                    Kernel.gl.bindBuffer(Kernel.gl.ARRAY_BUFFER, this.textureCoordBuffer);
                    Kernel.gl.bufferData(Kernel.gl.ARRAY_BUFFER, new Float32Array(this.textureCoords), Kernel.gl.STATIC_DRAW);
                }
            }
        }
        Kernel.gl.bindBuffer(Kernel.gl.ARRAY_BUFFER, null);
        Kernel.gl.bindBuffer(Kernel.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    setShaderMatrix(camera: any): void {
        // if (!(camera instanceof PerspectiveCamera)) {
        //   throw "invalid camera : not World.PerspectiveCamera";
        // }
        camera.viewMatrix = (camera.viewMatrix instanceof Matrix) ? camera.viewMatrix : camera.getViewMatrix();
        var mvMatrix = camera.viewMatrix.multiplyMatrix(this.matrix);
        Kernel.gl.uniformMatrix4fv(Kernel.gl.shaderProgram.uMVMatrix, false, mvMatrix.elements);
        Kernel.gl.uniformMatrix4fv(Kernel.gl.shaderProgram.uPMatrix, false, camera.projMatrix.elements);
    }

    draw(camera: any): void {
        // if (!(camera instanceof PerspectiveCamera)) {
        //   throw "invalid camera : not World.PerspectiveCamera";
        // }
        if (this.visible) {
            if (this.material instanceof TextureMaterial && this.material.loaded) {
                Kernel.gl.enableVertexAttribArray(Kernel.gl.shaderProgram.aTextureCoord);
                Kernel.gl.bindBuffer(Kernel.gl.ARRAY_BUFFER, this.textureCoordBuffer);
                Kernel.gl.vertexAttribPointer(Kernel.gl.shaderProgram.aTextureCoord, 2, Kernel.gl.FLOAT, false, 0, 0);

                Kernel.gl.activeTexture(Kernel.gl.TEXTURE0);
                Kernel.gl.bindTexture(Kernel.gl.TEXTURE_2D, this.material.texture);
                Kernel.gl.uniform1i(Kernel.gl.shaderProgram.uSampler, 0);

                this.setShaderMatrix(camera);

                //往shader中对vertex赋值
                Kernel.gl.enableVertexAttribArray(Kernel.gl.shaderProgram.aVertexPosition);
                Kernel.gl.bindBuffer(Kernel.gl.ARRAY_BUFFER, this.vertexBuffer);
                Kernel.gl.vertexAttribPointer(Kernel.gl.shaderProgram.aVertexPosition, 3, Kernel.gl.FLOAT, false, 0, 0);

                //设置索引，但不用往shader中赋值
                Kernel.gl.bindBuffer(Kernel.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                //绘图
                Kernel.gl.drawElements(Kernel.gl.TRIANGLES, this.indices.length, Kernel.gl.UNSIGNED_SHORT, 0);

                Kernel.gl.bindBuffer(Kernel.gl.ARRAY_BUFFER, null);
                Kernel.gl.bindBuffer(Kernel.gl.ELEMENT_ARRAY_BUFFER, null);
                Kernel.gl.bindTexture(Kernel.gl.TEXTURE_2D, null);
            }
        }
    }

    //释放显存中的buffer资源
    releaseBuffers(): void {
        //释放显卡中的资源
        if (Kernel.gl.isBuffer(this.vertexBuffer)) {
            Kernel.gl.deleteBuffer(this.vertexBuffer);
        }
        if (Kernel.gl.isBuffer(this.indexBuffer)) {
            Kernel.gl.deleteBuffer(this.indexBuffer);
        }
        if (Kernel.gl.isBuffer(this.textureCoordBuffer)) {
            Kernel.gl.deleteBuffer(this.textureCoordBuffer);
        }
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.textureCoordBuffer = null;
    }

    destroy(): void {
        this.parent = null;
        this.releaseBuffers();
        if (this.material instanceof TextureMaterial) {
            this.material.releaseTexture();
            this.material = null;
        }
    }

    //需要子类重写
    getPosition(): Vertice {
        var position = this.matrix.getPosition();
        return position;
    }

    //需要子类重写
    setPosition(x: number, y: number, z: number): void {
        this.matrix.setColumnTrans(x, y, z);
    }

    worldTranslate(x: number, y: number, z: number): void {
        this.matrix.worldTranslate(x, y, z);
    }

    localTranslate(x: number, y: number, z: number): void {
        this.matrix.localTranslate(x, y, z);
    }

    worldScale(scaleX: number, scaleY: number, scaleZ: number): void {
        this.matrix.worldScale(scaleX, scaleY, scaleZ);
    }

    localScale(scaleX: number, scaleY: number, scaleZ: number): void {
        this.matrix.localScale(scaleX, scaleY, scaleZ);
    }

    worldRotateX(radian: number): void {
        this.matrix.worldRotateX(radian);
    }

    worldRotateY(radian: number): void {
        this.matrix.worldRotateY(radian);
    }

    worldRotateZ(radian: number): void {
        this.matrix.worldRotateZ(radian);
    }

    worldRotateByVector(radian: number, vector: Vector): void {
        this.matrix.worldRotateByVector(radian, vector);
    }

    localRotateX(radian: number): void {
        this.matrix.localRotateX(radian);
    }

    localRotateY(radian: number): void {
        this.matrix.localRotateY(radian);
    }

    localRotateZ(radian: number): void {
        this.matrix.localRotateZ(radian);
    }

    //localVector指的是相对于模型坐标系中的向量
    localRotateByVector(radian: number, localVector: Vector): void {
        this.matrix.localRotateByVector(radian, localVector);
    }

    getXAxisDirection(): Vector {
        var columnX = this.matrix.getColumnX(); //Vertice
        var directionX = columnX.getVector(); //Vector
        directionX.normalize();
        return directionX;
    }

    getYAxisDirection(): Vector {
        var columnY = this.matrix.getColumnY();
        var directionY = columnY.getVector();
        directionY.normalize();
        return directionY;
    }

    getZAxisDirection(): Vector {
        var columnZ = this.matrix.getColumnZ();
        var directionZ = columnZ.getVector();
        directionZ.normalize();
        return directionZ;
    }
}

export = Object3D;