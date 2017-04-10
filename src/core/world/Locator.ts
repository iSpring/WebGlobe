import Utils from './Utils';

//http://lbs.qq.com/tool/component-geolocation.html

export class LocationData{
    module: string;//geolocation
    type: string;//h5,ip
    adcode: string;//110105
    nation: string;//中国
    province: string;//北京市
    city: string;//北京市
    district: string;//朝阳区
    addr: string;//朝阳区崔各庄乡顺白路何各庄村公交站西南
    lat: number;
    lng: number;
    accuracy: number;//25
}

const targetOrigin:string = 'https://apis.map.qq.com';

var iframe = document.createElement("iframe");

class Locator{
    private static init(){
        window.addEventListener('message', function(event){
            var data:LocationData = event.data;
            if(data && data.module === 'geolocation'){
                Utils.publish('location', event.data);
            }
        }, false);
        
        iframe.setAttribute("width", "0");
        iframe.setAttribute("height", "0");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("scrolling", "no");
        iframe.style.display = "none";
        iframe.setAttribute("src", `${targetOrigin}/tools/geolocation?key=YLZBZ-XDPKU-LWMV6-2WNPB-PL5W5-H6BGL&referer=WebGlobe`);
        document.body.appendChild(iframe);
    }

    public static getLocation(){
        iframe.contentWindow.postMessage('getLocation', targetOrigin);
    }

    public static getRobustLocation(){
        iframe.contentWindow.postMessage('getLocation.robust', targetOrigin);
    }

    public static watchPosition(){
        iframe.contentWindow.postMessage('watchPosition', targetOrigin);
    }

    public static clearWatch(){
        iframe.contentWindow.postMessage('clearWatch', targetOrigin);
    }
}

(Locator as any).init();

export default Locator;