import TileGrid from './TileGrid';

class Extent{
    constructor(private minLon: number, private minLat: number, private maxLon: number, private maxLat: number, private tileGrid?: TileGrid){

    }

    clone(){
        return new Extent(this.minLon, this.minLat, this.maxLon, this.maxLat, this.tileGrid);
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

    getTileGrid(){
        return this.tileGrid;
    }

    toJson(){
        return [this.minLon, this.minLat, this.maxLon, this.maxLat];
    }

    static union(extents: Extent[]): Extent{
        var unionExtent:Extent = null;
        if(extents.length > 0){
            if(extents.length === 1){
                unionExtent = extents[0].clone();
            }else{
                var minLons:number[] = [];
                var minLats:number[] = [];
                var maxLons:number[] = [];
                var maxLats:number[] = [];
                extents.forEach(function(extent){
                    minLons.push(extent.getMinLon());
                    minLats.push(extent.getMinLat());
                    maxLons.push(extent.getMaxLon());
                    maxLats.push(extent.getMaxLat());
                });
                const minLon = Math.min(...minLons);
                const minLat = Math.min(...minLats);
                const maxLon = Math.max(...maxLons);
                const maxLat = Math.max(...maxLats);
                unionExtent = new Extent(minLon, minLat, maxLon, maxLat);
            }
        }
        return unionExtent;
    }
}

export = Extent;