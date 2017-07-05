import Extent from './Extent';
import MathUtils from './math/Utils';

export interface Location {
  lon: number;
  lat: number;
  accuracy: number;
  city: ""//北京市
}

type RouteType = "bus" | "snsnav";

//Type: 表示按类型查询，qt=rn
//POI: 表示按兴趣点的名称查询，qt=poi
//Auto: 通过检索poiTypes自动判断类型
type StrictSearchType = 'Type' | 'POI';
export type SearchType = StrictSearchType | 'Auto';

type AnyCallbackType = (v: any) => any;

//http://apis.map.qq.com/jsapi?qt=rn&wd=北京南站&pn=0&rn=10&px=117.200983&py=39.084158&r=3000&output=json

class Service {

  private static jsonp(url: string, callback: (response: any) => void, charset: string = "", callbackParameterName: string = "cb", callbackPrefix: string = "QQ"): () => void {
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

  //--------------------------------------------------location-------------------------------------------------------

  private static cityLocation: Location = null;

  private static location: Location = null;

  private static getCityLocation() {
    const p = new Promise((resolve: AnyCallbackType) => {
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
    return p;
  }

  static getCurrentPosition(highAccuracy: boolean = false) {
    const p = new Promise((resolve: AnyCallbackType) => {
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
    return p;
  }

  //--------------------------------------------------search-------------------------------------------------------
  //http://lbs.qq.com/webservice_v1/guide-appendix.html
  private static poiClasses: any = {
    '美食': [
      '西餐', '烧烤', '火锅', '海鲜', '素食', '清真', '自助餐', '面包甜点', '冷饮店', '小吃快餐', {
        '中餐厅': ['鲁菜', '粤菜', '湘菜', '川菜', '浙江菜', '安徽菜', '东北菜', '北京菜'],
        '日韩菜': ['日本料理', '韩国料理'],
        '东南亚菜': ['泰国菜']
      }, '美食畅饮', '甜点饮品'//美食畅饮,甜点饮品
    ],
    '购物': ['综合商场', '便利店', '超市', '数码家电', '花鸟鱼虫', '家具家居建材', '农贸市场', '小商品市场', '旧货市场', '体育户外', '服饰鞋包', '图书音像', '眼镜店', '母婴儿童', '珠宝饰品', '化妆品', '礼品', '摄影器材', '拍卖典当行', '古玩字画', '自行车专卖', '烟酒专卖', '文化用品'],
    '生活服务': ['旅行社', '报刊亭', '自来水营业厅', '电力营业厅', '摄影冲印', '洗衣店', '招聘求职', '彩票', '中介机构', '宠物服务', '废品收购站', '福利院养老院', '美容美发', {
      '票务代售': ['飞机票代售', '火车票代售', '汽车票代售', '公交及IC卡'],
      '邮局速递': ['邮局', '速递'],
      '通讯服务': ['中国电信营业厅', '中国网通营业厅', '中国移动营业厅', '中国联通营业厅', '中国铁通营业厅'],
      '家政': ['月嫂保姆', '保洁钟点工', '开锁', '送水', '家电维修', '搬家']
    }],
    '娱乐休闲': ['洗浴推拿足疗', 'KTV', '酒吧', '咖啡厅', '夜总会', '电影院', '剧场音乐厅', '度假疗养', '网吧', {
      '户外活动': ['游乐场', '垂钓园', '采摘园'],
      '游戏棋牌': ['游戏厅', '棋牌室']
    }],
    '汽车': ['停车场', '汽车销售', '汽车维修', '汽车养护', '洗车场', {
      '加油站': ['中石化', '中石油', '其它加油加气站'],
      '摩托车': ['摩托车服务相关', '销售', '维修', '其它摩托车']
    }],
    '医疗保健': ['综合医院', '诊所', '急救中心', '药房药店'],
    '酒店宾馆': ['酒店宾馆', '星级酒店', '经济型酒店', '旅馆招待所', '青年旅社', '快捷酒店'],//'快捷酒店'
    '旅游景点': [],
    '文化场馆': ['博物馆', '展览馆', '科技馆', '图书馆', '美术馆', '会展中心'],
    '教育学校': ['大学', '中学', '小学', '幼儿园', '培训', '职业技术学校', '成人教育'],
    '银行金融': ['银行', '自动提款机', '保险公司', '证券公司', 'ATM'],//ATM
    '基础设施': ['其它基础设施',{
      '交通设施': ['公交车站', '地铁站', '火车站', '长途汽车站', '公交线路', '地铁线路'],
      '公共设施': ['公共厕所', '公用电话', '紧急避难场所'],
      '道路附属': ['收费站', '服务区']
    }],
    '房产小区': ['商务楼宇', {
      '住宅区': ['住宅小区', '别墅' ,'宿舍', '社区中心']
    }]
  };

  private static poiTypes: string[] = [];

  private static createPoiTypes(){
    this._createPoiTypes(this.poiClasses, this.poiTypes);
    return this.poiTypes;
  }

  public static _createPoiTypes(obj: any, types: string[]){
    for(let key in obj){
      if(obj.hasOwnProperty(key)){
        types.push(key);
        let values = obj[key];
        if(values && values.length > 0){
          values.forEach((value: any) => {
            if(typeof value === 'string'){
              types.push(value);
            }else if(typeof value === 'object'){
              this._createPoiTypes(value, types);
            }
          });
        }
      }
    }
  }

  private static _getStrictSearchType(keyword: string): StrictSearchType{
    let searchType: StrictSearchType = 'POI';
    for(let i = 0; i < this.poiTypes.length; i++){
      let poiType = this.poiTypes[i];
      if(poiType.indexOf(keyword) >= 0){
        searchType = 'Type';
        return searchType;
      }
      //keyword: 洗浴足疗 => poiType: 洗浴推拿足疗
      //keyword: 公交站 => poiType: 公交车站
      let looselyContain: boolean = true;
      for(let j = 0; j < keyword.length; j++){
        let char = keyword.charAt(j);
        if(poiType.indexOf(char) < 0){
          looselyContain = false;
          break;
        }
      }
      if(looselyContain){
        searchType = 'Type';
        return searchType;
      }
    }
    return searchType;
  }

  private static _getUrlBySearchType(url: string, searchType: StrictSearchType){
    if(searchType === 'Type'){
      url += '&qt=rn';
    }else if(searchType === 'POI'){
      url += '&qt=poi';
    }
    return url;
  }

  //http://lbs.qq.com/javascript_v2/case-run.html#service-searchservice
  static searchByExtent(keyword: string, level: number, { minLon, minLat, maxLon, maxLat }: Extent, pageCapacity: number = 50, pageIndex: number = 0) {
    const p = new Promise((resolve: AnyCallbackType) => {
      const url = `//apis.map.qq.com/jsapi?qt=syn&wd=${keyword}&pn=${pageIndex}&rn=${pageCapacity}&output=jsonp&b=${minLon},${minLat},${maxLon},${maxLat}&l=${level}&c=000000`;
      Service.jsonp(url, function (response: any) {
        resolve(response);
      });
    });
    return p;
  }

  static searchByBuffer(keyword: string, lon: number, lat: number, radius: number, searchType: SearchType = 'Auto', pageCapacity: number = 50, pageIndex: number = 0) {
    if(searchType === 'Auto'){
      searchType = this._getStrictSearchType(keyword);
      return this._rawSearchByBuffer(searchType, keyword, lon, lat, radius, pageCapacity, pageIndex).then((response: any) => {
        let poiCount = 0;
        if(response && response.detail && response.detail.pois && response.detail.pois.length > 0){
          poiCount = response.detail.pois.length;
        }
        if(poiCount === 0){
          if(searchType === 'Type'){
            return this._rawSearchByBuffer('POI', keyword, lon, lat, radius, pageCapacity, pageIndex);
          }else if(searchType === 'POI'){
            return this._rawSearchByBuffer('Type', keyword, lon, lat, radius, pageCapacity, pageIndex);
          }
        }
        return response;
      });
    }else{
      return this._rawSearchByBuffer(searchType, keyword, lon, lat, radius, pageCapacity, pageIndex);
    }
  }

  private static _rawSearchByBuffer(searchType: StrictSearchType, keyword: string, lon: number, lat: number, radius: number, pageCapacity: number = 50, pageIndex: number = 0) {
    const p = new Promise((resolve: AnyCallbackType) => {
      //http://apis.map.qq.com/jsapi?qt=rn&wd=酒店&pn=0&rn=5&px=116.397128&py=39.916527&r=2000&output=jsonp&cb=webglobe_jsonp_1
      //http://apis.map.qq.com/jsapi?qt=poi&wd=杨村一中&pn=0&rn=5&px=116.397128&py=39.916527&r=2000&output=jsonp&cb=webglobe_jsonp_1
      let url = `//apis.map.qq.com/jsapi?wd=${keyword}&pn=${pageIndex}&rn=${pageCapacity}&px=${lon}&py=${lat}&r=${radius}&output=jsonp`;
      url = this._getUrlBySearchType(url, searchType);
      Service.jsonp(url, function (response: any) {
        if(response){
          response.location = [lon, lat];
        }
        resolve(response);
      });
    });
    return p;
  }

  static searchByCity(keyword: string, city: string, searchType: SearchType = 'Auto', pageCapacity: number = 50, pageIndex: number = 0) {
    if(searchType === 'Auto'){
      searchType = this._getStrictSearchType(keyword);
      return this._rawSearchByCity(searchType, keyword, city, pageCapacity, pageIndex).then((response: any) => {
        let poiCount = 0;
        if(response && response.detail && response.detail.pois && response.detail.pois.length > 0){
          poiCount = response.detail.pois.length;
        }
        if(poiCount === 0){
          if(searchType === 'Type'){
            return this._rawSearchByCity('POI', keyword, city, pageCapacity, pageIndex);
          }else if(searchType === 'POI'){
            return this._rawSearchByCity('Type', keyword, city, pageCapacity, pageIndex);
          }
        }
        return response;
      });
    }else{
      return this._rawSearchByCity(searchType, keyword, city, pageCapacity, pageIndex);
    }
  }

  private static _rawSearchByCity(searchType: StrictSearchType, keyword: string, city: string, pageCapacity: number = 50, pageIndex: number = 0) {
    //http://apis.map.qq.com/jsapi?qt=poi&wd=杨村一中&pn=0&rn=5&c=北京&output=json&cb=callbackname
    const p = new Promise((resolve: AnyCallbackType) => {
      let url = `//apis.map.qq.com/jsapi?wd=${keyword}&pn=${pageIndex}&rn=${pageCapacity}&c=${city}&output=jsonp`;
      url = this._getUrlBySearchType(url, searchType);
      Service.jsonp(url, (response: any) => {
        if(response){
          if(this.location){
            response.location = [this.location.lon, this.location.lat];
          }else if(this.cityLocation){
            response.location = [this.cityLocation.lon, this.cityLocation.lat];
          }else{
            response.location = null;
          }
        }
        resolve(response);
      });
    });
    return p;
  }

  static searchNearby(keyword: string, radius: number, searchType: SearchType = 'Auto', highAccuracy: boolean = false, pageCapacity: number = 50, pageIndex: number = 0) {
    return this.getCurrentPosition(highAccuracy).then((location: Location) => {
      return this.searchByBuffer(keyword, location.lon, location.lat, radius, searchType, pageCapacity, pageIndex);
    });
  }

  static searchByCurrentCity(keyword: string, searchType: SearchType = 'Auto', pageCapacity: number = 50, pageIndex: number = 0) {
    return this.getCityLocation().then((cityLocation: Location) => {
      return this.searchByCity(keyword, cityLocation.city, searchType, pageCapacity, pageIndex);
    });
  }

  //--------------------------------------------------routing-------------------------------------------------------

  static routeByDriving(fromLon: number, fromLat: number, toLon: number, toLat: number, key: string, strategy: number = 5) {
    //http://lbs.gaode.com/api/webservice/guide/api/direction/#driving
    //http://restapi.amap.com/v3/direction/driving?origin=117.00216,39.40365&destination=117.01633,39.37265&extensions=all&output=json&key=db146b37ef8d9f34473828f12e1e85ad&strategy=10
    const p = new Promise((resolve: AnyCallbackType, reject: AnyCallbackType) => {
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
    return p;
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
    const p = new Promise((resolve: AnyCallbackType, reject: AnyCallbackType) => {
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
    return p;
  }

  private static _handleBusResult(responseText: string) {
    const response = JSON.parse(responseText);
    if (response.route) {
      response.route.type = 'bus';
      if (response.route.transits && response.route.transits.length > 0) {
        response.route.transits.forEach((transit: any) => {
          let walking_distance:number = 0;
          transit.segments.forEach((segment: any) => {
            if (segment.walking && segment.walking.steps && segment.walking.steps.length > 0) {
              segment.walking.lonlats = [];
              segment.walking.steps.forEach((step: any) => {
                this._parseStepPolyline(step);
                segment.walking.lonlats.push(...step.lonlats);
                if(step.distance){
                  const stepDistance = parseFloat(step.distance);
                  if(!isNaN(stepDistance)){
                    walking_distance += stepDistance;
                  }
                }
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
            if(segment.railway && segment.railway.departure_stop && segment.railway.arrival_stop){
              let location1 = segment.railway.departure_stop.location;
              let location2 = segment.railway.arrival_stop.location;
              segment.railway.lonlats = [];
              if(location1 && location2){
                let splits1 = location1.split(" ");
                let lon1 = parseFloat(splits1[0]);
                let lat1 = parseFloat(splits1[1]);
                let splits2 = location2.split(" ");
                let lon2 = parseFloat(splits2[0]);
                let lat2 = parseFloat(splits2[1]);
                if(!isNaN(lon1) && !isNaN(lat1) && !isNaN(lon2) && !isNaN(lat2)){
                  segment.railway.lonlats = [[lon1, lat1], [lon2, lat2]];
                }
              }
            }
          });
          const originalWalkingDistance = parseFloat(transit.walking_distance);
          if(isNaN(originalWalkingDistance)){
            transit.walking_distance = walking_distance;
          }else{
            transit.walking_distance = originalWalkingDistance;
          }
        });
      }
    }
    return response;
  }

  static routeByWalking(fromLon: number, fromLat: number, toLon: number, toLat: number, key: string) {
    const p = new Promise((resolve: AnyCallbackType, reject: AnyCallbackType) => {
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
    return p;
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
    const p = new Promise((resolve: AnyCallbackType) => {
      Service.jsonp(url, (response: any) => {
        response.result.routes.forEach((route: any) => {
          Service.decodeQQPolyline(route.polyline);
        });
        resolve(response);
      });
    });
    return p;
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
    const p = new Promise((resolve: AnyCallbackType) => {
      Service.jsonp(url, (response: any) => {
        console.log(response);
        resolve(response);
      }, "GBK");
    });
    return p;
  }

};

(Service as any).createPoiTypes();

export default Service;