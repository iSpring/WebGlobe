import Extent from './Extent';
import MathUtils from './math/Utils';

export interface Location {
  lon: number;
  lat: number;
  accuracy: number;
  city: ""//北京市
}

type RouteType = "bus" | "snsnav";

class Service {
  static jsonp(url: string, callback: (response: any) => void, charset: string = "", callbackParameterName: string = "cb", callbackPrefix: string = "QQ"): () => void {
    //callback名称要以大写的QQ开头，否则容易挂掉
    var callbackName = `${callbackPrefix}_webglobe_callback_` + Math.random().toString().substring(2);
    if (url.indexOf('?') < 0) {
      url += '?';
    } else {
      url += '&';
    }
    url += `${callbackParameterName}=window.${callbackName}`;
    var scriptElement = document.createElement("script");
    scriptElement.setAttribute("src", url);
    if (charset) {
      scriptElement.setAttribute("charset", charset);//UTF-8,GBK
    }
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
            if (this.location) {
              resolve(this.location);
            } else {
              resolve(cityLocation);
            }
          }, {
              enableHighAccuracy: true
            });
        } else {
          if (this.location) {
            resolve(this.location);
          } else {
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

  static searchByCity(keyword: string, city: string, pageCapacity: number = 50, pageIndex: number = 0) {
    //http://apis.map.qq.com/jsapi?qt=poi&wd=杨村一中&pn=0&rn=5&c=北京&output=json&cb=callbackname
    const promise = new Promise((resolve) => {
      const url = `//apis.map.qq.com/jsapi?qt=poi&wd=${keyword}&pn=${pageIndex}&rn=${pageCapacity}&c=${city}&output=jsonp`;
      Service.jsonp(url, function (response: any) {
        resolve(response);
      });
    });
    return promise;
  }

  static searchNearby(keyword: string, radius: number = 1000, highAccuracy: boolean = false, pageCapacity: number = 50, pageIndex: number = 0) {
    return this.getCurrentPosition(highAccuracy).then((location: Location) => {
      return this.searchByBuffer(keyword, location.lon, location.lat, radius, pageCapacity, pageIndex);
    });
  }

  static searchByCurrentCity(keyword: string, pageCapacity: number = 50, pageIndex: number = 0) {
    return this.getCityLocation().then((cityLocation: Location) => {
      return this.searchByCity(keyword, cityLocation.city, pageCapacity, pageIndex);
    });
  }

  static routeByDriving(fromLon: number, fromLat: number, toLon: number, toLat: number, key: string, strategy: number = 5) {
    //http://lbs.gaode.com/api/webservice/guide/api/direction/#driving
    //http://restapi.amap.com/v3/direction/driving?origin=117.00216,39.40365&destination=117.01633,39.37265&extensions=all&output=json&key=db146b37ef8d9f34473828f12e1e85ad&strategy=10
    const promise = new Promise((resolve, reject) => {
      const url = `//restapi.amap.com/v3/direction/driving?origin=${fromLon},${fromLat}&destination=${toLon},${toLat}&extensions=all&output=json&key=${key}&strategy=${strategy}`;
      const xhr = new XMLHttpRequest();
      //IE12+
      // xhr.responseType = 'json';
      xhr.open("GET", url, true);
      xhr.onload = (event: any) => {
        // const response = event.target.response;
        const response = this._handleDrivingResult(event.target.responseText);
        resolve(response);
      };
      xhr.onerror = (err: any) => {
        reject(err);
      };
      xhr.onabort = (err: any) => {
        reject(err);
      };
      xhr.send();
    });
    return promise;
  }

  private static _handleDrivingResult(responseText: string) {
    const response: any = JSON.parse(responseText);
    if (response.route) {
      response.route.type = 'driving';
      if (response.route.paths && response.route.paths.length > 0) {
        response.route.paths.forEach((path: any) => {
          if (path.steps) {
            path.steps.forEach((step: any) => this._parseStepPolyline(step));
          }
        });
      }
    }
    return response;
  }

  static routeByBus(fromLon: number, fromLat: number, toLon: number, toLat: number, startCity: string, endCity: string, key: string, strategy: number = 0) {
    const promise = new Promise((resolve, reject) => {
      //http://restapi.amap.com/v3/direction/transit/integrated?origin=117.00216,39.40365&destination=117.01633,39.37265&city=武清区&cityd=武清区&output=json&key=db146b37ef8d9f34473828f12e1e85ad
      const url = `//restapi.amap.com/v3/direction/transit/integrated?origin=${fromLon},${fromLat}&destination=${toLon},${toLat}&city=${startCity}&cityd=${endCity}&output=json&key=${key}`;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.onload = (event: any) => {
        const response = this._handleBusResult(event.target.responseText);
        resolve(response);
      };
      xhr.onerror = (err: any) => {
        reject(err);
      };
      xhr.onabort = (err: any) => {
        reject(err);
      };
      xhr.send();
    });
    return promise;
  }

  private static _handleBusResult(responseText: string) {
    const response = JSON.parse(responseText);
    if (response.route) {
      response.route.type = 'bus';
      if (response.route.transits && response.route.transits.length > 0) {
        response.route.transits.forEach((transit: any) => {
          transit.segments.forEach((segment: any) => {
            if (segment.walking && segment.walking.steps && segment.walking.steps.length > 0) {
              segment.walking.lonlats = [];
              segment.walking.steps.forEach((step: any) => {
                this._parseStepPolyline(step);
                segment.walking.lonlats.push(...step.lonlats);
              });
              segment.walking.firstLonlat = segment.walking.lonlats[0];
              segment.walking.lastLonlat = segment.walking.lonlats[segment.walking.lonlats.length - 1];
            }
            if (segment.bus && segment.bus.buslines && segment.bus.buslines.length > 0) {
              segment.bus.lonlats = [];
              segment.bus.buslines.forEach((step: any) => {
                this._parseStepPolyline(step);
                segment.bus.lonlats.push(...step.lonlats);
                step.busName = step.name;
                const idx = step.name.indexOf("(");
                if (idx >= 0) {
                  step.busName = step.name.slice(0, idx);
                }
              });
              if (segment.bus.lonlats.length > 0) {
                segment.bus.firstLonlat = segment.bus.lonlats[0];
                segment.bus.lastLonlat = segment.bus.lonlats[segment.bus.lonlats.length - 1];
              }
            }
          });
        });
      }
    }
    return response;
  }

  static routeByWalking(fromLon: number, fromLat: number, toLon: number, toLat: number, key: string) {
    const promise = new Promise((resolve, reject) => {
      //http://restapi.amap.com/v3/direction/walking?origin=116.434307,39.90909&destination=116.434446,39.90816&key=db146b37ef8d9f34473828f12e1e85ad
      const url = `//restapi.amap.com/v3/direction/walking?origin=${fromLon},${fromLat}&destination=${toLon},${toLat}&key=${key}`;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.onload = (event: any) => {
        const response = this._handleWalkingResult(event.target.responseText);
        resolve(response);
      };
      xhr.onerror = (err: any) => {
        reject(err);
      };
      xhr.onabort = (err: any) => {
        reject(err);
      };
      xhr.send();
    });
    return promise;
  }

  private static _handleWalkingResult(responseText: string) {
    const response = JSON.parse(responseText);
    if (response.route) {
      response.route.type = 'walking';
      if (response.route.paths && response.route.paths.length > 0) {
        response.route.paths.forEach((path: any) => {
          if (path && path.steps && path.steps.length > 0) {
            path.steps.forEach((step: any) => {
              this._parseStepPolyline(step);
            });
          }
        });
      }
    }
    return response;
  }

  private static _parseStepPolyline(step: any) {
    //polyline: "117.002052,39.403416;116.998672,39.404453"
    const strLonLats: string[] = step.polyline.split(";");
    const lonlats: number[][] = strLonLats.map((strLonlat: string) => {
      const splits = strLonlat.split(",");
      const lon = parseFloat(splits[0]);
      const lat = parseFloat(splits[1]);
      return [lon, lat];
    });
    step.firstLonlat = lonlats[0];
    step.lastLonlat = lonlats[lonlats.length - 1];
    step.lonlats = lonlats;
  }

  static decodeQQPolyline(polyline: number[]) {
    for (var i = 2; i < polyline.length; i++) {
      polyline[i] = polyline[i - 2] + polyline[i] / 1000000;
    }
    return polyline;
  }

  static qqRouteByDriving(fromLon: number, fromLat: number, toLon: number, toLat: number, key: string, policy?: string) {
    //policy: LEAST_TIME,LEAST_FEE,REAL_TRAFFIC
    //http://apis.map.qq.com/ws/direction/v1/driving/?from=39.915285,116.403857&to=39.915285,116.803857&waypoints=39.111,116.112;39.112,116.113&output=json&callback=cb&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77
    let url = `//apis.map.qq.com/ws/direction/v1/driving/?from=${fromLat},${fromLon}&to=${toLat},${toLon}&output=jsonp&key=${key}`;
    if (policy) {
      url += `&policy=${policy}`;
    }
    const promise = new Promise((resolve) => {
      Service.jsonp(url, (response: any) => {
        response.result.routes.forEach((route: any) => {
          Service.decodeQQPolyline(route.polyline);
        });
        resolve(response);
      });
    });
    return promise;
  }


  static qqRoute(routeType: RouteType, fromLon: number, fromLat: number, toLon: number, toLat: number) {
    //RouteType: bus,snsnav
    //http://lbs.qq.com/guides/direction.html
    //http://lbs.qq.com/javascript_v2/case-run.html#sample-directions-route
    //http://apis.map.qq.com/jsapi?c=北京&qt=snsnav&start=1$$$$12947295.571620844, 4863618.782990928$$&dest=1$$$$12968287.08799973, 4863630.841508553$$&cond=3&key=TKUBZ-D24AF-GJ4JY-JDVM2-IBYKK-KEBCU&mt=2&s=2&fm=0&output=jsonp&pf=jsapi&ref=jsapi&cb=qq.maps._svcb3.driving_service_0
    const fromX: number = MathUtils.degreeLonToWebMercatorX(fromLon, true);
    const fromY: number = MathUtils.degreeLatToWebMercatorY(fromLat, true);
    const toX: number = MathUtils.degreeLonToWebMercatorX(toLon, true);
    const toY: number = MathUtils.degreeLatToWebMercatorY(toLat, true);
    const url = `//apis.map.qq.com/jsapi?qt=${routeType}&start=1$$$$${fromX}, ${fromY}$$&dest=1$$$$${toX}, ${toY}$$&cond=3&mt=2&s=2&fm=0&output=jsonp&pf=jsapi&ref=jsapi`;
    const promise = new Promise((resolve) => {
      Service.jsonp(url, (response: any) => {
        console.log(response);
        resolve(response);
      }, "GBK");
    });
    return promise;
  }

};

export default Service;