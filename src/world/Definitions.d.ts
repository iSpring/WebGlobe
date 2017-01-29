import Matrix = require('./math/Matrix');
import Camera from './Camera';
import GraphicGroup = require('./GraphicGroup');

interface WebGLProgramExtension extends WebGLProgram{
    uMVMatrix: WebGLUniformLocation;
    uPMatrix: WebGLUniformLocation;
    uSampler: WebGLUniformLocation;
    uOffScreen: WebGLUniformLocation;
    aVertexPosition: number;
    aTextureCoord: number;
}

export interface WebGLRenderingContextExtension extends WebGLRenderingContext{
    shaderProgram: WebGLProgramExtension;
}

export interface IMockCamera{
    fov: number;
    aspect: number;
    near: number;
    far: number;
    realLevel: number;
    matrix: Matrix;
    equals(other: IMockCamera): boolean;
}

export interface Drawable{
    id: number;
    parent: GraphicGroup<Drawable>;
    draw(camera: Camera): void;
    shouldDraw(camera: Camera): boolean;
    destroy(): void;
}