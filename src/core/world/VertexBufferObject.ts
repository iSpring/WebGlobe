import Kernel from './Kernel';
const maxBufferSize:number = 200;
const buffers:WebGLBuffer[] = [];

export default class VertexBufferObject{
	buffer: WebGLBuffer;

	constructor(public target: number){
		//target: ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER
		//ARRAY_BUFFER用于存储实际的顶点数据，使用Float32Array存储数据，例如VBO、CBO、UVBO、NBO分别存储位置、颜色、纹理坐标、向量
		//ELEMENT_ARRAY_BUFFER用于索引数据，使用Uint16Array存储数据，例如IBO
		if(buffers.length > 0){
			// console.info("reuse WebGLBuffer");
		  	this.buffer = buffers.pop();
		}else{
			this.buffer = Kernel.gl.createBuffer();
		}
		// this.buffer = Kernel.gl.createBuffer();
	}

	bind(){
		Kernel.gl.bindBuffer(this.target, this.buffer);
	}

	// unbind(){
	// 	Kernel.gl.bindBuffer(this.target, null);
	// }

	bufferData(data: number[], usage: number, hasBinded: boolean = false){
		if(!hasBinded){
			this.bind();
		}

		var gl = Kernel.gl;

		if(this.target === Kernel.gl.ARRAY_BUFFER){
			gl.bufferData(Kernel.gl.ARRAY_BUFFER, new Float32Array(data), usage);
		}else if(this.target === Kernel.gl.ELEMENT_ARRAY_BUFFER){
			gl.bufferData(Kernel.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), usage);
		}
	}

	destroy(){
		if(this.buffer){
			if(buffers.length < maxBufferSize){
				buffers.push(this.buffer);
			}else{
				Kernel.gl.deleteBuffer(this.buffer);
			}
			// Kernel.gl.deleteBuffer(this.buffer);
		}
		this.buffer = null;
	}
};