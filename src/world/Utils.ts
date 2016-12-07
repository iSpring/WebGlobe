///<amd-module name="world/Utils"/>
type ArrayVoidCallbackFunction = (value: any, index: number, arr: Array<any>) => void;
type ArrayBooleanCallbackFunction = (value: any, index: number, arr: any[]) => boolean;
type ArrayAnyCallbackFunction = (value: any, index: number, arr: any[]) => any;

const Utils = {
    GREATER:"GREATER",
    GEQUAL:"GEQUAL",
    LESS:"LESS",
    LEQUAL:"LEQUAL",

    isBool(v: any): boolean{
        return typeof v == "boolean";
    },

    isNumber(v: any): boolean{
        return typeof v == "number";
    },

    isInteger(v: any): boolean{
        var isInt = false;
        var isNum = this.isNumber(v);
        if(isNum){
            var numFloat = parseFloat(v);
            var numInt = parseInt(v);
            if(numFloat == numInt){
                isInt = true;
            }
            else{
                isInt = false;
            }
        }
        else{
            isInt = false;
        }
        return isInt;
    },

    judgeNumberBoundary(num: number, operator: any, boundry: number): boolean{
        if(operator != this.GREATER && operator != this.GEQUAL && operator != this.LESS && operator != this.LEQUAL){
            throw "operator is invalid";
        }
        var b:boolean;
        if(operator == this.GREATER){
            b = num > boundry;
        }
        else if(operator == this.GEQUAL){
            b = num >= boundry;
        }
        else if(operator == this.LESS){
            b = num < boundry;
        }
        else if(operator == this.LEQUAL){
            b = num <= boundry;
        }
        return b;
    },

    isPositive(v: number): boolean{
        return this.judgeNumberBoundary(v,this.GREATER,0);
    },

    isNegative(v: number): boolean{
        return this.judgeNumberBoundary(v,this.LESS,0);
    },

    isNonNegative(v: number): boolean{
        return this.judgeNumberBoundary(v,this.GEQUAL,0);
    },

    isNonPositive(v: number): boolean{
        return this.judgeNumberBoundary(v,this.LEQUAL,0);
    },

    isPositiveInteger(v: number): boolean{
        return this.isPositive(v) && this.isInteger(v);
    },

    isNonNegativeInteger(v: number): boolean{
        return this.isNonNegative(v) && this.isInteger;
    },

    isString(v: any): boolean{
        return typeof v === "string";
    },

    isArray(v: any): boolean{
        return Object.prototype.toString.call(v) === '[object Array]';
    },

    isFunction(v: any): boolean{
        return typeof v === "function";
    },

    isNull(v:any): boolean{
        return v === null;
    },

    isUndefined(v:any): boolean{
        return typeof v === "undefined";
    },

    isNullOrUndefined(v:any): boolean{
        return this.isNull(v)||this.isUndefined(v);
    },

    isJsonObject(v:any): boolean{
        return typeof v === "object" && !this.isNull(v) && !this.isArray(v);
    },

    isDom(v:any): boolean{
        return v instanceof HTMLElement;
    },

    forEach(arr: Array<any>, func: ArrayVoidCallbackFunction): void{
        if(this.isFunction(Array.prototype.forEach)){
            arr.forEach(func);
        }else{
            for(var i=0;i<arr.length;i++){
                func(arr[i],i,arr);
            }
        }
    },

    filter(arr: Array<any>, func: ArrayBooleanCallbackFunction): any[]{
        var result: Array<any> = [];
        if(this.isFunction(Array.prototype.filter)){
            result = arr.filter(func);
        }
        else{
            for(var i=0;i<arr.length;i++){
                if(func(arr[i],i,arr)){
                    result.push(arr[i]);
                }
            }
        }
        return result;
    },

    map(arr: Array<any>, func: ArrayAnyCallbackFunction): any[]{
        var result:any[] = [];
        if(this.isFunction(Array.prototype.map)){
            result = arr.map(func);
        }
        else{
            for(var i=0;i<arr.length;i++){
                result.push(func(arr[i],i,arr));
            }
        }
        return result;
    },

    some(arr: Array<any>, func: ArrayBooleanCallbackFunction): boolean{
        if(this.isFunction(Array.prototype.some)){
            return arr.some(func);
        }
        else{
            for(var i=0;i<arr.length;i++){
                if(func(arr[i],i,arr)){
                    return true;
                }
            }
            return false;
        }
    },

    every(arr: Array<any>, func: ArrayBooleanCallbackFunction): boolean{
        if(this.isFunction(Array.prototype.every)){
            return arr.every(func);
        }
        else{
            for(var i=0;i<arr.length;i++){
                if(!func(arr[i],i,arr)){
                    return false;
                }
            }
            return true;
        }
    },

    //过滤掉数组中重复的元素
    filterRepeatArray(arr: Array<any>): any[]{
        var cloneArray = this.map(arr,function(item: any){
            return item;
        });
        var simplifyArray: Array<any> = [];
        while(cloneArray.length > 0){
            var e = cloneArray[0];
            var exist = this.some(simplifyArray,function(item: any){
                return e.equals(item);
            });
            if(!exist){
                simplifyArray.push(e);
            }
            cloneArray.splice(0,1);
        }
        return simplifyArray;
    },

    jsonp(url: string, callback: (response: any)=>{}){
        var callbackName = `webglobe_callback_` + Math.random().toString().substring(2);
        url += `&cb=${callbackName}`;        
        var scriptElement = document.createElement("script");
        scriptElement.src = url;
        document.body.appendChild(scriptElement);
        window[callbackName] = function(response: any){
            callback(response);
            document.body.removeChild(scriptElement);
            delete window[callbackName];
        }
    }
};

export = Utils;