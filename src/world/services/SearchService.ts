///<amd-module name="world/services/SearchService" />

import Utils = require("../Utils");

class SearchService{
    constructor(){

    }

    static search(wd: string, level: number, minLon: number, minLat: number, maxLon: number, maxLat: number, callback: (response: any)=>{}, pageCapacity: number = 50, pageIndex: number = 0){
        var url = `//apis.map.qq.com/jsapi?qt=syn&wd=${wd}&pn=${pageIndex}&rn=${pageCapacity}&output=jsonp&b=${minLon},${minLat},${maxLon},${maxLat}&l=${level}&c=000000`;
        Utils.jsonp(url, callback);
    }
}

export = SearchService;