export default class Extent {
    constructor(private minLon: number, private minLat: number, private maxLon: number, private maxLat: number) {

    }

    clone() {
        return new Extent(this.minLon, this.minLat, this.maxLon, this.maxLat);
    }

    getMinLon() {
        return this.minLon;
    }

    getMinLat() {
        return this.minLat;
    }

    getMaxLon() {
        return this.maxLon;
    }

    getMaxLat() {
        return this.maxLat;
    }

    toJson() {
        return [this.minLon, this.minLat, this.maxLon, this.maxLat];
    }

    static merge(extents: Extent[], union: boolean):Extent{
        var result: Extent = null;
        if (extents.length === 1) {
            result = extents[0].clone();
        } else if(extents.length > 1){
            var minLons: number[] = [];
            var minLats: number[] = [];
            var maxLons: number[] = [];
            var maxLats: number[] = [];
            extents.forEach(function (extent) {
                minLons.push(extent.getMinLon());
                minLats.push(extent.getMinLat());
                maxLons.push(extent.getMaxLon());
                maxLats.push(extent.getMaxLat());
            });
            if(union){
                const minLon = Math.min(...minLons);
                const minLat = Math.min(...minLats);
                const maxLon = Math.max(...maxLons);
                const maxLat = Math.max(...maxLats);
                result = new Extent(minLon, minLat, maxLon, maxLat);
            }else{
                const minLon = Math.max(...minLons);
                const minLat = Math.max(...minLats);
                const maxLon = Math.min(...maxLons);
                const maxLat = Math.min(...maxLats);
                if(minLon < maxLon && minLat < maxLat){
                    result = new Extent(minLon, minLat, maxLon, maxLat);
                }
            }
        }
        return result;
    }

    static union(extents: Extent[]): Extent {
        return this.merge(extents, true);
    }

    static intersect(extents: Extent[]): Extent {
        return this.merge(extents, false);
    }
};