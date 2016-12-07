import Utils = require("../Utils");

class SearchService{
    constructor(){

    }

    static search(wd: string, level: string, minLon: number, minLat: number, maxLon: number, maxLat: number, callback: (response: any)=>{}){
        var url = `//apis.map.qq.com/jsapi?qt=syn&wd=${wd}&pn=0&rn=5&output=jsonp&b=${minLon},${minLat},${maxLon},${maxLat}&l=${level}&c=000000`;
        Utils.jsonp(url, callback);
    }
}

export default SearchService;