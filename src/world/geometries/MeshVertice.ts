///<amd-module name="world/geometries/MeshVertice"/>
class MeshVertice{
	p:number[];
	n:number[];
	uv:number[];
	c:number[];
	i:number;

	constructor(args:any){
		this.p = args.p;//[x,y,z]
		this.n = args.n;//[x,y,z]
		this.uv = args.uv;//[s,t]
		this.c = args.c;//[r,g,b]
		this.i = args.i;//index
	}
}

export = MeshVertice;