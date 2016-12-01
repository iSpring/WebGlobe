///<amd-module name="world/geometries/MeshVertice"/>
class MeshVertice{
	p:number[];
	n:number[];
	uv:number[];
	c:number[];
	i:number;

	constructor(args:any){
		this.i = args.i;//index
		this.p = args.p;//[x,y,z]
		this.uv = args.uv;//[s,t]

		this.n = args.n;//[x,y,z]
		this.c = args.c;//[r,g,b]
	}
}

export = MeshVertice;