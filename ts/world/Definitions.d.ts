interface WebGLProgramExtension extends WebGLProgram{
    uMVMatrix: number[];
    uPMatrix: number[];
    aVertexPosition: number;
    aTextureCoord: number;
    uSampler: number;
}

export interface WebGLRenderingContextExtension extends WebGLRenderingContext{
    shaderProgram: WebGLProgramExtension;
}