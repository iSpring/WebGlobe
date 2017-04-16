import Extent from './Extent';

export interface Location {
  lon: number;
  lat: number;
  accuracy: number;
  city: ""//北京市
}

class Service {
  static jsonp(url: string, callback: (response: any) => void, callbackParameterName: string = "cb"): () => void {
    //callback名称要以大写的QQ开头，否则容易挂掉
    var callbackName = `QQ_webglobe_callback_` + Math.random().toString().substring(2);
    if (url.indexOf('?') < 0) {
      url += '?';
    } else {
      url += '&';
    }
    url += `${callbackParameterName}=window.${callbackName}`;
    var scriptElement = document.createElement("script");
    scriptElement.setAttribute("src", url);
    scriptElement.setAttribute("async", "true");
    scriptElement.setAttribute("defer", "true");
    document.body.appendChild(scriptElement);
    var canceled = false;

    function clear() {
      delete (<any>window)[callbackName];
      scriptElement.src = "";
      if (scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
      scriptElement = null;
    }

    (<any>window)[callbackName] = function (response: any) {
      if (!canceled) {
        callback(response);
      }
      clear();
    }

    return function () {
      canceled = true;
      clear();
    };
  }

  private static cityLocation: Location = null;

  private static location: Location = null;

  private static getCityLocation() {
    const promise = new Promise((resolve) => {
      if (this.cityLocation) {
        resolve(this.cityLocation);
      } else {
        const url = "//apis.map.qq.com/jsapi?qt=gc&output=jsonp";
        Service.jsonp(url, (response: any) => {
          console.log(`定位：`, response);
          const detail = response.detail;
          if (response.detail) {
            this.cityLocation = {
              lon: parseFloat(detail.pointx),
              lat: parseFloat(detail.pointy),
              accuracy: Infinity,
              city: detail.cname
            } as Location;
            resolve(this.cityLocation);
          } else {
            resolve(null);
          }
        });
      }
    });
    return promise;
  }

  static getCurrentPosition(highAccuracy: boolean = false) {
    const promise = new Promise((resolve) => {
      this.getCityLocation().then((cityLocation: Location) => {
        if (highAccuracy) {
          navigator.geolocation.getCurrentPosition((response: Position) => {
            const location = {
              lon: response.coords.longitude,
              lat: response.coords.latitude,
              accuracy: response.coords.accuracy,
              city: cityLocation.city
            } as Location;
            this.location = location;
            resolve(this.location);
          }, (err) => {
            console.error(err);
            if(this.location){
              resolve(this.location);
            }else{
              resolve(cityLocation);
            }
          }, {
              enableHighAccuracy: true
          });
        } else {
          if(this.location){
            resolve(this.location);
          }else{
            resolve(cityLocation);
          }
        }
      });
    });
    return promise;
  }

  //http://lbs.qq.com/javascript_v2/case-run.html#service-searchservice
  static searchByExtent(keyword: string, level: number, { minLon, minLat, maxLon, maxLat }: Extent, pageCapacity: number = 50, pageIndex: number = 0) {
    const promise = new Promise((resolve) => {
      const url = `//apis.map.qq.com/jsapi?qt=syn&wd=${keyword}&pn=${pageIndex}&rn=${pageCapacity}&output=jsonp&b=${minLon},${minLat},${maxLon},${maxLat}&l=${level}&c=000000`;
      Service.jsonp(url, function (response: any) {
        resolve(response);
      });
    });
    return promise;
  }

  static searchByBuffer(keyword: string, lon: number, lat: number, radius: number, pageCapacity: number = 50, pageIndex: number = 0) {
    const promise = new Promise((resolve) => {
      //http://apis.map.qq.com/jsapi?qt=rn&wd=酒店&pn=0&rn=5&px=116.397128&py=39.916527&r=2000&output=jsonp&cb=webglobe_jsonp_1
      const url = `//apis.map.qq.com/jsapi?qt=rn&wd=${keyword}&pn=${pageIndex}&rn=${pageCapacity}&px=${lon}&py=${lat}&r=${radius}&output=jsonp`;
      Service.jsonp(url, function (response: any) {
        resolve(response);
      });
    });
    return promise;
  }

  static searchByCity(keyword: string, city: string, pageCapacity: number = 50, pageIndex: number = 0){
    //http://apis.map.qq.com/jsapi?qt=poi&wd=杨村一中&pn=0&rn=5&c=北京&output=json&cb=callbackname
    const promise = new Promise((resolve) => {
      const url = `//apis.map.qq.com/jsapi?qt=poi&wd=${keyword}&pn=${pageIndex}&rn=${pageCapacity}&c=${city}&output=jsonp`;
      Service.jsonp(url, function(response: any){
        resolve(response);
      });
    });
    return promise;
  }

  static searchNearby(keyword: string, radius: number = 1000, highAccuracy: boolean = false, pageCapacity: number = 50, pageIndex: number = 0){
    return this.getCurrentPosition(highAccuracy).then((location: Location) => {
      return this.searchByBuffer(keyword, location.lon, location.lat, radius, pageCapacity, pageIndex);
    });
  }

  static searchByCurrentCity(keyword: string, pageCapacity: number = 50, pageIndex: number = 0){
    return this.getCityLocation().then((cityLocation: Location) => {
      return this.searchByCity(keyword, cityLocation.city, pageCapacity, pageIndex);
    });
  }
};

export default Service;