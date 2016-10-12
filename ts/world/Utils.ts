type ArrayVoidCallbackFunction = (value: any, index: number, arr: Array<any>) => void;
type ArrayBooleanCallbackFunction = (value: any, index: number, arr: any[]) => boolean;
type ArrayAnyCallbackFunction = (value: any, index: number, arr: any[]) => any;

const Utils = {
    GREATER:"GREATER",
    GEQUAL:"GEQUAL",
    LESS:"LESS",
    LEQUAL:"LEQUAL",

    isBool:function(v: any){
        return typeof v == "boolean";
    },

    isNumber:function(v: any){
        return typeof v == "number";
    },

    isInteger:function(v: any){
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

    judgeNumberBoundary:function(num: number, operator: any, boundry: number){
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

    isPositive:function(v: number){
        return this.judgeNumberBoundary(v,this.GREATER,0);
    },

    isNegative:function(v: number){
        return this.judgeNumberBoundary(v,this.LESS,0);
    },

    isNonNegative:function(v: number){
        return this.judgeNumberBoundary(v,this.GEQUAL,0);
    },

    isNonPositive:function(v: number){
        return this.judgeNumberBoundary(v,this.LEQUAL,0);
    },

    isPositiveInteger:function(v: number){
        return this.isPositive(v) && this.isInteger(v);
    },

    isNonNegativeInteger:function(v: number){
        return this.isNonNegative(v) && this.isInteger;
    },

    isString:function(v: any){
        return typeof v === "string";
    },

    isArray:function(v: any){
        return Object.prototype.toString.call(v) === '[object Array]';
    },

    isFunction:function(v: any){
        return typeof v === "function";
    },

    isNull:function(v:any){
        return v === null;
    },

    isUndefined:function(v:any){
        return typeof v === "undefined";
    },

    isNullOrUndefined:function(v:any){
        return this.isNull(v)||this.isUndefined(v);
    },

    isJsonObject:function(v:any){
        return typeof v === "object" && !this.isNull(v) && !this.isArray(v);
    },

    isDom:function(v:any){
        return v instanceof HTMLElement;
    },

    forEach:function(arr: Array<any>, func: ArrayVoidCallbackFunction){
        if(this.isFunction(Array.prototype.forEach)){
            arr.forEach(func);
        }
        else{
            for(var i=0;i<arr.length;i++){
                func(arr[i],i,arr);
            }
        }
    },

    filter:function(arr: Array<any>, func: ArrayBooleanCallbackFunction){
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

    map:function(arr: Array<any>, func: ArrayAnyCallbackFunction){
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

    some:function(arr: Array<any>, func: ArrayBooleanCallbackFunction){
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

    every:function(arr: Array<any>, func: ArrayBooleanCallbackFunction){
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
    filterRepeatArray:function(arr: Array<any>){
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
    }
};

export = Utils;