///<amd-module name="world/ProgramuTILS"/>

import Program = require("./Program");
import Graphic = require("./graphics/Graphic");

const programs:Program[] = [];

const ProgramUtils = {

	getProgram(graphic){
		var program:Program = null;

		var programType = graphic.getProgramType();

		programs.some(function(item){
			if(item.type === graphic.type){
				program = item;
				return true;
			}else{
				return false;
			}
		});

		if(!program){
			program = graphic.createProgram();
			this.programs.push(program);
		}

		return program;
	}
};