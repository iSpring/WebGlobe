import Utils from './Utils';
import Extent from './Extent';

export default class Service{
  //http://lbs.qq.com/javascript_v2/case-run.html#service-searchservice
  static searchByExtent(keyword: string, level: number, {minLon, minLat, maxLon, maxLat}: Extent, pageCapacity: number = 50, pageIndex: number = 0) {
    const promise = new Promise(function(resolve){
      const url = `//apis.map.qq.com/jsapi?qt=syn&wd=${keyword}&pn=${pageIndex}&rn=${pageCapacity}&output=jsonp&b=${minLon},${minLat},${maxLon},${maxLat}&l=${level}&c=000000`;
      Utils.jsonp(url, function(response: any){
        resolve(response);
      });
    });
    return promise;
  }

  static searchNearby(keyword: string, lon: number, lat: number, radius: number = 1000, pageCapacity: number = 50, pageIndex: number = 0){
    const promise = new Promise(function(resolve){
      //http://apis.map.qq.com/jsapi?qt=rn&wd=酒店&pn=0&rn=5&px=116.397128&py=39.916527&r=2000&output=jsonp&cb=webglobe_jsonp_1
      const url = `//apis.map.qq.com/jsapi?qt=rn&wd=${keyword}&pn=${pageIndex}&rn=${pageCapacity}&px=${lon}&py=${lat}&r=${radius}&output=jsonp`;
      Utils.jsonp(url, function(response: any){
        resolve(response);
      });
    });
    return promise;
  }

  static route(from:string, to:string){
    
  }
};