import Kernel from './Kernel';
import Graphic from './graphics/Graphic';

export default class Program{
	ready: boolean = false;
	activeInfosObject: any;
	program: WebGLProgram;
	private static currentProgram: Program;
	private static readonly programs: Program[] = [];

	private constructor(public vs:string, public fs:string){
		//{name,type,size,loc,isAttribute, isEnabled} the default value of isEnabled is undefined
		//Note: if attribute, loc is number; if uniform, loc is WebGLUniformLocation
		this.activeInfosObject = {};
		this._init();
	}

	static getProgram(vs: string, fs: string){
		var program:Program = Program.findProgram(vs, fs);

		if(!program){
			program = new Program(vs, fs);
			Program.programs.push(program);
		}

		return program;
	}

	static findProgram(vs: string, fs: string){
		var program:Program = null;

		Program.programs.some(function(item){
			if(item.vs === vs && item.fs === fs){
				program = item;
				return true;
			}else{
				return false;
			}
		});

		return program;
	}

	use(){
		if(this.ready && Program.currentProgram !== this){
			Kernel.gl.useProgram(this.program);
			Program.currentProgram = this;
		}
	}

	updateActiveAttribInfos(){
		var count = Kernel.gl.getProgramParameter(this.program, Kernel.gl.ACTIVE_ATTRIBUTES);

		for(var i = 0, activeInfo: any; i < count; i++){
			activeInfo = Kernel.gl.getActiveAttrib(this.program, i);
			activeInfo.loc = Kernel.gl.getAttribLocation(this.program, activeInfo.name);
			activeInfo.isAttribute = true;
			this.activeInfosObject[activeInfo.name] = activeInfo;
		}
	}

	updateActiveUniformInfos(){
		var count = Kernel.gl.getProgramParameter(this.program, Kernel.gl.ACTIVE_UNIFORMS);

		for(var i = 0, activeInfo: any; i < count; i++){
			activeInfo = Kernel.gl.getActiveUniform(this.program, i);
			activeInfo.loc = Kernel.gl.getUniformLocation(this.program, activeInfo.name);
			activeInfo.isAttribute = false;
			this.activeInfosObject[activeInfo.name] = activeInfo;
		}
	}

	getLocation(name: string){
		//loc = gl.getAttribLocation(this.program, name);
		//loc = gl.getUniformLocation(this.program, name);
		var loc = -1;
		var activeInfo = this.activeInfosObject[name];
		if(activeInfo){
			loc = activeInfo.loc;
		}
		return loc;
	}

	getAttribLocation(name: string){
		var loc = -1;
		var activeInfo = this.activeInfosObject[name];
		if(activeInfo && activeInfo.isAttribute){
			loc = activeInfo.loc;
		}
		return loc;
	}

	//return WebGLUniformLocation, not a number
	getUniformLocation(name: string){
		var loc: WebGLUniformLocation;
		var activeInfo = this.activeInfosObject[name];
		if(activeInfo && !activeInfo.isAttribute){
			loc = activeInfo.loc;
		}
		return loc;
	}

	//VertexAttributeState
	getVertexAttrib(){
		/*VERTEX_ATTRIB_ARRAY_ENABLED
		VERTEX_ATTRIB_ARRAY_SIZE
		VERTEX_ATTRIB_ARRAY_STRIDE
		VERTEX_ATTRIB_ARRAY_TYPE
		VERTEX_ATTRIB_ARRAY_NORMALIZED
		VERTEX_ATTRIB_ARRAY_BUFFER_BINDING
		CURRENT_VERTEX_ATTRIB*/
	}

	//Return the uniform value at the passed location in the passed program.
	//The type returned is dependent on the uniform type.
	getUniform(name:string){
		var result: any;
		var loc = this.getUniformLocation(name);
		if(loc){
			result = Kernel.gl.getUniform(this.program, loc);
		}
		return result;
	}

	enableVertexAttribArray(name:string){
		var activeInfo = this.activeInfosObject[name];
		if(activeInfo && activeInfo.isAttribute && activeInfo.isEnabled !== true){
			var loc = activeInfo.loc;
			Kernel.gl.enableVertexAttribArray(loc);
			activeInfo.isEnabled = true;
		}
	}

	disableVertexAttribArray(name:string){
		var activeInfo = this.activeInfosObject[name];
		if(activeInfo && activeInfo.isAttribute && activeInfo.isEnabled !== false){
			var loc = activeInfo.loc;
			Kernel.gl.disableVertexAttribArray(loc);
			activeInfo.isEnabled = false;
		}
	}

	_init(){
		var vs = this._getShader(Kernel.gl.VERTEX_SHADER, this.vs);
		if(!vs){
			return;
		}

		var fs = this._getShader(Kernel.gl.FRAGMENT_SHADER, this.fs);
		if(!fs){
			return;
		}

		this.program = Kernel.gl.createProgram();
		Kernel.gl.attachShader(this.program, vs);
		Kernel.gl.attachShader(this.program, fs);
		Kernel.gl.linkProgram(this.program);

		if (!Kernel.gl.getProgramParameter(this.program, Kernel.gl.LINK_STATUS)) {
			console.error("Could not link program!");
			Kernel.gl.deleteProgram(this.program);
			Kernel.gl.deleteShader(vs);
			Kernel.gl.deleteShader(fs);
			this.program = null;
			return;
		}

		this.updateActiveAttribInfos();
		this.updateActiveUniformInfos();
		this.ready = true;
	}

	_getShader(shaderType:number, shaderText:string){
		var shader = Kernel.gl.createShader(shaderType);
		Kernel.gl.shaderSource(shader, shaderText);
		Kernel.gl.compileShader(shader);

		if(!Kernel.gl.getShaderParameter(shader, Kernel.gl.COMPILE_STATUS)){
            console.error("create shader failed", Kernel.gl.getShaderInfoLog(shader));
            Kernel.gl.deleteShader(shader);
            return null;
        }

        return shader;
	}
};