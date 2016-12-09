///<amd-module name="world/Extent" />

class Extent{
    constructor(private minLon: number, private minLat: number, private maxLon: number, private maxLat: number){

    }

    getMinLon(){
        return this.minLon;
    }

    getMinLat(){
        return this.minLat;
    }

    getMaxLon(){
        return this.maxLon;
    }

    getMaxLat(){
        return this.maxLat;
    }

    toJson(){
        return [this.minLon, this.minLat, this.maxLon, this.maxLat];
    }

    static union(extents: Extent[]): Extent{
        return null;
    }
}

export = Extent;