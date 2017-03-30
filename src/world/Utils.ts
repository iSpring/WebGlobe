import Kernel = require('./Kernel');

type ArrayVoidCallback = (value: any, index: number, arr: Array<any>) => void;
type ArrayBooleanCallback = (value: any, index: number, arr: any[]) => boolean;
type ArrayAnyCallback = (value: any, index: number, arr: any[]) => any;
type TopicCallback = (data:any) => void;

const topic:{[key:string]:TopicCallback[]} = {}; 

class Utils {

    static isNumber(v: any): boolean {
        return typeof v === "number";
    }

    static isInteger(v: any): boolean {
        var isInt = false;
        var isNum = this.isNumber(v);
        if (isNum) {
            var numFloat = parseFloat(v);
            var numInt = parseInt(v);
            if (numFloat === numInt) {
                isInt = true;
            }
            else {
                isInt = false;
            }
        }
        else {
            isInt = false;
        }
        return isInt;
    }

    static isPositive(v: number): boolean {
        return v > 0;
    }

    static isNegative(v: number): boolean {
        return v < 0;
    }

    static isNonNegative(v: number): boolean {
        return v >= 0;
    }

    static isNonPositive(v: number): boolean {
        return v <= 0;
    }

    static isPositiveInteger(v: number): boolean {
        return this.isPositive(v) && this.isInteger(v);
    }

    static isNonNegativeInteger(v: number): boolean {
        return this.isNonNegative(v) && this.isInteger(v);
    }

    static isArray(v: any): boolean {
        return Object.prototype.toString.call(v) === '[object Array]';
    }

    static isFunction(v: any) {
        return typeof v === 'function';
    }

    static forEach(arr: ArrayLike<any>, func: ArrayVoidCallback): void {
        return this.isFunction((<any>arr).forEach) ? (<any>arr).forEach(func) : Array.prototype.forEach.call(arr, func);
    }

    static filter(arr: ArrayLike<any>, func: ArrayBooleanCallback): any[] {
        return this.isFunction((<any>arr).filter) ? (<any>arr).filter(func) : Array.prototype.filter.call(arr, func);
    }

    static map(arr: ArrayLike<any>, func: ArrayAnyCallback): any[] {
        return this.isFunction((<any>arr).map) ? (<any>arr).map(func) : Array.prototype.map.call(arr, func);
    }

    static some(arr: ArrayLike<any>, func: ArrayBooleanCallback): boolean {
        return this.isFunction((<any>arr).some) ? (<any>arr).some(func) : Array.prototype.some.call(arr, func);
    }

    static every(arr: ArrayLike<any>, func: ArrayBooleanCallback): boolean {
        return this.isFunction((<any>arr).every) ? (<any>arr).every(func) : Array.prototype.every.call(arr, func);
    }

    //过滤掉数组中重复的元素
    static filterRepeatArray(arr: Array<any>): any[] {
        var cloneArray = arr.map(function (item: any) {
            return item;
        });
        var simplifyArray: Array<any> = [];
        while (cloneArray.length > 0) {
            var e = cloneArray[0];
            var exist = simplifyArray.some(function (item: any) {
                return e.equals(item);
            });
            if (!exist) {
                simplifyArray.push(e);
            }
            cloneArray.splice(0, 1);
        }
        return simplifyArray;
    }

    static jsonp(url: string, callback: (response: any) => void, callbackParameterName: string = "cb"): () => void {
        var callbackName = `webglobe_callback_` + Math.random().toString().substring(2);
        if (url.indexOf('?') < 0) {
            url += '?';
        } else {
            url += '&';
        }
        url += `${callbackParameterName}=window.${callbackName}`;
        var scriptElement = document.createElement("script");
        scriptElement.setAttribute("src", url);
        scriptElement.setAttribute("async", "true");
        document.body.appendChild(scriptElement);
        var canceled = false;
        (<any>window)[callbackName] = function (response: any) {
            if (!canceled) {
                callback(response);
            }
            delete (<any>window)[callbackName];
            scriptElement.src = "";
            if (scriptElement.parentNode) {
                scriptElement.parentNode.removeChild(scriptElement);
            }
        }
        return function () {
            canceled = true;
        };
    }

    static isMobile(): boolean {
        return !!window.navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini/i);
    }

    static wrapUrlWithProxy(url: string): string{
        if (Kernel.proxy) {
            return Kernel.proxy + "?" + url;
        }
        return url;
    }

    static subscribe(topicName: string, callback: TopicCallback){
        if(!topic[topicName]){
            topic[topicName] = [];
        }
        topic[topicName].push(callback);
    }

    static publish(topicName: string, data?: any){
        var callbacks = topic[topicName];
        if(callbacks && callbacks.length > 0){
            callbacks.forEach(function(callback: TopicCallback){
                callback(data);
            });
        }
    }
};

export = Utils;