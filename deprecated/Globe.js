/*
Author:孙群
Nickname：iSpring
Email：sunqun2011@gmail.com
Version:0.9.1
* */
/////////////////////////////////////////////////////////////////////////////////////
//扩展
Object.prototype.equals = function(o){
    return this == o;
};
/////////////////////////////////////////////////////////////////////////////////////
window.gl = null;
World = {
     gl :  null,
     canvas : null,
     idCounter : 0,//Object3D对象的唯一标识
     renderer:null,
     globe:null,
     BASE_LEVEL:6,//渲染的基准层级
     EARTH_RADIUS:6378137,
     MAX_PROJECTED_COORD:20037508.3427892,
     ELEVATION_LEVEL:7,//开始获取高程数据
     TERRAIN_LEVEL:10,//开始显示三维地形
     TERRAIN_ENABLED: true,//是否启用三维地形
     TERRAIN_PITCH:80//开始显示三维地形的pich
 };
/////////////////////////////////////////////////////////////////////////////////////
//设置枚举
World.Enum = {
    UNKNOWN:"UNKNOWN",
    FULL_IN:"FULL_IN",
    FULL_OUT:"FULL_OUT",
    IN_OUT:"IN_OUT",
    NOKIA_TILED_MAP:"NOKIA_TILED_MAP",
    Google_TILED_MAP:"Google_TILED_MAP",
    OSM_TILED_MAP:"OSM_TILED_MAP",
    BLENDED_TILED_MAP:"BLENDED_TILED_MAP",
    GLOBE_TILE:"GLOBE_TILE",
    TERRAIN_TILE:"TERRAIN_TILE"
};
/////////////////////////////////////////////////////////////////////////////////////
World.Utils = {
    GREATER:"GREATER",
    GEQUAL:"GEQUAL",
    LESS:"LESS",
    LEQUAL:"LEQUAL",

    isBool:function(v){
        return typeof v == "boolean";
    },

    isNumber:function(v){
        return typeof v == "number";
    },

    isInteger:function(v){
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

    judgeNumberBoundary:function(num,operator,boundry){
        if(!this.isNumber(num)){
            throw "num is not number";
        }
        if(operator != this.GREATER && operator != this.GEQUAL && operator != this.LESS && operator != this.LEQUAL){
            throw "operator is invalid";
        }
        if(!this.isNumber(boundry)){
            throw "boundry is not number";
        }
        var b;
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

    isPositive:function(v){
        return this.judgeNumberBoundary(v,this.GREATER,0);
    },

    isNegative:function(v){
        return this.judgeNumberBoundary(v,this.LESS,0);
    },

    isNonNegative:function(v){
        return this.judgeNumberBoundary(v,this.GEQUAL,0);
    },

    isNonPositive:function(v){
        return this.judgeNumberBoundary(v,this.LEQUAL,0);
    },

    isPositiveInteger:function(v){
        return this.isPositive(v) && this.isInteger(v);
    },

    isNonNegativeInteger:function(v){
        return this.isNonNegative(v) && this.isInteger;
    },

    isString:function(v){
        return typeof v == "string";
    },

    isArray:function(v){
        return Object.prototype.toString.call(v) === '[object Array]';
    },

    isFunction:function(v){
        return typeof v == "function";
    },

    isNull:function(v){
        return v === null;
    },

    isUndefined:function(v){
        return typeof v == "undefined";
    },

    isNullOrUndefined:function(v){
        return this.isNull(v)||this.isUndefined(v);
    },

    isJsonObject:function(v){
        return typeof v == "object" && !this.isNull(v) && !this.isArray(v);
    },

    isDom:function(v){
        return v instanceof HTMLElement;
    },

    forEach:function(arr,func){
        if(!(this.isArray(arr))){
            throw "invalid arr";
        }
        if(!(this.isFunction(func))){
            throw "invalid func";
        }
        if(this.isFunction(Array.prototype.forEach)){
            arr.forEach(func);
        }
        else{
            for(var i=0;i<arr.length;i++){
                func(arr[i],i,arr);
            }
        }
    },

    filter:function(arr,func){
        if(!(this.isArray(arr))){
            throw "invalid arr";
        }
        if(!(this.isFunction(func))){
            throw "invalid func";
        }
        var result = [];
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

    map:function(arr,func){
        if(!(this.isArray(arr))){
            throw "invalid arr";
        }
        if(!(this.isFunction(func))){
            throw "invalid func";
        }
        var result = [];
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

    some:function(arr,func){
        if(!(this.isArray(arr))){
            throw "invalid arr";
        }
        if(!(this.isFunction(func))){
            throw "invalid func";
        }
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

    every:function(arr,func){
        if(!(this.isArray(arr))){
            throw "invalid arr";
        }
        if(!(this.isFunction(func))){
            throw "invalid func";
        }
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
    filterRepeatArray:function(arr){
        if(!this.isArray(arr)){
            throw "invalid arr: not Array";
        }
        var cloneArray = this.map(arr,function(item){
            return item;
        });
        var simplifyArray = [];
        while(cloneArray.length > 0){
            var e = cloneArray[0];
            var exist = this.some(simplifyArray,function(item){
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

World.Math = {
    ONE_RADIAN_EQUAL_DEGREE:57.29577951308232,//180/Math.PI
    ONE_DEGREE_EQUAL_RADIAN:0.017453292519943295,//Math.PI/180
    LEFT_TOP:"LEFT_TOP",
    RIGHT_TOP:"RIGHT_TOP",
    LEFT_BOTTOM:"LEFT_BOTTOM",
    RIGHT_BOTTOM:"RIGHT_BOTTOM",
    LEFT:"LEFT",
    RIGHT:"RIGHT",
    TOP:"TOP",
    BOTTOM:"BOTTOM"
};
World.Math.isZero = function(value){
    if(!World.Utils.isNumber(value)){
        throw "invalid value";
    }
    return Math.abs(value) < 0.000001;
};
/**
 * 将其他进制的数字转换为10进制
 * @param numSys 要准换的进制
 * @param strNum 字符串形式的要转换的数据
 * @returns {number} 整数的十进制数据
 */
World.Math.numerationSystemTo10 = function(numSys,strNum){
    if(!World.Utils.isPositiveInteger(numSys)){
        throw "invalid numSys";
    }
    if(!World.Utils.isString(strNum)){
        throw "invalid strNum";
    }
    var sum = 0;
    for(var i=0;i<strNum.length;i++){
        var level = strNum.length-1-i;
        var key = parseInt(strNum[i]);
        sum += key * Math.pow(numSys,level);
    }
    return sum;
};
/**
 * 将10进制的数字转换为其他进制
 * @param numSys 要转换成的进制
 * @param num 要转换的十进制数字
 * @returns {string} 字符串形式的其他进制的数据
 */
World.Math.numerationSystemFrom10 = function(numSys,num){
    if(!World.Utils.isPositiveInteger(numSys)){
        throw "invalid numSys";
    }
    if(!World.Utils.isInteger(num)){
        throw "invalid num";
    }
    var tempResultArray = [];
    var quotient = Math.floor(num/numSys);
    var remainder = num%numSys;
    tempResultArray.push(remainder);
    while(quotient != 0){
        num = quotient;
        quotient = Math.floor(num/numSys);
        remainder = num%numSys;
        tempResultArray.push(remainder);
    }
    tempResultArray.reverse();
    var strResult = tempResultArray.join("");
    return strResult;
};
/**
 * 将数据从一个进制转换到另一个进制，输入和输出都是字符串
 * @param numSysFrom
 * @param numSysTo
 * @param strNumFrom
 * @returns {string}
 */
World.Math.numerationSystemChange = function(numSysFrom,numSysTo,strNumFrom){
    if(!World.Utils.isPositiveInteger(numSysFrom)){
        throw "invalid numSysFrom";
    }
    if(!World.Utils.isPositiveInteger(numSysTo)){
        throw "invalid numSysTo";
    }
    if(!World.Utils.isString(strNumFrom)){
        throw "invalid strNumFrom";
    }
    var temp10 = this.numerationSystemTo10(numSysFrom,strNumFrom);
    var strResult = this.numerationSystemFrom10(numSysTo,temp10);
    return strResult;
};
/**
 * 计算三角形的面积
 */
World.Math.getTriangleArea = function(v1,v2,v3){
    if(!(v1 instanceof World.Vertice)){
        throw "invalid v1";
    }
    if(!(v2 instanceof World.Vertice)){
        throw "invalid v2";
    }
    if(!(v3 instanceof World.Vertice)){
        throw "invalid v3";
    }
    var v1Copy = v1.getCopy();
    var v2Copy = v2.getCopy();
    var v3Copy = v3.getCopy();
    var direction = v3Copy.minus(v2Copy);
    var line = new World.Line(v2Copy,direction);
    var h = this.getLengthFromVerticeToLine(v1Copy,line);
    var w = this.getLengthFromVerticeToVertice(v2Copy,v3Copy);
    var area = 0.5*w*h;
    return area;
};

/**
 * 计算三维空间中两点之间的直线距离
 * @param vertice1
 * @param vertice2
 * @return {Number}
 */
World.Math.getLengthFromVerticeToVertice = function(vertice1,vertice2){
    if(!(vertice1 instanceof World.Vertice)){
        throw "invalid vertice1";
    }
    if(!(vertice2 instanceof World.Vertice)){
        throw "invalid vertice2";
    }
    var vertice1Copy = vertice1.getCopy();
    var vertice2Copy = vertice2.getCopy();
    var length2 = Math.pow(vertice1Copy.x-vertice2Copy.x,2) + Math.pow(vertice1Copy.y-vertice2Copy.y,2) + Math.pow(vertice1Copy.z-vertice2Copy.z,2);
    var length = Math.sqrt(length2);
    return length;
};

/**
 * 已验证正确
 * 获取点到直线的距离
 * @param vertice 直线外一点
 * @param line 直线
 * @return {Number}
 */
World.Math.getLengthFromVerticeToLine = function(vertice,line){
    if(!(vertice instanceof World.Vertice)){
        throw "invalid vertice";
    }
    if(!(line instanceof World.Line)){
        throw "invalid line";
    }
    var verticeCopy = vertice.getCopy();
    var lineCopy = line.getCopy();
    var x0 = verticeCopy.x;
    var y0 = verticeCopy.y;
    var z0 = verticeCopy.z;
    var verticeOnLine = lineCopy.vertice;
    var x1 = verticeOnLine.x;
    var y1 = verticeOnLine.y;
    var z1 = verticeOnLine.z;
    var lineVector = lineCopy.vector;
    lineVector.normalize();
    var a = lineVector.x;
    var b = lineVector.y;
    var c = lineVector.z;
    var A = (y0-y1)*c-b*(z0-z1);
    var B = (z0-z1)*a-c*(x0-x1);
    var C = (x0-x1)*b-a*(y0-y1);
    return Math.sqrt(A*A+B*B+C*C);
};

/**
 * 已验证正确
 * 计算点到平面的距离，平面方程由Ax+By+Cz+D=0决定
 * @param vertice
 * @param plan 平面，包含A、B、C、D四个参数信息
 * @return {Number}
 */
World.Math.getLengthFromVerticeToPlan = function(vertice,plan){
    if(!(vertice instanceof World.Vertice)){
        throw "invalid vertice";
    }
    if(!(plan instanceof World.Plan)){
        throw "invalid plan";
    }
    var verticeCopy = vertice.getCopy();
    var planCopy = plan.getCopy();
    var x = verticeCopy.x;
    var y = verticeCopy.y;
    var z = verticeCopy.z;
    var A = planCopy.A;
    var B = planCopy.B;
    var C = planCopy.C;
    var D = planCopy.D;
    var numerator = Math.abs(A*x+B*y+C*z+D);
    var denominator = Math.sqrt(A*A+B*B+C*C);
    var length = numerator / denominator;
    return length;
};
/**
 * 已验证正确
 * 从vertice向平面plan做垂线，计算垂点坐标
 * @param vertice
 * @param plan
 * @return {World.Vertice}
 */
World.Math.getVerticeVerticalIntersectPointWidthPlan = function(vertice,plan){
    if(!(vertice instanceof World.Vertice)){
        throw "invalid vertice";
    }
    if(!(plan instanceof World.Plan)){
        throw "invalid plan";
    }
    var verticeCopy = vertice.getCopy();
    var planCopy = plan.getCopy();
    var x0 = verticeCopy.x;
    var y0 = verticeCopy.y;
    var z0 = verticeCopy.z;
    var normalVector = new World.Vector(planCopy.A,planCopy.B,planCopy.C);
    normalVector.normalize();
    var a = normalVector.x;
    var b = normalVector.y;
    var c = normalVector.z;
    var d = planCopy.D*a/planCopy.A;
    var k = -(a*x0+b*y0+c*z0+d);
    var x = k*a+x0;
    var y = k*b+y0;
    var z = k*c+z0;
    var intersectVertice = new World.Vertice(x,y,z);
    return intersectVertice;
};

World.Math.getIntersectPointByLineAdPlan = function(line,plan){
    if(!(line instanceof World.Line)){
        throw "invalid line";
    }
    if(!(plan instanceof World.Plan)){
        throw "invalid plan";
    }
    var lineCopy = line.getCopy();
    var planCopy = plan.getCopy();
    lineCopy.vector.normalize();
    var A = planCopy.A;
    var B = planCopy.B;
    var C = planCopy.C;
    var D = planCopy.D;
    var x0 = lineCopy.vertice.x;
    var y0 = lineCopy.vertice.y;
    var z0 = lineCopy.vertice.z;
    var a = lineCopy.vector.x;
    var b = lineCopy.vector.y;
    var c = lineCopy.vector.z;
    var k = -(A*x0+B*y0+C*z0+D)/(A*a+B*b+C*c);
    var x = k*a+x0;
    var y = k*b+y0;
    var z = k*c+z0;
    var intersectVertice = new World.Vertice(x,y,z);
    return intersectVertice;
};

/**
 * 已验证正确
 * 计算某直线与地球的交点，有可能没有交点，有可能有一个交点，也有可能有两个交点
 * @param line 与地球求交的直线
 * @return {Array}
 */
World.Math.getLineIntersectPointWithEarth = function(line){
    if(!(line instanceof World.Line)){
        throw "invalid line";
    }
    var result = [];
    var lineCopy = line.getCopy();
    var vertice = lineCopy.vertice;
    var direction = lineCopy.vector;
    direction.normalize();
    var r = World.EARTH_RADIUS;
    var a = direction.x;
    var b = direction.y;
    var c = direction.z;
    var x0 = vertice.x;
    var y0 = vertice.y;
    var z0 = vertice.z;
    var a2 = a*a;
    var b2 = b*b;
    var c2 = c*c;
    var r2 = r*r;
    var ay0 = a*y0;
    var az0 = a*z0;
    var bx0 = b*x0;
    var bz0 = b*z0;
    var cx0 = c*x0;
    var cy0 = c*y0;
    var deltaA = ay0*bx0 + az0*cx0 + bz0*cy0;
    var deltaB = ay0*ay0+az0*az0+bx0*bx0+bz0*bz0+cx0*cx0+cy0*cy0;
    var deltaC = a2+b2+c2;
    var delta = 8*deltaA-4*deltaB+4*r2*deltaC;
    if(delta < 0){
        result = [];
    }
    else{
        var t = a*x0+b*y0+c*z0;
        var A = a2+b2+c2;
        if(delta == 0){
            var k = - t/A;
            var x = k*a+x0;
            var y = k*b+y0;
            var z = k*c+z0;
            var p = new World.Vertice(x,y,z);
            result.push(p);
        }
        else if(delta > 0){
            var sqrtDelta = Math.sqrt(delta);
            var k1 = (-2*t+sqrtDelta)/(2*A);
            var x1 = k1*a+x0;
            var y1 = k1*b+y0;
            var z1 = k1*c+z0;
            var p1 = new World.Vertice(x1,y1,z1);
            result.push(p1);

            var k2 = (-2*t-sqrtDelta)/(2*A);
            var x2 = k2*a+x0;
            var y2 = k2*b+y0;
            var z2 = k2*c+z0;
            var p2 = new World.Vertice(x2,y2,z2);
            result.push(p2);
        }
    }

    return result;
};
/**
 * 计算过P点且垂直于向量V的平面
 * @param vertice P点
 * @param direction 向量V
 * @return {Object} World.Plan 返回平面表达式中Ax+By+Cz+D=0的A、B、C、D的信息
 */
World.Math.getCrossPlaneByLine = function(vertice,direction){
    if(!(vertice instanceof World.Vertice)){
        throw "invalid vertice";
    }
    if(!(direction instanceof World.Vector)){
        throw "invalid direction";
    }
    var verticeCopy = vertice.getCopy();
    var directionCopy = direction.getCopy();
    directionCopy.normalize();
    var a = directionCopy.x;
    var b = directionCopy.y;
    var c = directionCopy.z;
    var x0 = verticeCopy.x;
    var y0 = verticeCopy.y;
    var z0 = verticeCopy.z;
    var d = -(a*x0+b*y0+c*z0);
    var plan = new World.Plan(a,b,c,d);
    return plan;
};
///////////////////////////////////////////////////////////////////////////////////////////
//点变换: Canvas->NDC
World.Math.convertPointFromCanvasToNDC = function(canvasX,canvasY){
    if(!(World.Utils.isNumber(canvasX))){
        throw "invalid canvasX";
    }
    if(!(World.Utils.isNumber(canvasY))){
        throw "invalid canvasY";
    }
    var ndcX = 2 * canvasX / World.canvas.width - 1;
    var ndcY = 1 - 2 * canvasY / World.canvas.height;
    return [ndcX,ndcY];
};

//点变换: NDC->Canvas
World.Math.convertPointFromNdcToCanvas = function(ndcX,ndcY){
    if(!(World.Utils.isNumber(ndcX))){
        throw "invalid ndcX";
    }
    if(!(World.Utils.isNumber(ndcY))){
        throw "invalid ndcY";
    }
    var canvasX = (1 + ndcX) * World.canvas.width / 2.0;
    var canvasY = (1 - ndcY) * World.canvas.height / 2.0;
    return [canvasX,canvasY];
};

/**
 * 根据层级计算出摄像机应该放置到距离地球表面多远的位置
 * @param level
 * @return {*}
 */
World.Math.getLengthFromCamera2EarthSurface = function(level){
    if(!(World.Utils.isNonNegativeInteger(level))){
        throw "invalid level";
    }
    return 7820683/Math.pow(2,level);
};

/**将经纬度转换为笛卡尔空间直角坐标系中的x、y、z
 * @lon 经度(角度单位)
 * @lat 纬度(角度单位)
 * @r optional 可选的地球半径
 * @p 笛卡尔坐标系中的坐标
 */
World.Math.geographicToCartesianCoord = function(lon,lat,r){
    if(!(World.Utils.isNumber(lon) && lon >= -(180+0.001) && lon <= (180+0.001))){
        throw "invalid lon";
    }
    if(!(World.Utils.isNumber(lat) && lat >= -(90+0.001) && lat <= (90+0.001))){
        throw "invalid lat";
    }
    r = r||World.EARTH_RADIUS;
    var radianLon = this.degreeToRadian(lon);
    var radianLat = this.degreeToRadian(lat);
    var sin1 = Math.sin(radianLon);
    var cos1 = Math.cos(radianLon);
    var sin2 = Math.sin(radianLat);
    var cos2 = Math.cos(radianLat);
    var x = r*sin1*cos2;
    var y = r*sin2;
    var z = r*cos1*cos2;
    return new World.Vertice(x,y,z);
};

/**
 * 将笛卡尔空间直角坐标系中的坐标转换为经纬度，以角度表示
 * @param vertice
 * @return {Array}
 */
World.Math.cartesianCoordToGeographic = function(vertice){
    if(!(vertice instanceof World.Vertice)){
        throw "invalid vertice";
    }
    var verticeCopy = vertice.getCopy();
    var x = verticeCopy.x;
    var y = verticeCopy.y;
    var z = verticeCopy.z;
    var sin2 = y/World.EARTH_RADIUS;
    if(sin2 > 1){
        sin2 = 2;
    }
    else if(sin2 < -1){
        sin2 = -1;
    }
    var radianLat = Math.asin(sin2);
    var cos2 = Math.cos(radianLat);
    var sin1 = x / (World.EARTH_RADIUS * cos2);
    if(sin1 > 1){
        sin1 = 1;
    }
    else if(sin1 < -1){
        sin1 = -1;
    }
    var cos1 = z / (World.EARTH_RADIUS * cos2);
    if(cos1 > 1){
        cos1 = 1;
    }
    else if(cos1 < -1){
        cos1 = -1;
    }
    var radianLog = Math.asin(sin1);
    if(sin1 >= 0){//经度在[0,π]
        if(cos1 >= 0){//经度在[0,π/2]之间
            radianLog = radianLog;
        }
        else{//经度在[π/2，π]之间
            radianLog = Math.PI - radianLog;
        }
    }
    else{//经度在[-π,0]之间
        if(cos1  >= 0){//经度在[-π/2,0]之间
            radianLog = radianLog;
        }
        else{//经度在[-π,-π/2]之间
            radianLog = -radianLog - Math.PI;
        }
    }
    var degreeLat = World.Math.radianToDegree(radianLat);
    var degreeLog = World.Math.radianToDegree(radianLog);
    return [degreeLog,degreeLat];
};
/**
 * 根据tile在父tile中的位置获取该tile的行列号等信息
 * @param parentLevel 父tile的层级
 * @param parentRow 父tile的行号
 * @param parentColumn 父tile的列号
 * @param position tile在父tile中的位置
 * @return {Object}
 */
World.Math.getTileGridByParent = function(parentLevel,parentRow,parentColumn,position){
    if(!World.Utils.isNonNegativeInteger(parentLevel)){
        throw "invalid parentLevel";
    }
    if(!World.Utils.isNonNegativeInteger(parentRow)){
        throw "invalid parentRow";
    }
    if(!World.Utils.isNonNegativeInteger(parentColumn)){
        throw "invalid parentColumn";
    }
    var level = parentLevel + 1;
    var row = -1;
    var column = -1;
    if(position == this.LEFT_TOP){
        row = 2 * parentRow;
        column = 2 * parentColumn;
    }
    else if(position == this.RIGHT_TOP){
        row = 2 * parentRow;
        column = 2 * parentColumn + 1;
    }
    else if(position == this.LEFT_BOTTOM){
        row = 2 * parentRow + 1;
        column = 2 * parentColumn;
    }
    else if(position == this.RIGHT_BOTTOM){
        row = 2 * parentRow + 1;
        column = 2 * parentColumn + 1;
    }
    else{
        throw "invalid position";
    }
    return new World.TileGrid(level,row,column);
};
//返回切片在直接付切片中的位置
World.Math.getTilePositionOfParent = function(level,row,column,/*optional*/ parent){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    if(!World.Utils.isNonNegativeInteger(row)){
        throw "invalid row";
    }
    if(!World.Utils.isNonNegativeInteger(column)){
        throw "invalid column";
    }
    var position = "UNKNOWN";
    parent = parent||this.getTileGridAncestor(level-1,level,row,column);
    var ltTileGrid = this.getTileGridByParent(parent.level,parent.row,parent.column,this.LEFT_TOP);
    if(ltTileGrid.row == row){
        //上面那一行
        if(ltTileGrid.column == column){
            //处于左上角
            position = this.LEFT_TOP;
        }
        else if(ltTileGrid.column+1 == column){
            //处于右上角
            position = this.RIGHT_TOP;
        }
    }
    else if(ltTileGrid.row+1 == row){
        //下面那一行
        if(ltTileGrid.column == column){
            //处于左下角
            position = this.LEFT_BOTTOM;
        }
        else if(ltTileGrid.column+1 == column){
            //处于右下角
            position = this.RIGHT_BOTTOM;
        }
    }
    return position;
};

//获取在某一level周边position的切片
World.Math.getTileGridByBrother = function(brotherLevel,brotherRow,brotherColumn,position,options){
    if(!(World.Utils.isNonNegativeInteger(brotherLevel))){
        throw "invalid brotherLevel";
    }
    if(!(World.Utils.isNonNegativeInteger(brotherRow))){
        throw "invalid brotherRow";
    }
    if(!(World.Utils.isNonNegativeInteger(brotherColumn))){
        throw "invalid brotherColumn";
    }

    options = options||{};
    var result = new World.TileGrid(brotherLevel,brotherRow,brotherColumn);

    //TODO maxSize可优化 该level下row/column的最大数量
    if(position == this.LEFT){
        if(brotherColumn == 0){
            var maxSize = options.maxSize || Math.pow(2,brotherLevel);
            result.column = maxSize - 1;
        }
        else{
            result.column =  brotherColumn - 1;
        }
    }
    else if(position == this.RIGHT){
        var maxSize = options.maxSize || Math.pow(2,brotherLevel);
        if(brotherColumn == maxSize - 1){
            result.column = 0;
        }
        else{
            result.column = brotherColumn + 1;
        }
    }
    else if(position == this.TOP){
        if(brotherRow == 0){
            var maxSize = options.maxSize || Math.pow(2,brotherLevel);
            result.row = maxSize - 1;
        }
        else{
            result.row = brotherRow - 1;
        }
    }
    else if(position == this.BOTTOM){
        var maxSize = options.maxSize || Math.pow(2,brotherLevel);
        if(brotherRow == maxSize - 1){
            result.row = 0;
        }
        else{
            result.row = brotherRow + 1;
        }
    }
    else{
        throw "invalid position";
    }
    return result;
};

/**
 * 获取切片的祖先切片，
 * @param ancestorLevel 祖先切片的level
 * @param level 当前切片level
 * @param row 当前切片row
 * @param column 当前切片column
 * @returns {null}
 */
World.Math.getTileGridAncestor = function(ancestorLevel,level,row,column){
    if(!World.Utils.isNonNegativeInteger(ancestorLevel)){
        throw "invalid ancestorLevel";
    }
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    if(!World.Utils.isNonNegativeInteger(row)){
        throw "invalid row";
    }
    if(!World.Utils.isNonNegativeInteger(column)){
        throw "invalid column";
    }
    var result = null;
    if(ancestorLevel < level){
        var deltaLevel = level - ancestorLevel;
        //ancestor能够包含a*a个当前切片
        var a = Math.pow(2,deltaLevel);
        var ancestorRow = Math.floor(row/a);
        var ancestorColumn = Math.floor(column/a);
        result = new World.TileGrid(ancestorLevel,ancestorRow,ancestorColumn);
    }
    else if(ancestorLevel == level){
        result = new World.TileGrid(level,row,column);
    }
    return result;
};

World.Math.getTileGridByGeo = function(lon,lat,level){
    if(!(World.Utils.isNumber(lon) && lon >= -180 && lon <= 180)){
        throw "invalid lon";
    }
    if(!(World.Utils.isNumber(lat) && lat >= -90 && lat <= 90)){
        throw "invalid lat";
    }
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    var coordWebMercator = this.degreeGeographicToWebMercator(lon,lat);
    var x = coordWebMercator[0];
    var y = coordWebMercator[1];
    var horX = x + World.MAX_PROJECTED_COORD;
    var verY = World.MAX_PROJECTED_COORD - y;
    var size = World.MAX_PROJECTED_COORD / Math.pow(2,level-1);
    var row = Math.floor(verY / size);
    var column = Math.floor(horX / size);
    return new World.TileGrid(level,row,column);
};
/**
 * 角度转弧度
 * @param degree
 * @return {*}
 */
World.Math.degreeToRadian = function(degree){
    if(!(World.Utils.isNumber(degree))){
        throw "invalid degree";
    }
    return degree*this.ONE_DEGREE_EQUAL_RADIAN;
};
/**
 * 弧度转角度
 * @param radian
 * @return {*}
 */
World.Math.radianToDegree = function(radian){
    if(!(World.Utils.isNumber(radian))){
        throw "invalid radian";
    }
    return radian*this.ONE_RADIAN_EQUAL_DEGREE;
};
/**
 * 将投影坐标x转换为以弧度表示的经度
 * @param x 投影坐标x
 * @return {Number} 返回的经度信息以弧度表示
 */
World.Math.webMercatorXToRadianLog = function(x){
    if(!(World.Utils.isNumber(x))){
        throw "invalid x";
    }
    return x / World.EARTH_RADIUS;
};
/**
 * 将投影坐标x转换为以角度表示的经度
 * @param x 投影坐标x
 * @return {*} 返回的经度信息以角度表示
 */
World.Math.webMercatorXToDegreeLog = function(x){
    if(!(World.Utils.isNumber(x))){
        throw "invalid x";
    }
    var radianLog = this.webMercatorXToRadianLog(x);
    return this.radianToDegree(radianLog);
};
/**
 * 将投影坐标y转换为以弧度表示的纬度
 * @param y 投影坐标y
 * @return {Number} 返回的纬度信息以弧度表示
 */
World.Math.webMercatorYToRadianLat = function(y){
    if(!(World.Utils.isNumber(y))){
        throw "invalid y";
    }
    var a = y / World.EARTH_RADIUS;
    var b = Math.pow(Math.E,a);
    var c = Math.atan(b);
    var radianLat = 2*c - Math.PI/2;
    return radianLat;
};
/**
 * 将投影坐标y转换为以角度表示的纬度
 * @param y 投影坐标y
 * @return {*} 返回的纬度信息以角度表示
 */
World.Math.webMercatorYToDegreeLat = function(y){
    if(!(World.Utils.isNumber(y))){
        throw "invalid y";
    }
    var radianLat = this.webMercatorYToRadianLat(y);
    return this.radianToDegree(radianLat);
};
/**
 * 将投影坐标x、y转换成以弧度表示的经纬度
 * @param x 投影坐标x
 * @param y 投影坐标y
 * @return {Array} 返回的经纬度信息以弧度表示
 */
World.Math.webMercatorToRadianGeographic = function(x,y){
    var radianLog = this.webMercatorXToRadianLog(x);
    var radianLat = this.webMercatorYToRadianLat(y);
    return [radianLog,radianLat];
};
/**
 * 将投影坐标x、y转换成以角度表示的经纬度
 * @param x 投影坐标x
 * @param y 投影坐标y
 * @return {Array} 返回的经纬度信息以角度表示
 */
World.Math.webMercatorToDegreeGeographic = function(x,y){
    var degreeLog = this.webMercatorXToDegreeLog(x);
    var degreeLat = this.webMercatorYToDegreeLat(y);
    return [degreeLog,degreeLat];
};
/**
 * 将以弧度表示的经度转换为投影坐标x
 * @param radianLog 以弧度表示的经度
 * @return {*} 投影坐标x
 */
World.Math.radianLogToWebMercatorX = function(radianLog){
    if(!(World.Utils.isNumber(radianLog) && radianLog <= (Math.PI+0.001) && radianLog >= -(Math.PI+0.001))){
        throw "invalid radianLog";
    }
    return World.EARTH_RADIUS * radianLog;
};
/**
 * 将以角度表示的纬度转换为投影坐标y
 * @param degreeLog 以角度表示的经度
 * @return {*} 投影坐标x
 */
World.Math.degreeLogToWebMercatorX = function(degreeLog){
    if(!(World.Utils.isNumber(degreeLog) && degreeLog <= (180+0.001) && degreeLog >= -(180+0.001))){
        throw "invalid degreeLog";
    }
    var radianLog = this.degreeToRadian(degreeLog);
    return this.radianLogToWebMercatorX(radianLog);
};
/**
 * 将以弧度表示的纬度转换为投影坐标y
 * @param radianLat 以弧度表示的纬度
 * @return {Number} 投影坐标y
 */
World.Math.radianLatToWebMercatorY = function(radianLat){
    if(!(World.Utils.isNumber(radianLat) && radianLat <= (Math.PI/2+0.001) && radianLat >= -(Math.PI/2+0.001))){
        throw "invalid radianLat";
    }
    var a = Math.PI/4 + radianLat/2;
    var b = Math.tan(a);
    var c = Math.log(b);
    var y = World.EARTH_RADIUS * c;
    return y;
};
/**
 * 将以角度表示的纬度转换为投影坐标y
 * @param degreeLat 以角度表示的纬度
 * @return {Number} 投影坐标y
 */
World.Math.degreeLatToWebMercatorY = function(degreeLat){
    if(!(World.Utils.isNumber(degreeLat) && degreeLat <= (90+0.001) && degreeLat >= -(90+0.001))){
        throw "invalid degreeLat";
    }
    var radianLat = this.degreeToRadian(degreeLat);
    return this.radianLatToWebMercatorY(radianLat);
};
/**
 * 将以弧度表示的经纬度转换为投影坐标
 * @param radianLog 以弧度表示的经度
 * @param radianLat 以弧度表示的纬度
 * @return {Array}  投影坐标x、y
 */
World.Math.radianGeographicToWebMercator = function(radianLog,radianLat){
    var x = this.radianLogToWebMercatorX(radianLog);
    var y = this.radianLatToWebMercatorY(radianLat);
    return [x,y];
};
/**
 * 将以角度表示的经纬度转换为投影坐标
 * @param degreeLog 以角度表示的经度
 * @param degreeLat 以角度表示的纬度
 * @return {Array}
 */
World.Math.degreeGeographicToWebMercator = function(degreeLog,degreeLat){
    var x = this.degreeLogToWebMercatorX(degreeLog);
    var y = this.degreeLatToWebMercatorY(degreeLat);
    return [x,y];
};
//根据切片的level、row、column计算该切片所覆盖的投影区域的范围
World.Math.getTileWebMercatorEnvelopeByGrid = function(level,row,column){
    if(!(World.Utils.isNonNegativeInteger(level))){
        throw "invalid level";
    }
    if(!(World.Utils.isNonNegativeInteger(row))){
        throw "invalid row";
    }
    if(!(World.Utils.isNonNegativeInteger(column))){
        throw "invalid column";
    }
    var k = World.MAX_PROJECTED_COORD;
    var size = 2*k / Math.pow(2,level);
    var minX = -k + column * size;
    var maxX = minX + size;
    var maxY = k - row * size;
    var minY = maxY - size;
    var Eproj = {
        "minX":minX,
        "minY":minY,
        "maxX":maxX,
        "maxY":maxY
    };
    return Eproj;
};
//根据切片的level、row、column计算该切片所覆盖的经纬度区域的范围,以经纬度表示返回结果
World.Math.getTileGeographicEnvelopByGrid = function(level,row,column){
    if(!(World.Utils.isNonNegativeInteger(level))){
        throw "invalid level";
    }
    if(!(World.Utils.isNonNegativeInteger(row))){
        throw "invalid row";
    }
    if(!(World.Utils.isNonNegativeInteger(column))){
        throw "invalid column";
    }
    var Eproj = this.getTileWebMercatorEnvelopeByGrid(level,row,column);
    var pMin = this.webMercatorToDegreeGeographic(Eproj.minX,Eproj.minY);
    var pMax = this.webMercatorToDegreeGeographic(Eproj.maxX,Eproj.maxY);
    var Egeo = {
        "minLon":pMin[0],
        "minLat":pMin[1],
        "maxLon":pMax[0],
        "maxLat":pMax[1]
    };
    return Egeo;
};
//根据切片的level、row、column计算该切片所覆盖的笛卡尔空间直角坐标系的范围,以x、y、z表示返回结果
World.Math.getTileCartesianEnvelopByGrid = function(level,row,column){
    if(!(World.Utils.isNonNegativeInteger(level))){
        throw "invalid level";
    }
    if(!(World.Utils.isNonNegativeInteger(row))){
        throw "invalid row";
    }
    if(!(World.Utils.isNonNegativeInteger(column))){
        throw "invalid column";
    }
    var Egeo = this.getTileGeographicEnvelopByGrid(level,row,column);
    var minLon = Egeo.minLon;
    var minLat = Egeo.minLat;
    var maxLon = Egeo.maxLon;
    var maxLat = Egeo.maxLat;
    var pLeftBottom = this.geographicToCartesianCoord(minLon,minLat);
    var pLeftTop = this.geographicToCartesianCoord(minLon,maxLat);
    var pRightTop = this.geographicToCartesianCoord(maxLon,maxLat);
    var pRightBottom = this.geographicToCartesianCoord(maxLon,minLat);
    var Ecar = {
        "pLeftBottom":pLeftBottom,
        "pLeftTop":pLeftTop,
        "pRightTop":pRightTop,
        "pRightBottom":pRightBottom,
        "minLon":minLon,
        "minLat":minLat,
        "maxLon":maxLon,
        "maxLat":maxLat
    };
    return Ecar;
};

/**
 * 获取切片的中心点，以经纬度数组形式返回
 * @param level
 * @param row
 * @param column
 * @return {Array}
 */
World.Math.getGeographicTileCenter = function(level,row,column){
    if(!(World.Utils.isNonNegativeInteger(level))){
        throw "invalid level";
    }
    if(!(World.Utils.isNonNegativeInteger(row))){
        throw "invalid row";
    }
    if(!(World.Utils.isNonNegativeInteger(column))){
        throw "invalid column";
    }
    var Egeo = this.getTileGeographicEnvelopByGrid(level,row,column);
    var minLon = Egeo.minLon;
    var minLat = Egeo.minLat;
    var maxLon = Egeo.maxLon;
    var maxLat = Egeo.maxLat;
    var centerLon = (minLon+maxLon)/2;//切片的经度中心
    var centerLat = (minLat+maxLat)/2;//切片的纬度中心
    var lonlatTileCenter = [centerLon,centerLat];
    return lonlatTileCenter;
};

World.Math.getCartesianTileCenter = function(level,row,column){
    if(!(World.Utils.isNonNegativeInteger(level))){
        throw "invalid level";
    }
    if(!(World.Utils.isNonNegativeInteger(row))){
        throw "invalid row";
    }
    if(!(World.Utils.isNonNegativeInteger(column))){
        throw "invalid column";
    }
    var lonLat = this.getGeographicTileCenter(level,row,column);
    var vertice = this.geographicToCartesianCoord(lonLat[0],lonLat[1]);
    return vertice;
};

/**
 * 计算TRIANGLES的平均法向量
 * @param vs 传入的顶点坐标数组 array
 * @param ind 传入的顶点的索引数组 array
 * @return {Array} 返回每个顶点的平均法向量的数组
 */
World.Math.calculateNormals = function(vs, ind){
    if(!World.Utils.isArray(vs)){
        throw "invalid vs";
    }
    if(!World.Utils.isArray(ind)){
        throw "invalid ind";
    }
    var x=0;
    var y=1;
    var z=2;
    var ns = [];
    //对于每个vertex，初始化normal x, normal y, normal z
    for(var i=0;i<vs.length;i=i+3){
        ns[i+x]=0.0;
        ns[i+y]=0.0;
        ns[i+z]=0.0;
    }

    //用三元组vertices计算向量,所以i = i+3,i表示索引
    for(var i=0;i<ind.length;i=i+3){
        var v1 = [];
        var v2 = [];
        var normal = [];
        //p2 - p1,得到向量Vp1p2
        v1[x] = vs[3*ind[i+2]+x] - vs[3*ind[i+1]+x];
        v1[y] = vs[3*ind[i+2]+y] - vs[3*ind[i+1]+y];
        v1[z] = vs[3*ind[i+2]+z] - vs[3*ind[i+1]+z];
        //p0 - p1,得到向量Vp0p1
        v2[x] = vs[3*ind[i]+x] - vs[3*ind[i+1]+x];
        v2[y] = vs[3*ind[i]+y] - vs[3*ind[i+1]+y];
        v2[z] = vs[3*ind[i]+z] - vs[3*ind[i+1]+z];
        //两个向量叉乘得到三角形的法线向量，注意三角形的正向都是逆时针方向，此处要注意两个向量相乘的顺序，要保证法线向量是从背面指向正面的
        normal[x] = v1[y]*v2[z] - v1[z]*v2[y];
        normal[y] = v1[z]*v2[x] - v1[x]*v2[z];
        normal[z] = v1[x]*v2[y] - v1[y]*v2[x];
        //更新三角形的法线向量：向量的和
        for(var j=0;j<3;j++){
            ns[3*ind[i+j]+x] =  ns[3*ind[i+j]+x] + normal[x];
            ns[3*ind[i+j]+y] =  ns[3*ind[i+j]+y] + normal[y];
            ns[3*ind[i+j]+z] =  ns[3*ind[i+j]+z] + normal[z];
        }
    }
    //对法线向量进行归一化
    for(var i=0;i<vs.length;i=i+3){
        var nn=[];
        nn[x] = ns[i+x];
        nn[y] = ns[i+y];
        nn[z] = ns[i+z];

        var len = Math.sqrt((nn[x]*nn[x])+(nn[y]*nn[y])+(nn[z]*nn[z]));
        if (len == 0) len = 1.0;

        nn[x] = nn[x]/len;
        nn[y] = nn[y]/len;
        nn[z] = nn[z]/len;

        ns[i+x] = nn[x];
        ns[i+y] = nn[y];
        ns[i+z] = nn[z];
    }

    return ns;
};
/////////////////////////////////////////////////////////////////////////////////////
window.requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame
    || window.oRequestAnimationFrame
    || function(callback) {
    setTimeout(callback, 1000 / 60);
};
/////////////////////////////////////////////////////////////////////////////////////
World.Vertice = function(x,y,z){
    x = x != undefined ? x : 0;
    y = y != undefined ? y : 0;
    z = z != undefined ? z : 0;
    if(!World.Utils.isNumber(x)){
        throw "invalid x";
    }
    if(!World.Utils.isNumber(y)){
        throw "invalid y";
    }
    if(!World.Utils.isNumber(z)){
        throw "invalid z";
    }
    this.x = x;
    this.y = y;
    this.z = z;
};

World.Vertice.prototype = {
    constructor:World.Vertice,

    minus:function(otherVertice){
        if(!(otherVertice instanceof World.Vertice)){
            throw "invalid otherVertice";
        }
        var x = this.x - otherVertice.x;
        var y = this.y - otherVertice.y;
        var z = this.z - otherVertice.z;
        return new World.Vector(x,y,z);
    },

    plus:function(otherVector){
        if(!(otherVector instanceof World.Vector)){
            throw "invalid otherVector";
        }
        var x = this.x + otherVector.x;
        var y = this.y + otherVector.y;
        var z = this.z + otherVector.z;
        return new World.Vertice(x,y,z);
    },

    getVector:function(){
        return new World.Vector(this.x,this.y,this.z);
    },

    getArray:function(){
        return [this.x,this.y,this.z];
    },

    getCopy:function(){
        return new World.Vertice(this.x,this.y,this.z);
    },

    getOpposite:function(){
        return new World.Vertice(-this.x,-this.y,-this.z);
    }
};

//////////////////////////////////////////////////////////////////////////////////////
World.Vector = function(x,y,z){
    x = x != undefined ? x : 0;
    y = y != undefined ? y : 0;
    z = z != undefined ? z : 0;
    if(!World.Utils.isNumber(x)){
        throw "invalid x";
    }
    if(!World.Utils.isNumber(y)){
        throw "invalid y";
    }
    if(!World.Utils.isNumber(z)){
        throw "invalid z";
    }
    this.x = x;
    this.y = y;
    this.z = z;
};

World.Vector.prototype = {
    constructor:World.Vector,

    getVertice:function(){
        return new World.Vertice(this.x,this.y,this.z);
    },

    getArray:function(){
        return [this.x,this.y,this.z];
    },

    getCopy:function(){
        return new World.Vector(this.x,this.y,this.z);
    },

    getOpposite:function(){
        return new World.Vector(-this.x,-this.y,-this.z);
    },

    getLength:function(){
        return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
    },

    normalize:function(){
        var length = this.getLength();
        if(!World.Math.isZero(length)){
            this.x /= length;
            this.y /= length;
            this.z /= length;
        }
        else{
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }

        return this;
    },

    setLength:function(length){
        if(!World.Utils.isNumber(length)){
            throw "invalid length";
        }
        this.normalize();
        this.x *= length;
        this.y *= length;
        this.z *= length;
        return this;
    },

    /**
     * 得到该向量的一个随机垂直向量
     * @return {*}
     */
    getRandomVerticalVector:function(){
        var result;
        var length = this.getLength();
        if(length == 0){
            result = new World.Vector(0,0,0);
        }
        else{
            var x2, y2, z2;
            if(this.x !=0 ){
                y2 = 1;
                z2 = 0;
                x2 = - this.y/this.x;
            }
            else if(this.y != 0){
                z2 = 1;
                x2 = 0;
                y2 = - this.z/this.y;
            }
            else if(this.z != 0){
                x2 = 1;
                y2 = 0;
                z2 = - this.x/this.z;
            }
            result = new World.Vector(x2,y2,z2);
            result.normalize();
        }
        return result;
    },

    /**
     * 计算与另一个向量的叉乘
     * @param other
     * @return {World.Vector}
     */
    cross:function(other){
        if(!(other instanceof World.Vector)){
            throw "invalid other";
        }
        var x = this.y * other.z - this.z * other.y;
        var y = this.z * other.x - this.x * other.z;
        var z = this.x * other.y - this.y * other.x;
        return new World.Vector(x,y,z);
    },

    /**
     * 计算与另一个向量的点乘
     * @param other 另一个向量
     * @return {*} 数字
     */
    dot:function(other){
        if(!(other instanceof World.Vector)){
            throw "invalid other";
        }
        return this.x*other.x+this.y*other.y+this.z*other.z;
    },

    /**
     * 得到某点绕该向量旋转radian弧度后的新点
     * @param vertice 初始点
     * @param radian 旋转的角度
     * @return {World.Vertice} 被旋转之后的点
     */
    rotateVertice:function(vertice,radian){
        if(!(vertice instanceof World.Vertice)){
            throw "invalid vertice";
        }
        if(!World.Utils.isNumber(radian)){
            throw "invalid radian";
        }
        var mat = new World.Matrix();
        mat.worldRotateByVector(radian,this);
        var point = [vertice.x,vertice.y,vertice.z,1];
        var newPoint = mat.multiplyColumn(point);
        var newVertice = new World.Vertice(newPoint[0],newPoint[1],newPoint[2]);
        return newVertice;
    },

    /**
     * 得到other向量绕该向量旋转radian弧度后的新向量
     * @param other 初始向量
     * @param radian 旋转的角度
     * @return {World.Vector} 被旋转之后的向量
     */
    rotateVector:function(otherVector,radian){
        if(!(otherVector instanceof World.Vector)){
            throw "invalid otherVector";
        }
        if(!World.Utils.isNumber(radian)){
            throw "invalid radian";
        }
        var vertice = otherVector.getVertice();
        var newVertice = this.rotateVertice(vertice,radian);
        var newVector = newVertice.getVector();
        return newVector;
    }
};
//////////////////////////////////////////////////////////////////////////////////////
/**
 * 射线
 * @param position 射线起点 World.Vertice类型
 * @param direction 射线方向 World.Vector类型
 * @constructor
 */
World.Ray = function(position,direction){
    if(!(position instanceof World.Vertice)){
        throw "invalid position";
    }
    if(!(direction instanceof World.Vector)){
        throw "invalid direction";
    }
    this.vertice = position.getCopy();
    this.vector = direction.getCopy();
    this.vector.normalize();
};
World.Ray.prototype.constructor = World.Ray;
World.Ray.prototype.setVertice = function(position){
    if(!(position instanceof World.Vertice)){
        throw "invalid position";
    }
    this.vertice = position.getCopy();
    return this;
};
World.Ray.prototype.setVector = function(direction){
    if(!(direction instanceof World.Vector)){
        throw "invalid direction";
    }
    this.vector = direction.getCopy();
    this.vector.normalize();
    return this;
};
World.Ray.prototype.getCopy = function(){
    var rayCopy = new World.Ray(this.vertice,this.vector);
    return rayCopy;
};
World.Ray.prototype.rotateVertice = function(vertice){
    ;
};
//////////////////////////////////////////////////////////////////////////////////////
/**
 * 直线
 * @param position 直线上一点
 * @param direction 直线方向
 * @constructor
 */
World.Line = function(position,direction){
    if(!(position instanceof World.Vertice)){
        throw "invalid position";
    }
    if(!(direction instanceof World.Vector)){
        throw "invalid direction";
    }
    this.vertice = position.getCopy();
    this.vector = direction.getCopy();
    this.vector.normalize();
};
World.Line.prototype.constructor = World.Line;
World.Line.prototype.setVertice = function(position){
    if(!(position instanceof World.Vertice)){
        throw "invalid position";
    }
    this.vertice = position.getCopy();
    return this;
};
World.Line.prototype.setVector = function(direction){
    if(!(direction instanceof World.Vector)){
        throw "invalid direction";
    }
    this.vector = direction.getCopy();
    this.vector.normalize();
    return this;
};
World.Line.prototype.getCopy = function(){
    var lineCopy = new World.Line(this.vertice,this.vector);
    return lineCopy;
};
//////////////////////////////////////////////////////////////////////////////////////
/**
 * 三维空间中的平面,其法向量为(A,B,C)
 * @param A
 * @param B
 * @param C
 * @param D
 * @return {Object}
 * @constructor
 */
World.Plan = function(A,B,C,D){
    if(!World.Utils.isNumber(A)){
        throw "invalid A";
    }
    if(!World.Utils.isNumber(B)){
        throw "invalid B";
    }
    if(!World.Utils.isNumber(C)){
        throw "invalid C";
    }
    if(!World.Utils.isNumber(D)){
        throw "invalid D";
    }
    this.A = A;
    this.B = B;
    this.C = C;
    this.D = D;
};
World.Plan.prototype.constructor = World.Plan;
World.Plan.prototype.getCopy = function(){
    var planCopy = new World.Plan(this.A,this.B,this.C,this.D);
    return planCopy;
};
//////////////////////////////////////////////////////////////////////////////////////
World.Matrix = function(m11,m12,m13,m14,m21,m22,m23,m24,m31,m32,m33,m34,m41,m42,m43,m44){
    this.elements = new Float32Array(16);

    this.setElements(
        (m11== undefined ?1:m11),(m12== undefined ?0:m12),(m13== undefined ?0:m13),(m14== undefined ?0:m14),
        (m21== undefined ?0:m21),(m22== undefined ?1:m22),(m23== undefined ?0:m23),(m24== undefined ?0:m24),
        (m31== undefined ?0:m31),(m32== undefined ?0:m32),(m33== undefined ?1:m33),(m34== undefined ?0:m34),
        (m41== undefined ?0:m41),(m42== undefined ?0:m42),(m43== undefined ?0:m43),(m44== undefined ?1:m44)
    );
};

World.Matrix.prototype = {
    constructor:World.Matrix,

    setElements:function(m11,m12,m13,m14,m21,m22,m23,m24,m31,m32,m33,m34,m41,m42,m43,m44){
        var count = arguments.length;
        if(count < 16){
            throw "invalid arguments:arguments length error";
        }
        for(var i=0;i<count;i++){
            if(!World.Utils.isNumber(arguments[i])){
                throw "invalid arguments["+i+"]";
            }
        }
        var values = this.elements;
        values[0]=m11;values[4]=m12;values[8]=m13;values[12]=m14;
        values[1]=m21;values[5]=m22;values[9]=m23;values[13]=m24;
        values[2]=m31;values[6]=m32;values[10]=m33;values[14]=m34;
        values[3]=m41;values[7]=m42;values[11]=m43;values[15]=m44;
        return this;
    },

    setColumnX:function(x,y,z){
        if(!World.Utils.isNumber(x)){
            throw "invalid x";
        }
        if(!World.Utils.isNumber(y)){
            throw "invalid y";
        }
        if(!World.Utils.isNumber(z)){
            throw "invalid z";
        }
        this.elements[0] = x;
        this.elements[1] = y;
        this.elements[2] = z;
    },

    getColumnX:function(){
        return new World.Vertice(this.elements[0],this.elements[1],this.elements[2]);
    },

    setColumnY:function(x,y,z){
        if(!World.Utils.isNumber(x)){
            throw "invalid x";
        }
        if(!World.Utils.isNumber(y)){
            throw "invalid y";
        }
        if(!World.Utils.isNumber(z)){
            throw "invalid z";
        }
        this.elements[4] = x;
        this.elements[5] = y;
        this.elements[6] = z;
    },

    getColumnY:function(){
        return new World.Vertice(this.elements[4],this.elements[5],this.elements[6]);
    },

    setColumnZ:function(x,y,z){
        if(!World.Utils.isNumber(x)){
            throw "invalid x";
        }
        if(!World.Utils.isNumber(y)){
            throw "invalid y";
        }
        if(!World.Utils.isNumber(z)){
            throw "invalid z";
        }
        this.elements[8] = x;
        this.elements[9] = y;
        this.elements[10] = z;
    },

    getColumnZ:function(){
        return new World.Vertice(this.elements[8],this.elements[9],this.elements[10]);
    },

    setColumnTrans:function(x,y,z){
        if(!World.Utils.isNumber(x)){
            throw "invalid x";
        }
        if(!World.Utils.isNumber(y)){
            throw "invalid y";
        }
        if(!World.Utils.isNumber(z)){
            throw "invalid z";
        }
        this.elements[12] = x;
        this.elements[13] = y;
        this.elements[14] = z;
    },

    getColumnTrans:function(){
        return new World.Vertice(this.elements[12],this.elements[13],this.elements[14]);
    },

    setLastRowDefault:function(){
        this.elements[3]=0;
        this.elements[7]=0;
        this.elements[11]=0;
        this.elements[15]=1;
    },

    //对当前矩阵进行转置，并对当前矩阵产生影响
    transpose:function(){
        var result = this.getTransposeMatrix();
        this.setMatrixByOther(result);
    },

    //返回当前矩阵的转置矩阵,不对当前矩阵产生影响
    getTransposeMatrix:function(){
        var result = new World.Matrix();
        result.elements[0]=this.elements[0];
        result.elements[4]=this.elements[1];
        result.elements[8]=this.elements[2];
        result.elements[12]=this.elements[3];

        result.elements[1]=this.elements[4];
        result.elements[5]=this.elements[5];
        result.elements[9]=this.elements[6];
        result.elements[13]=this.elements[7];

        result.elements[2]=this.elements[8];
        result.elements[6]=this.elements[9];
        result.elements[10]=this.elements[10];
        result.elements[14]=this.elements[11];

        result.elements[3]=this.elements[12];
        result.elements[7]=this.elements[13];
        result.elements[11]=this.elements[14];
        result.elements[15]=this.elements[15];
        return result;
    },

    //对当前矩阵进行取逆操作，并对当前矩阵产生影响
    inverse:function(){
        var result = this.getInverseMatrix();
        this.setMatrixByOther(result);
    },

    //返回当前矩阵的逆矩阵，不对当前矩阵产生影响
    getInverseMatrix:function(){
        var a = this.elements;
        var result = new World.Matrix();
        var b = result.elements;
        var c=a[0],d=a[1],e=a[2],g=a[3],f=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],n=a[10],o=a[11],m=a[12],p=a[13],r=a[14],s=a[15];
        var A=c*h-d*f;
        var B=c*i-e*f;
        var t=c*j-g*f;
        var u=d*i-e*h;
        var v=d*j-g*h;
        var w=e*j-g*i;
        var x=k*p-l*m;
        var y=k*r-n*m;
        var z=k*s-o*m;
        var C=l*r-n*p;
        var D=l*s-o*p;
        var E=n*s-o*r;
        var q=A*E-B*D+t*C+u*z-v*y+w*x;
        if(!q)return null;
        q=1/q;
        b[0]=(h*E-i*D+j*C)*q;
        b[1]=(-d*E+e*D-g*C)*q;
        b[2]=(p*w-r*v+s*u)*q;
        b[3]=(-l*w+n*v-o*u)*q;
        b[4]=(-f*E+i*z-j*y)*q;
        b[5]=(c*E-e*z+g*y)*q;
        b[6]=(-m*w+r*t-s*B)*q;
        b[7]=(k*w-n*t+o*B)*q;
        b[8]=(f*D-h*z+j*x)*q;
        b[9]=(-c*D+d*z-g*x)*q;
        b[10]=(m*v-p*t+s*A)*q;
        b[11]=(-k*v+l*t-o*A)*q;
        b[12]=(-f*C+h*y-i*x)*q;
        b[13]=(c*C-d*y+e*x)*q;
        b[14]=(-m*u+p*B-r*A)*q;
        b[15]=(k*u-l*B+n*A)*q;
        return result;
    },

    setMatrixByOther:function(otherMatrix){
        if(!(otherMatrix instanceof World.Matrix)){
            throw "invalid otherMatrix";
        }
        for(var i=0;i<otherMatrix.elements.length;i++){
            this.elements[i]=otherMatrix.elements[i];
        }
    },

    /**
     * 将矩阵设置为单位阵
     */
    setUnitMatrix:function(){
        this.setElements(1,0,0,0,
                         0,1,0,0,
                         0,0,1,0,
                         0,0,0,1);
    },

    /**
     * 判断矩阵是否为单位阵
     * @returns {boolean}
     */
    isUnitMatrix:function(){
        var values = this.elements;
        for(var i=0;i<values.length;i++){
            if(i%4 == 0){
                if(values[i] != 1){
                    //斜对角线上的值需要为1
                    return false;
                }
            }
            else{
                if(values[i] != 0){
                    //非斜对角线上的值需要为0
                    return false;
                }
            }
        }
        return true;
    },

    copy:function(){
        return new World.Matrix(this.elements[0],this.elements[4],this.elements[8],this.elements[12],
                               this.elements[1],this.elements[5],this.elements[9],this.elements[13],
                               this.elements[2],this.elements[6],this.elements[10],this.elements[14],
                               this.elements[3],this.elements[7],this.elements[11],this.elements[15]);
    },

    multiplyMatrix:function(otherMatrix){
        if(!(otherMatrix instanceof World.Matrix)){
            throw "invalid otherMatrix";
        }
        var values1 = this.elements;
        var values2 = otherMatrix.elements;
        var m11 = values1[0]*values2[0]+values1[4]*values2[1]+values1[8]*values2[2]+values1[12]*values2[3];
        var m12 = values1[0]*values2[4]+values1[4]*values2[5]+values1[8]*values2[6]+values1[12]*values2[7];
        var m13 = values1[0]*values2[8]+values1[4]*values2[9]+values1[8]*values2[10]+values1[12]*values2[11];
        var m14 = values1[0]*values2[12]+values1[4]*values2[13]+values1[8]*values2[14]+values1[12]*values2[15];
        var m21 = values1[1]*values2[0]+values1[5]*values2[1]+values1[9]*values2[2]+values1[13]*values2[3];
        var m22 = values1[1]*values2[4]+values1[5]*values2[5]+values1[9]*values2[6]+values1[13]*values2[7];
        var m23 = values1[1]*values2[8]+values1[5]*values2[9]+values1[9]*values2[10]+values1[13]*values2[11];
        var m24 = values1[1]*values2[12]+values1[5]*values2[13]+values1[9]*values2[14]+values1[13]*values2[15];
        var m31 = values1[2]*values2[0]+values1[6]*values2[1]+values1[10]*values2[2]+values1[14]*values2[3];
        var m32 = values1[2]*values2[4]+values1[6]*values2[5]+values1[10]*values2[6]+values1[14]*values2[7];
        var m33 = values1[2]*values2[8]+values1[6]*values2[9]+values1[10]*values2[10]+values1[14]*values2[11];
        var m34 = values1[2]*values2[12]+values1[6]*values2[13]+values1[10]*values2[14]+values1[14]*values2[15];
        var m41 = values1[3]*values2[0]+values1[7]*values2[1]+values1[11]*values2[2]+values1[15]*values2[3];
        var m42 = values1[3]*values2[4]+values1[7]*values2[5]+values1[11]*values2[6]+values1[15]*values2[7];
        var m43 = values1[3]*values2[8]+values1[7]*values2[9]+values1[11]*values2[10]+values1[15]*values2[11];
        var m44 = values1[3]*values2[12]+values1[7]*values2[13]+values1[11]*values2[14]+values1[15]*values2[15];
        return new World.Matrix(m11,m12,m13,m14,m21,m22,m23,m24,m31,m32,m33,m34,m41,m42,m43,m44);
    },

    /**
     * 计算矩阵与列向量的乘积
     * @param c 四元数组
     * @return {World.Matrix} 列向量，四元数组
     */
    multiplyColumn:function(c){
        var valid = World.Utils.isArray(c) && c.length == 4;
        if(!valid){
            throw "invalid c";
        }
        var values1 = this.elements;
        var values2 = c;
        var m11 = values1[0]*values2[0]+values1[4]*values2[1]+values1[8]*values2[2]+values1[12]*values2[3];
        var m21 = values1[1]*values2[0]+values1[5]*values2[1]+values1[9]*values2[2]+values1[13]*values2[3];
        var m31 = values1[2]*values2[0]+values1[6]*values2[1]+values1[10]*values2[2]+values1[14]*values2[3];
        var m41 = values1[3]*values2[0]+values1[7]*values2[1]+values1[11]*values2[2]+values1[15]*values2[3];
        return [m11,m21,m31,m41];
    },

    divide:function(a){
        if(!World.Utils.isNumber(a)){
            throw "invalid a:a is not number";
        }
        if(a == 0){
            throw "invalid a:a is 0";
        }
        if(a != 0){
            for(var i= 0,length = this.elements.length;i<length;i++){
                this.elements[i] /= a;
            }
        }
    },

    worldTranslate:function(x,y,z){
        if(!World.Utils.isNumber(x)){
            throw "invalid x";
        }
        if(!World.Utils.isNumber(y)){
            throw "invalid y";
        }
        if(!World.Utils.isNumber(z)){
            throw "invalid z";
        }
        this.elements[12] += x;
        this.elements[13] += y;
        this.elements[14] += z;
    },

    localTranslate:function(x,y,z){
        if(!World.Utils.isNumber(x)){
            throw "invalid x";
        }
        if(!World.Utils.isNumber(y)){
            throw "invalid y";
        }
        if(!World.Utils.isNumber(z)){
            throw "invalid z";
        }
        var localColumn = [x,y,z,1];
        var worldColumn = this.multiplyColumn(localColumn);
        var origin = this.getPosition();
        this.worldTranslate(worldColumn[0]-origin.x,worldColumn[1]-origin.y,worldColumn[2]-origin.z);
    },

    worldScale:function(scaleX,scaleY,scaleZ){
        scaleX = (scaleX != undefined) ? scaleX : 1;
        scaleY = (scaleY != undefined) ? scaleY : 1;
        scaleZ = (scaleZ != undefined) ? scaleZ : 1;
        if(!World.Utils.isNumber(scaleX)){
            throw "invalid x";
        }
        if(!World.Utils.isNumber(scaleY)){
            throw "invalid y";
        }
        if(!World.Utils.isNumber(scaleZ)){
            throw "invalid z";
        }
        var m = new World.Matrix(scaleX,0,0,0,
                                 0,scaleY,0,0,
                                 0,0,scaleZ,0,
                                 0,0,0,1);
        var result = m.multiplyMatrix(this);
        this.setMatrixByOther(result);
    },

    localScale:function(scaleX,scaleY,scaleZ){
        var transVertice = this.getColumnTrans();
        this.setColumnTrans(0,0,0);
        this.worldScale(scaleX,scaleY,scaleZ);
        this.setColumnTrans(transVertice.x,transVertice.y,transVertice.z);
    },

    worldRotateX:function(radian){
        if(!World.Utils.isNumber(radian)){
            throw "invalid radian";
        }
        var c = Math.cos(radian);
        var s = Math.sin(radian);
        var m = new World.Matrix(1,0,0,0,
                                 0,c,-s,0,
                                 0,s,c,0,
                                 0,0,0,1);
        var result = m.multiplyMatrix(this);
        this.setMatrixByOther(result);
    },

    worldRotateY:function(radian){
        if(!World.Utils.isNumber(radian)){
            throw "invalid radian:not number";
        }
        var c = Math.cos(radian);
        var s = Math.sin(radian);
        var m = new World.Matrix(c,0,s,0,
                                 0,1,0,0,
                                -s,0,c,0,
                                 0,0,0,1);
        var result = m.multiplyMatrix(this);
        this.setMatrixByOther(result);
    },

    worldRotateZ:function(radian){
        if(!World.Utils.isNumber(radian)){
            throw "invalid radian:not number";
        }
        var c = Math.cos(radian);
        var s = Math.sin(radian);
        var m = new World.Matrix(c,-s,0,0,
                                 s,c,0,0,
                                 0,0,1,0,
                                 0,0,0,1);
        var result = m.multiplyMatrix(this);
        this.setMatrixByOther(result);
    },

    worldRotateByVector:function(radian,vector){
        if(!World.Utils.isNumber(radian)){
            throw "invalid radian:not number";
        }
        if(!(vector instanceof World.Vector)){
            throw "invalid vector:not World.Vector";
        }
        var x = vector.x;
        var y = vector.y;
        var z = vector.z;

        var length, s, c;
        var xx, yy, zz, xy, yz, zx, xs, ys, zs, one_c;

        s = Math.sin(radian);
        c = Math.cos(radian);

        length = Math.sqrt( x*x + y*y + z*z );

        // Rotation matrix is normalized
        x /= length;
        y /= length;
        z /= length;

        xx = x * x;
        yy = y * y;
        zz = z * z;
        xy = x * y;
        yz = y * z;
        zx = z * x;
        xs = x * s;
        ys = y * s;
        zs = z * s;
        one_c = 1.0 - c;

        var m11 = (one_c * xx) + c;//M(0,0)
        var m12 = (one_c * xy) - zs;//M(0,1)
        var m13 = (one_c * zx) + ys;//M(0,2)
        var m14 = 0.0;//M(0,3) 表示平移X

        var m21 = (one_c * xy) + zs;//M(1,0)
        var m22 = (one_c * yy) + c;//M(1,1)
        var m23 = (one_c * yz) - xs;//M(1,2)
        var m24 = 0.0;//M(1,3)  表示平移Y

        var m31 = (one_c * zx) - ys;//M(2,0)
        var m32 = (one_c * yz) + xs;//M(2,1)
        var m33 = (one_c * zz) + c;//M(2,2)
        var m34 = 0.0;//M(2,3)  表示平移Z

        var m41 = 0.0;//M(3,0)
        var m42 = 0.0;//M(3,1)
        var m43 = 0.0;//M(3,2)
        var m44 = 1.0;//M(3,3)

        var mat = new World.Matrix(m11,m12,m13,m14,
                                   m21,m22,m23,m24,
                                   m31,m32,m33,m34,
                                   m41,m42,m43,m44);
        var result = mat.multiplyMatrix(this);
        this.setMatrixByOther(result);
    },

    localRotateX:function(radian){
        if(!World.Utils.isNumber(radian)){
            throw "invalid radian:not number";
        }
        var transVertice = this.getColumnTrans();
        this.setColumnTrans(0,0,0);
        var columnX = this.getColumnX().getVector();
        this.worldRotateByVector(radian,columnX);
        this.setColumnTrans(transVertice.x,transVertice.y,transVertice.z);
    },

    localRotateY:function(radian){
        if(!World.Utils.isNumber(radian)){
            throw "invalid radian:not number";
        }
        var transVertice = this.getColumnTrans();
        this.setColumnTrans(0,0,0);
        var columnY = this.getColumnY().getVector();
        this.worldRotateByVector(radian,columnY);
        this.setColumnTrans(transVertice.x,transVertice.y,transVertice.z);
    },

    localRotateZ:function(radian){
        if(!World.Utils.isNumber(radian)){
            throw "invalid radian:not number";
        }
        var transVertice = this.getColumnTrans();
        this.setColumnTrans(0,0,0);
        var columnZ = this.getColumnZ().getVector();
        this.worldRotateByVector(radian,columnZ);
        this.setColumnTrans(transVertice.x,transVertice.y,transVertice.z);
    },

    //localVector指的是相对于模型坐标系中的向量
    localRotateByVector:function(radian,localVector){
        if(!World.Utils.isNumber(radian)){
            throw "invalid radian: not number";
        }
        if(!(localVector instanceof World.Vector)){
            throw "invalid localVector: not World.Vector";
        }
        var localColumn = localVector.getArray();
        localColumn.push(1);//四元数组
        var worldColumn = this.multiplyColumn(localColumn);//模型坐标转换为世界坐标
        var worldVector = new World.Vector(worldColumn[0],worldColumn[1],worldColumn[2]);

        var transVertice = this.getColumnTrans();
        this.setColumnTrans(0,0,0);
        this.worldRotateByVector(radian,worldVector);
        this.setColumnTrans(transVertice.x,transVertice.y,transVertice.z);
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////
World.TextureMaterial = function(args){
    if(args){
        this.texture = gl.createTexture();
        this.image = null;
        this.loaded = false;
        this.delete = false;
        if(args.image instanceof Image && args.image.width > 0 && args.image.height > 0){
            this.setImage(args.image);
        }
        else if(typeof args.url == "string"){
            this.setImageUrl(args.url);
        }
    }
};

World.TextureMaterial.prototype.setImage = function(image){
    if(image instanceof Image && image.width > 0 && image.height > 0){
        this.image = image;
        this.onLoad();
    }
};
World.TextureMaterial.prototype.setImageUrl = function(url){
    if(!World.Utils.isString(url)){
        throw "invalid url: not string";
    }
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';//很重要，因为图片是跨域获得的，所以一定要加上此句代码
    this.image.onload = this.onLoad.bind(this);
    this.image.src = url;
};
//图片加载完成时触发
World.TextureMaterial.prototype.onLoad = function(){
    //要考虑纹理已经被移除掉了图片才进入onLoad这种情况
    if(this.delete){
        return;
    }

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //使用MipMap
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,gl.LINEAR);//LINEAR_MIPMAP_NEAREST LINEAR_MIPMAP_LINEAR
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.loaded = true;
};
//释放显卡中的texture资源
World.TextureMaterial.prototype.releaseTexture = function(){
    if(gl.isTexture(this.texture)){
        gl.deleteTexture(this.texture);
        this.delete = true;
    }
};
/////////////////////////////////////////////////////////////////////////////////////
//TileMaterial继承自TextureMaterial
World.TileMaterial = function(args){
    if(args){
        if(!args.image && typeof args.url == "string"){
            var tileImage = World.Image.get(args.url);
            if(tileImage){
                args.image = tileImage;
                delete args.url;
            }
        }
        this.level = typeof args.level == "number" && args.level >= 0 ? args.level : 20;
        World.TextureMaterial.apply(this,arguments);
    }
};
World.TileMaterial.prototype = new World.TextureMaterial();
World.TileMaterial.prototype.constructor = World.TileMaterial;
World.TileMaterial.prototype.onLoad = function(event){
    if(this.level <= World.Image.MAX_LEVEL){
        World.Image.add(this.image.src,this.image);
    }
    World.TextureMaterial.prototype.onLoad.apply(this,arguments);
};
/////////////////////////////////////////////////////////////////////////////////////
/**
 * 三维对象的基类
 * @param args
 * @constructor
 */
World.Object3D = function(args){
    this.id = ++World.idCounter;
    this.matrix = new World.Matrix();
    this.parent = null;
    this.vertices = [];
    this.vertexBuffer = null;
    this.indices = [];
    this.indexBuffer = null;
    this.textureCoords = [];
    this.textureCoordBuffer = null;
    this.material = null;
    this.visible = true;
    if(args && args.material){
        this.material = args.material;
    }
    this.createVerticeData(args);
};
World.Object3D.prototype = {
    constructor:World.Object3D,

    /**
     * 根据传入的参数生成vertices和indices，然后通过调用setBuffers初始化buffer
     * @param params 传入的参数
     */
    createVerticeData:function(params){
        /*var infos = {
            vertices:vertices,
            indices:indices
        };
        this.setBuffers(infos);*/
    },

    /**
     * 设置buffer，由createVerticeData函数调用
     * @param infos 包含vertices和indices信息，由createVerticeData传入参数
     */
    setBuffers:function(infos){
        if(infos){
            this.vertices = infos.vertices||[];
            this.indices = infos.indices||[];
            this.textureCoords = infos.textureCoords||[];
            if(this.vertices.length > 0 && this.indices.length >  0){
                if(!(gl.isBuffer(this.vertexBuffer))){
                    this.vertexBuffer = gl.createBuffer();
                }
                gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.vertices),gl.STATIC_DRAW);

                if(!(gl.isBuffer(this.indexBuffer))){
                    this.indexBuffer = gl.createBuffer();
                }
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.indices),gl.STATIC_DRAW);
            }

            //使用纹理
            if(this.material instanceof World.TextureMaterial){
                if(this.textureCoords.length > 0){//提供了纹理坐标
                    if(!(gl.isBuffer(this.textureCoordBuffer))){
                        this.textureCoordBuffer = gl.createBuffer();
                    }
                    gl.bindBuffer(gl.ARRAY_BUFFER,this.textureCoordBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.textureCoords),gl.STATIC_DRAW);
                }
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    },

    setShaderMatrix:function(camera){
        if(!(camera instanceof World.PerspectiveCamera)){
            throw "invalid camera : not World.PerspectiveCamera";
        }
        camera.viewMatrix = (camera.viewMatrix instanceof World.Matrix) ? camera.viewMatrix : camera.getViewMatrix();
        var mvMatrix = camera.viewMatrix.multiplyMatrix(this.matrix);
        gl.uniformMatrix4fv(gl.shaderProgram.uMVMatrix,false,mvMatrix.elements);
        gl.uniformMatrix4fv(gl.shaderProgram.uPMatrix,false,camera.projMatrix.elements);
    },

    draw:function(camera){
        if(!(camera instanceof World.PerspectiveCamera)){
            throw "invalid camera : not World.PerspectiveCamera";
        }
        if(this.visible){
            if(this.material instanceof World.TextureMaterial && this.material.loaded){
                gl.enableVertexAttribArray(gl.shaderProgram.aTextureCoord);
                gl.bindBuffer(gl.ARRAY_BUFFER,this.textureCoordBuffer);
                gl.vertexAttribPointer(gl.shaderProgram.aTextureCoord,2,gl.FLOAT,false,0,0);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D,this.material.texture);
                gl.uniform1i(gl.shaderProgram.uSampler, 0);

                this.setShaderMatrix(camera);

                //往shader中对vertex赋值
                gl.enableVertexAttribArray(gl.shaderProgram.aVertexPosition);
                gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
                gl.vertexAttribPointer(gl.shaderProgram.aVertexPosition,3,gl.FLOAT,false,0,0);

                //设置索引，但不用往shader中赋值
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
                //绘图
                gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT,0);

                gl.bindBuffer(gl.ARRAY_BUFFER,null);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
                gl.bindTexture(gl.TEXTURE_2D,null);
            }
        }
    },

    //释放显存中的buffer资源
    releaseBuffers:function(){
        //释放显卡中的资源
        if(gl.isBuffer(this.vertexBuffer)){
            gl.deleteBuffer(this.vertexBuffer);
        }
        if(gl.isBuffer(this.indexBuffer)){
            gl.deleteBuffer(this.indexBuffer);
        }
        if(gl.isBuffer(this.textureCoordBuffer)){
            gl.deleteBuffer(this.textureCoordBuffer);
        }
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.textureCoordBuffer = null;
    },

    destroy:function(){
        this.parent = null;
        this.releaseBuffers();
        if(this.material instanceof World.TextureMaterial){
            this.material.releaseTexture();
            this.material = null;
        }
    },

    //需要子类重写
    getPosition:function(){
        var position = this.matrix.getColumnTrans();
        return position;
    },

    //需要子类重写
    setPosition:function(x,y,z){
        this.matrix.setColumnTrans(x,y,z);
    },

    worldTranslate:function(x,y,z){
        this.matrix.worldTranslate(x,y,z);
    },

    localTranslate:function(x,y,z){
        this.matrix.localTranslate(x,y,z);
    },

    worldScale:function(scaleX,scaleY,scaleZ){
        this.matrix.worldScale(scaleX,scaleY,scaleZ);
    },

    localScale:function(scaleX,scaleY,scaleZ){
        this.matrix.localScale(scaleX,scaleY,scaleZ);
    },

    worldRotateX:function(radian){
        this.matrix.worldRotateX(radian);
    },

    worldRotateY:function(radian){
        this.matrix.worldRotateY(radian);
    },

    worldRotateZ:function(radian){
        this.matrix.worldRotateZ(radian);
    },

    worldRotateByVector:function(radian,vector){
        this.matrix.worldRotateByVector(radian,vector);
    },

    localRotateX:function(radian){
        this.matrix.localRotateX(radian);
    },

    localRotateY:function(radian){
        this.matrix.localRotateY(radian);
    },

    localRotateZ:function(radian){
        this.matrix.localRotateZ(radian);
    },

    //localVector指的是相对于模型坐标系中的向量
    localRotateByVector:function(radian,localVector){
        this.matrix.localRotateByVector(radian,localVector);
    },

    getXAxisDirection:function(){
        var columnX = this.matrix.getColumnX();//World.Vertice
        var directionX = columnX.getVector();//World.Vector
        directionX.normalize();
        return directionX;
    },

    getYAxisDirection:function(){
        var columnY = this.matrix.getColumnY();
        var directionY = columnY.getVector();
        directionY.normalize();
        return directionY;
    },

    getZAxisDirection:function(){
        var columnZ = this.matrix.getColumnZ();
        var directionZ = columnZ.getVector();
        directionZ.normalize();
        return directionZ;
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 三维对象集合
 * @param params
 * @constructor
 */
World.Object3DComponents = function(){
    this.id = ++World.idCounter;
    this.matrix = new World.Matrix();
    this.visible = true;
    this.parent = null;
    this.children = [];
};
World.Object3DComponents.prototype = {
    constructor:World.Object3DComponents,

    add:function(obj){
        if(!(obj instanceof World.Object3D || obj instanceof World.Object3DComponents)){
            throw "invalid obj: not World.Object3D or World.Object3DComponents";
        }

        if(this.findObjById(obj.id) != null){
            console.debug("obj已经存在于Object3DComponents中，无法将其再次加入！");
            return;
        }
        else{
            this.children.push(obj);
            obj.parent = this;
        }
    },

    remove:function(obj){
        if(obj){
            var result = this.findObjById(obj.id);
            if(result == null){
                console.debug("obj不存在于Object3DComponents中，所以无法将其从中删除！");
                return false;
            }
            obj.destroy();
            this.children.splice(result.index,1);
            obj = null;
            return true;
        }
        else{
            return false;
        }
    },

    //销毁所有的子节点
    clear:function(){
        for(var i=0;i<this.children.length;i++){
            var obj = this.children[i];
            obj.destroy();
        }
        this.children = [];
    },

    //销毁自身及其子节点
    destroy:function(){
        this.parent = null;
        this.clear();
    },

    findObjById:function(objId){
        for(var i = 0;i<this.children.length;i++){
            var obj = this.children[i];
            if(obj.id == objId){
                obj.index = i;
                return obj;
            }
        }
        return null;
    },

    draw:function(camera){
        if(!(camera instanceof World.PerspectiveCamera)){
            throw "invalid camera: not World.PerspectiveCamera";
        }

        for(var i=0;i<this.children.length;i++){
            var obj = this.children[i];
            if(obj){
                if(obj.visible){
                    obj.draw(camera);
                }
            }
        }
    },

    worldTranslate:function(x,y,z){
        this.matrix.worldTranslate(x,y,z);
    },

    localTranslate:function(x,y,z){
        this.matrix.localTranslate(x,y,z);
    },

    worldScale:function(scaleX,scaleY,scaleZ){
        this.matrix.worldScale(scaleX,scaleY,scaleZ);
    },

    localScale:function(scaleX,scaleY,scaleZ){
        this.matrix.localScale(scaleX,scaleY,scaleZ);
    },

    worldRotateX:function(radian){
        this.matrix.worldRotateX(radian);
    },

    worldRotateY:function(radian){
        this.matrix.worldRotateY(radian);
    },

    worldRotateZ:function(radian){
        this.matrix.worldRotateZ(radian);
    },

    worldRotateByVector:function(radian,vector){
        this.matrix.worldRotateByVector(radian,vector);
    },

    localRotateX:function(radian){
        this.matrix.localRotateX(radian);
    },

    localRotateY:function(radian){
        this.matrix.localRotateY(radian);
    },

    localRotateZ:function(radian){
        this.matrix.localRotateZ(radian);
    },

    //localVector指的是相对于模型坐标系中的向量
    localRotateByVector:function(radian,localVector){
        this.matrix.localRotateByVector(radian,localVector);
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////
//args中包含level、row、column、url即可
World.Tile = function(args){
    if(args){
        this.subTiledLayer = null;
        //type如果是GLOBE_TILE，表示其buffer已经设置为一般形式
        //type如果是TERRAIN_TILE，表示其buffer已经设置为高程形式
        //type如果是UNKNOWN，表示buffer没设置
        this.type = World.Enum.UNKNOWN;
        this.level = 0;
        this.row = 0;
        this.column = 0;
        this.url = args.url;
        this.elevationLevel = 0;//高程level
        this.minLon = null;
        this.minLat = null;
        this.maxLon = null;
        this.maxLat = null;
        this.minX = null;
        this.minY = null;
        this.maxX = null;
        this.maxY = null;
        this.elevationInfo = null;
        World.Object3D.apply(this,arguments);
    }
};
World.Tile.prototype = new World.Object3D();
World.Tile.prototype.constructor = World.Tile;
World.Tile.prototype.createVerticeData = function(args){
    if(!args){
        return;
    }
    this.setTileInfo(args);
    this.checkTerrain();
};

// 根据传入的切片的层级以及行列号信息设置切片的经纬度范围 以及设置其纹理
World.Tile.prototype.setTileInfo = function(args){
    this.level = args.level;
    this.row = args.row;
    this.column = args.column;
    this.elevationLevel = World.Elevation.getAncestorElevationLevel(this.level);
    //经纬度范围
    var Egeo = World.Math.getTileGeographicEnvelopByGrid(this.level,this.row,this.column);
    this.minLon = Egeo.minLon;
    this.minLat = Egeo.minLat;
    this.maxLon = Egeo.maxLon;
    this.maxLat = Egeo.maxLat;
    var minCoord = World.Math.degreeGeographicToWebMercator(this.minLon,this.minLat);
    var maxCoord = World.Math.degreeGeographicToWebMercator(this.maxLon,this.maxLat);
    //投影坐标范围
    this.minX = minCoord[0];
    this.minY = minCoord[1];
    this.maxX = maxCoord[0];
    this.maxY = maxCoord[1];
    var matArgs = {
        level:this.level,
        url:this.url
    };
    this.material = new World.TileMaterial(matArgs);
};

/**
 * 判断是否满足现实Terrain的条件，若满足则转换为三维地形
 * 条件:
 * 1.当前显示的是GlobeTile
 * 2.该切片的level大于TERRAIN_LEVEL
 * 3.pich不为90
 * 4.当前切片的高程数据存在
 * 5.如果bForce为true，则表示强制显示为三维，不考虑level
 */
World.Tile.prototype.checkTerrain = function(bForce){
    var globe = World.globe;
    var a = bForce == true ? true : this.level >= World.TERRAIN_LEVEL;
    var shouldShowTerrain = this.type != World.Enum.TERRAIN_TILE && a && globe && globe.camera && globe.camera.pitch != 90;
    if(shouldShowTerrain){
        //应该以TerrainTile显示
        if(!this.elevationInfo){
            this.elevationInfo = World.Elevation.getExactElevation(this.level,this.row,this.column);

//            if(this.level - this.elevationLevel == 1){
//                //当该level与其elevationLevel只相差一级时，可以使用推倒的高程数据
//                this.elevationInfo = World.Elevation.getElevation(this.level,this.row,this.column);
//                if(this.elevationInfo){
//                    console.log("Tile("+this.level+","+this.row+","+this.column+");sourceLevel:"+this.elevationInfo.sourceLevel+";elevationLevel:"+this.elevationLevel);
//                }
//            }
//            else{
//                //否则使用准确的高程数据
//                this.elevationInfo = World.Elevation.getExactElevation(this.level,this.row,this.column);
//            }
        }
        var canShowTerrain = this.elevationInfo ? true : false;
        if(canShowTerrain){
            //能够显示为TerrainTile
            this.handleTerrainTile();
        }
        else{
            //不能够显示为TerrainTile
            this.visible = false;
            //this.handleGlobeTile();
        }
    }
    else{
        if(this.type == World.Enum.UNKNOWN){
            //初始type为UNKNOWN，还未初始化buffer，应该显示为GlobeTile
            this.handleGlobeTile();
        }
    }
};

//处理球面的切片
World.Tile.prototype.handleGlobeTile = function(){
    this.type = World.Enum.GLOBE_TILE;
    if(this.level < World.BASE_LEVEL){
        var changeLevel = World.BASE_LEVEL - this.level;
        this.segment = Math.pow(2,changeLevel);
    }
    else{
        this.segment = 1;
    }
    this.handleTile();
};
//处理地形的切片
World.Tile.prototype.handleTerrainTile = function(){
    this.type = World.Enum.TERRAIN_TILE;
    this.segment = 10;
    this.handleTile();
};

//如果是GlobeTile，那么elevations为null
//如果是TerrainTile，那么elevations是一个一维数组，大小是(segment+1)*(segment+1)
World.Tile.prototype.handleTile = function(){
    this.visible = true;
    var vertices = [];
    var indices = [];
    var textureCoords = [];

    var deltaX = (this.maxX - this.minX) / this.segment;
    var deltaY = (this.maxY - this.minY) / this.segment;
    var deltaTextureCoord = 1.0 / this.segment;
    var changeElevation = this.type == World.Enum.TERRAIN_TILE && this.elevationInfo;
    //level不同设置的半径也不同
    var levelDeltaR = 0;//this.level * 100;
    //对WebMercator投影进行等间距划分格网
    var mercatorXs = [];//存储从最小的x到最大x的分割值
    var mercatorYs = [];//存储从最大的y到最小的y的分割值
    var textureSs = [];//存储从0到1的s的分割值
    var textureTs = [];//存储从1到0的t的分割值

    for(var i=0;i<=this.segment;i++){
        mercatorXs.push(this.minX + i * deltaX);
        mercatorYs.push(this.maxY - i * deltaY);
        var b = i*deltaTextureCoord;
        textureSs.push(b);
        textureTs.push(1-b);
    }
    //从左上到右下遍历填充vertices和textureCoords:从最上面一行开始自左向右遍历一行，然后再以相同的方式遍历下面一行
    for(var i=0;i<=this.segment;i++){
        for(var j=0;j<=this.segment;j++){
            var merX = mercatorXs[j];
            var merY = mercatorYs[i];
            var ele = changeElevation ? this.elevationInfo.elevations[(this.segment+1)*i+j] : 0;
            var lonlat = World.Math.webMercatorToDegreeGeographic(merX,merY);
            var p = World.Math.geographicToCartesianCoord(lonlat[0],lonlat[1],World.EARTH_RADIUS+ele+levelDeltaR).getArray();
            vertices = vertices.concat(p);//顶点坐标
            textureCoords = textureCoords.concat(textureSs[j],textureTs[i]);//纹理坐标
        }
    }

    //从左上到右下填充indices
    //添加的点的顺序:左上->左下->右下->右上
    //0 1 2; 2 3 0;
    /*对于一个面从外面向里面看的绘制顺序
     * 0      3
     *
     * 1      2*/
    for(var i=0;i<this.segment;i++){
        for(var j=0;j<this.segment;j++){
            var idx0 = (this.segment+1)*i+j;
            var idx1 = (this.segment+1)*(i+1)+j;
            var idx2 = idx1 + 1;
            var idx3 = idx0 + 1;
            indices = indices.concat(idx0,idx1,idx2);// 0 1 2
            indices = indices.concat(idx2,idx3,idx0);// 2 3 0
        }
    }

//    if(changeElevation){
//        //添加坐标原点的数据
//        var originVertice = [0,0,0];
//        var originTexture = [0,0];
//        vertices = vertices.concat(originVertice);
//        textureCoords = textureCoords.concat(originTexture);
//
//        var idxOrigin = (this.segment+1)*(this.segment+1);
//        var idxLeftTop = 0;
//        var idxRightTop = this.segment;
//        var idxRightBottom = (this.segment+1)*(this.segment+1)-1;
//        var idxLeftBottom = idxRightBottom - this.segment;
//        indices = indices.concat(idxLeftTop,idxOrigin,idxLeftBottom);
//        indices = indices.concat(idxRightTop,idxOrigin,idxLeftTop);
//        indices = indices.concat(idxRightBottom,idxOrigin,idxRightTop);
//        indices = indices.concat(idxLeftBottom,idxOrigin,idxRightBottom);
//    }

    var infos = {
        vertices:vertices,
        indices:indices,
        textureCoords:textureCoords
    };
    this.setBuffers(infos);
};
//重写Object3D的destroy方法
World.Tile.prototype.destroy = function(){
    World.Object3D.prototype.destroy.apply(this,arguments);
    this.subTiledLayer = null;
};
//////////////////////////////////////////////////////////////////////////////////
World.TileGrid = function(level,row,column){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    if(!World.Utils.isNonNegativeInteger(row)){
        throw "invalid row";
    }
    if(!World.Utils.isNonNegativeInteger(column)){
        throw "invalid column";
    }
    this.level = level;
    this.row = row;
    this.column = column;
};
World.TileGrid.prototype.equals = function(other){
    return other instanceof World.TileGrid && this.level == other.level && this.row == other.row && this.column == other.column;
};
World.TileGrid.prototype.getLeft = function(){
    return World.Math.getTileGridByBrother(this.level,this.row,this.column,World.Math.LEFT);
};
World.TileGrid.prototype.getRight = function(){
    return World.Math.getTileGridByBrother(this.level,this.row,this.column,World.Math.RIGHT);
};
World.TileGrid.prototype.getTop = function(){
    return World.Math.getTileGridByBrother(this.level,this.row,this.column,World.Math.TOP);
};
World.TileGrid.prototype.getBottom = function(){
    return World.Math.getTileGridByBrother(this.level,this.row,this.column,World.Math.BOTTOM);
};
World.TileGrid.prototype.getParent = function(){
    return World.Math.getTileGridAncestor(this.level-1,this.level,this.row,this.column);
};
World.TileGrid.prototype.getAncestor = function(ancestorLevel){
    return World.Math.getTileGridAncestor(ancestorLevel,this.level,this.row,this.column);
};
//////////////////////////////////////////////////////////////////////////////////
World.SubTiledLayer = function(args){
    World.Object3DComponents.apply(this,arguments);
    this.level = -1;
    //该级要请求的高程数据的层级，7[8,9,10];10[11,12,13];13[14,15,16];16[17,18,19]
    this.elevationLevel = -1;
    this.tiledLayer = null;
    if(args){
        if(args.level != undefined){
            this.level = args.level;
            this.elevationLevel = World.Elevation.getAncestorElevationLevel(this.level);
        }
    }
};
World.SubTiledLayer.prototype = new World.Object3DComponents();
World.SubTiledLayer.prototype.constructor = World.SubTiledLayer;
//重写draw方法
World.SubTiledLayer.prototype.draw = function(camera){
    if(this.level >= World.TERRAIN_LEVEL && World.globe && World.globe.pitch <= World.TERRAIN_PITCH){
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.clearDepth(1);
        gl.enable(gl.DEPTH_TEST);
    }
    else{
        gl.disable(gl.DEPTH_TEST);
    }
    World.Object3DComponents.prototype.draw.apply(this,arguments);
};
//重写Object3DComponents的add方法
World.SubTiledLayer.prototype.add = function(tile){
    if(!(tile instanceof World.Tile)){
        throw "invalid tile: not World.Tile";
    }
    if(tile.level == this.level){
        World.Object3DComponents.prototype.add.apply(this,arguments);
        tile.subTiledLayer = this;
    }
};
//调用其父的getImageUrl
World.SubTiledLayer.prototype.getImageUrl = function(level,row,column){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    if(!World.Utils.isNonNegativeInteger(row)){
        throw "invalid row";
    }
    if(!World.Utils.isNonNegativeInteger(column)){
        throw "invalid column";
    }
    var url = "";
    if(this.tiledLayer){
        url = this.tiledLayer.getImageUrl(level,row,column);
    }
    return url;
};
//重写Object3DComponents的destroy方法
World.SubTiledLayer.prototype.destroy = function(){
    World.Object3DComponents.prototype.destroy.apply(this,arguments);
    this.tiledLayer = null;
};
//根据level、row、column查找tile，可以供调试用
World.SubTiledLayer.prototype.findTile = function(level,row,column){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    if(!World.Utils.isNonNegativeInteger(row)){
        throw "invalid row";
    }
    if(!World.Utils.isNonNegativeInteger(column)){
        throw "invalid column";
    }
    var length = this.children.length;
    for(var i=0;i<length;i++){
        var tile = this.children[i];
        if(tile.level == level && tile.row == row && tile.column == column){
            return tile;
        }
    }
    return null;
};
//根据传入的tiles信息进行更新其children
World.SubTiledLayer.prototype.updateTiles = function(visibleTileGrids,bAddNew){//camera,options
    //var visibleTileGrids = camera.getVisibleTilesByLevel(this.level,options);
    //检查visibleTileGrids中是否存在指定的切片信息
    function checkTileExist(tileArray,lev,row,col){
        var result = {
            isExist:false,
            index:-1
        };
        for(var m=0;m<tileArray.length;m++){
            var tileInfo = tileArray[m];
            if(tileInfo.level == lev && tileInfo.row == row && tileInfo.column == col){
                result.isExist = true;
                result.index = m;
                return result;
            }
        }
        return result;
    }

    //记录应该删除的切片
    var tilesNeedDelete = [];
    for(var i=0;i<this.children.length;i++){
        var tile = this.children[i];
        var checkResult = checkTileExist(visibleTileGrids,tile.level,tile.row,tile.column);
        var isExist = checkResult.isExist;
        if(isExist){
            visibleTileGrids.splice(checkResult.index,1);//已处理
        }
        else{
            //暂时不删除，先添加要删除的标记，循环删除容易出错
            tilesNeedDelete.push(tile);
        }
    }

    //集中进行删除
    while(tilesNeedDelete.length > 0){
        var b = this.remove(tilesNeedDelete[0]);
        tilesNeedDelete.splice(0,1);
        if(!b){
            console.debug("LINE:2191,subTiledLayer.remove(tilesNeedDelete[0])失败");
        }
    }

    if(bAddNew){
        //添加新增的切片
        for(var i=0;i<visibleTileGrids.length;i++){
            var tileGridInfo = visibleTileGrids[i];
            var args = {
                level:tileGridInfo.level,
                row:tileGridInfo.row,
                column:tileGridInfo.column,
                url:""
            };
            args.url = this.tiledLayer.getImageUrl(args.level,args.row,args.column);
            var tile = new World.Tile(args);
            this.add(tile);
        }
    }
};
//如果bForce为true，则表示强制显示为三维，不考虑level
World.SubTiledLayer.prototype.checkTerrain = function(bForce){
    var globe = World.globe;
    var show3d = bForce == true ? true : this.level >= World.TERRAIN_LEVEL;
    if(show3d && globe && globe.camera && globe.camera.pitch < World.TERRAIN_PITCH){
        var tiles = this.children;
        for(var i=0;i<tiles.length;i++){
            var tile = tiles[i];
            tile.checkTerrain(bForce);
        }
    }
};


//根据当前子图层下的tiles获取其对应的祖先高程切片的TileGrid //getAncestorElevationTileGrids
//7 8 9 10; 10 11 12 13; 13 14 15 16; 16 17 18 19;
World.SubTiledLayer.prototype.requestElevations = function(){
    var result = [];
    if(this.level > World.ELEVATION_LEVEL){
        var tiles = this.children;
        for(var i=0;i<tiles.length;i++){
            var tile = tiles[i];
            var tileGrid = World.Math.getTileGridAncestor(this.elevationLevel,tile.level,tile.row,tile.column);
            var name = tileGrid.level+"_"+tileGrid.row+"_"+tileGrid.column;
            if(result.indexOf(name) < 0){
                result.push(name);
            }
        }
        for(var i=0;i<result.length;i++){
            var name = result[i];
            var a = name.split('_');
            var eleLevel = parseInt(a[0]);
            var eleRow = parseInt(a[1]);
            var eleColumn = parseInt(a[2]);
            //只要elevations中有属性name，那么就表示该高程已经请求过或正在请求，这样就不要重新请求了
            //只有在完全没请求过的情况下去请求高程数据
            if(!World.Elevation.elevations.hasOwnProperty(name)){
                World.Elevation.requestElevationsByTileGrid(eleLevel,eleRow,eleColumn);
            }
        }
    }
};
World.SubTiledLayer.prototype.checkIfLoaded = function(){
    for(var i=0;i<this.children.length;i++){
        var tile = this.children[i];
        if(tile){
            var isTileLoaded = tile.material.loaded;
            if(!isTileLoaded){
                return false;
            }
        }
    }
    return true;
};
//////////////////////////////////////////////////////////////////////////////////
World.TiledLayer = function(args){
    World.Object3DComponents.apply(this,arguments);
};
World.TiledLayer.prototype = new World.Object3DComponents();
World.TiledLayer.prototype.constructor = World.TiledLayer;
//重写
World.TiledLayer.prototype.add = function(subTiledLayer){
    if(!(subTiledLayer instanceof World.SubTiledLayer)){
        throw "invalid subTiledLayer: not World.SubTiledLayer";
    }
    World.Object3DComponents.prototype.add.apply(this,arguments);
    subTiledLayer.tiledLayer = this;
};
//根据切片的层级以及行列号获取图片的url,抽象方法，供子类实现
World.TiledLayer.prototype.getImageUrl = function(level,row,column){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    if(!World.Utils.isNonNegativeInteger(row)){
        throw "invalid row";
    }
    if(!World.Utils.isNonNegativeInteger(column)){
        throw "invalid column";
    }
    return "";
};
//根据传入的level更新SubTiledLayer的数量
World.TiledLayer.prototype.updateSubLayerCount = function(level){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    var subLayerCount = this.children.length;
    var deltaLevel = level + 1 - subLayerCount;
    if(deltaLevel > 0){
        //需要增加子图层
        for(var i=0;i<deltaLevel;i++){
            var args = {level:i+subLayerCount};
            var subLayer = new World.SubTiledLayer(args);
            this.add(subLayer);
        }
    }
    else if(deltaLevel < 0){
        //需要删除多余的子图层
        deltaLevel *= -1;
        for(var i=0;i<deltaLevel;i++){
            var removeLevel = this.children.length-1;
            //第0级和第1级不删除
            if(removeLevel >= 2){
                var subLayer = this.children[removeLevel];
                this.remove(subLayer);
            }
            else{
                break;
            }
        }
    }
};
//////////////////////////////////////////////////////////////////////////////////
//Google
World.GoogleTiledLayer = function(args){
    World.TiledLayer.apply(this,arguments);
};
World.GoogleTiledLayer.prototype = new World.TiledLayer();
World.GoogleTiledLayer.prototype.constructor = World.GoogleTiledLayer;
World.GoogleTiledLayer.prototype.getImageUrl = function(level,row,column){
    World.TiledLayer.prototype.getImageUrl.apply(this,arguments);
    var sum = level + row + column;
    var idx = 1+sum%3;
    var url = "http://mt"+idx+".google.cn/vt/lyrs=m@212000000&hl=zh-CN&gl=CN&src=app&x="+column+"&y="+row+"&z="+level+"&s=Galil";
    return url;
};
//////////////////////////////////////////////////////////////////////////////////
//OpenStreetMap
World.OsmTiledLayer = function(args){
    World.TiledLayer.apply(this,arguments);
};
World.OsmTiledLayer.prototype = new World.TiledLayer();
World.OsmTiledLayer.prototype.constructor = World.OsmTiledLayer;
World.OsmTiledLayer.prototype.getImageUrl = function(level,row,column){
    World.TiledLayer.prototype.getImageUrl.apply(this,arguments);
    var sum = level + row + column;
    var idx = sum%3;
    var server = ["a","b","c"][idx];
    //http://a.tile.openstreetmap.org/6/31/23.png
    var url = "http://"+server+".tile.openstreetmap.org/"+level+"/"+column+"/"+row+".png";
    return url;
};
//////////////////////////////////////////////////////////////////////////////////
//Nokia
World.NokiaTiledLayer = function(args){
    World.TiledLayer.apply(this,arguments);
};
World.NokiaTiledLayer.prototype = new World.TiledLayer();
World.NokiaTiledLayer.prototype.constructor = World.NokiaTiledLayer;
World.NokiaTiledLayer.prototype.getImageUrl = function(level,row,column){
    World.TiledLayer.prototype.getImageUrl.apply(this,arguments);
    var sum = level + row + column;
    var idx = 1+sum%4;//1,2,3,4
    //https://4.aerial.maps.api.here.com/maptile/2.1/maptile/2ae1d8fbb0/hybrid.day/5/24/10/512/png8?app_id=xWVIueSv6JL0aJ5xqTxb&app_code=djPZyynKsbTjIUDOBcHZ2g&lg=eng&ppi=72&pview=DEF
    var url = "http://"+idx+".aerial.maps.api.here.com/maptile/2.1/maptile/2ae1d8fbb0/hybrid.day/"+level+"/"+column+"/"+row+"/256/png8?app_id=xWVIueSv6JL0aJ5xqTxb&app_code=djPZyynKsbTjIUDOBcHZ2g&lg=eng&ppi=72&pview=DEF";
    return url;
};
//////////////////////////////////////////////////////////////////////////////////
//Bing地图
World.BingTiledLayer = function(args){
    World.TiledLayer.apply(this,arguments);
};
World.BingTiledLayer.prototype = new World.TiledLayer();
World.BingTiledLayer.prototype.constructor = World.BingTiledLayer;
World.BingTiledLayer.prototype.getImageUrl = function(level,row,column){
    World.TiledLayer.prototype.getImageUrl.apply(this,arguments);
    var url = "";
    var tileX = column;
    var tileY = row;
    var strTileX2 = World.Math.numerationSystemFrom10(2,tileX);
    var strTileY2 = World.Math.numerationSystemFrom10(2,tileY);
    var delta = strTileX2.length - strTileY2.length;
    if(delta > 0){
        for(var i=0;i<delta;i++){
            strTileY2 = '0' + strTileY2;
        }
    }
    else if(delta < 0){
        delta = -delta;
        for(var i=0;i<delta;i++){
            strTileX2 = '0' + strTileX2;
        }
    }
    var strMerge2 = "";
    for(var i=0;i<strTileY2.length;i++){
        var charY = strTileY2[i];
        var charX = strTileX2[i];
        strMerge2 += charY + charX;
    }
    var strMerge4 = World.Math.numerationSystemChange(2,4,strMerge2);
    if(strMerge4.length < level){
        var delta = level - strMerge4.length;
        for(var i=0;i<delta;i++){
            strMerge4 = '0' + strMerge4;
        }
    }
    var sum = level + row + column;
    var serverIdx = sum%8;//0,1,2,3,4,5,6,7
    //var styles = ['a','r','h']
    url = "http://ecn.t"+serverIdx+".tiles.virtualearth.net/tiles/h"+strMerge4+".jpeg?g=1239&mkt=en-us";
    return url;
};
//////////////////////////////////////////////////////////////////////////////////
World.TiandituTiledLayer = function(args){
    World.TiledLayer.apply(this,arguments);
};
World.TiandituTiledLayer.prototype = new World.TiledLayer();
World.TiandituTiledLayer.prototype.constructor = World.TiandituTiledLayer;
World.TiandituTiledLayer.prototype.getImageUrl = function(level,row,column){
    World.TiledLayer.prototype.getImageUrl.apply(this,arguments);
    var url = "";
    var sum = level + row + column;
    var serverIdx = sum%8;
    url = "http://t"+serverIdx+".tianditu.com/DataServer?T=vec_w&x="+column+"&y="+row+"&l="+level;
    return url;
};
//////////////////////////////////////////////////////////////////////////////////
World.SosoTiledLayer = function(args){
    World.TiledLayer.apply(this,arguments);
};
World.SosoTiledLayer.prototype = new World.TiledLayer();
World.SosoTiledLayer.prototype.constructor = World.SosoTiledLayer;
World.SosoTiledLayer.prototype.getImageUrl = function(level,row,column){
    World.TiledLayer.prototype.getImageUrl.apply(this,arguments);
    var url = "";
    var tileCount = Math.pow(2,level);
    var a = column;
    var b = tileCount - row - 1;
    var A = Math.floor(a/16);
    var B = Math.floor(b/16);
    var sum = level + row + column;
    var serverIdx = sum%4;//0、1、2、3
    var sateUrl = "http://p"+serverIdx+".map.soso.com/sateTiles/"+level+"/"+A+"/"+B+"/"+a+"_"+b+".jpg";
    //var maptileUrl = "http://p"+serverIdx+".map.soso.com/maptilesv2/"+level+"/"+A+"/"+B+"/"+a+"_"+b+".png";
    url = sateUrl;
    return url;
};
//////////////////////////////////////////////////////////////////////////////////
World.BlendTiledLayer = function(args){
    World.TiledLayer.apply(this,arguments);
};
World.BlendTiledLayer.prototype = new World.TiledLayer();
World.BlendTiledLayer.prototype.constructor = World.BlendTiledLayer;
World.BlendTiledLayer.prototype.getImageUrl = function(level,row,column){
    World.TiledLayer.prototype.getImageUrl.apply(this,arguments);
    var array = [World.NokiaTiledLayer,World.GoogleTiledLayer,World.OsmTiledLayer];
    var sum = level + row + column;
    var idx = sum%3;
    var url = array[idx].prototype.getImageUrl.apply(this,arguments);
    return url;
};
//////////////////////////////////////////////////////////////////////////////////
//使用代理
World.ArcGISTiledLayer = function(args){
    World.TiledLayer.apply(this,arguments);
    this.service = "";
    if(args){
        if(args.url){
            this.service = args.url;
        }
    }
};
World.ArcGISTiledLayer.prototype = new World.TiledLayer();
World.ArcGISTiledLayer.prototype.constructor = World.ArcGISTiledLayer;
World.ArcGISTiledLayer.prototype.getImageUrl = function(level,row,column){
    World.TiledLayer.prototype.getImageUrl.apply(this,arguments);
    var url = "proxy.jsp?"+this.service+"/tile/"+level+"/"+row+"/"+column;
    return url;
};
//////////////////////////////////////////////////////////////////////////////////
//使用代理
World.AutonaviTiledLayer = function(args){
    World.TiledLayer.apply(this,arguments);
};
World.AutonaviTiledLayer.prototype = new World.TiledLayer();
World.AutonaviTiledLayer.prototype.constructor = World.AutonaviTiledLayer;
World.AutonaviTiledLayer.prototype.getImageUrl = function(level,row,column){
    World.TiledLayer.prototype.getImageUrl.apply(this,arguments);
    var sum = level + row + column;
    var serverIdx = 1+sum%4;//1、2、3、4
    var url = "proxy.jsp?http://webrd0"+serverIdx+".is.autonavi.com/appmaptile?x="+column+"&y="+row+"&z="+level+"&lang=zh_cn&size=1&scale=1&style=8";
    return url;
};
//////////////////////////////////////////////////////////////////////////////////
World.TestTiledLayer = function(args){
    World.TiledLayer.apply(this,arguments);
};
World.TestTiledLayer.prototype = new World.TiledLayer();
World.TestTiledLayer.prototype.constructor = World.TestTiledLayer;
World.TestTiledLayer.prototype.getImageUrl = function(level,row,column){
    World.TiledLayer.prototype.getImageUrl.apply(this,arguments);
    var url = "";
    //geoq url = http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/vetile/0";
    //百度 url = "http://q3.baidu.com/it/u=x=M2;y=0;z=3;v=015;type=web&fm=44";
    //高德 url = "http://webst01.is.autonavi.com/appmaptile?x=0&y=0&z=1&lang=zh_cn&size=1&scale=1&style=6";
    //阿里云 url = "http://img.ditu.aliyun.com/get_png?v=v6&x=844&y=388&z=10";
    //cloudmade url = "http://a.tile.cloudmade.com/77a02635567543629fab39a61a302f3c/8/256/15/27195/13302.png";

    return url;
};
//////////////////////////////////////////////////////////////////////////////////
World.PerspectiveCamera = function(fov,aspect,near,far){
    fov = fov != undefined ? fov : 90;
    aspect = aspect != undefined ? aspect : 1;
    near = near != undefined ? near : 1;
    far = far != undefined ? far : 1;
    if(!World.Utils.isNumber(fov)){
        throw "invalid fov: not number";
    }
    if(!World.Utils.isNumber(aspect)){
        throw "invalid aspect: not number";
    }
    if(!World.Utils.isNumber(near)){
        throw "invalid near: not number";
    }
    if(!World.Utils.isNumber(far)){
        throw "invalid far: not number";
    }
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    World.Object3D.apply(this,null);
    this.pitch = 90;
    this.projMatrix = new World.Matrix();
    this.setPerspectiveMatrix(this.fov,this.aspect,this.near,this.far);
};
World.PerspectiveCamera.prototype = new World.Object3D();
World.PerspectiveCamera.prototype.constructor = World.PerspectiveCamera;
World.PerspectiveCamera.prototype.Enum = {
    EARTH_FULL_OVERSPREAD_SCREEN:"EARTH_FULL_OVERSPREAD_SCREEN",//Canvas内全部被地球充满
    EARTH_NOT_FULL_OVERSPREAD_SCREEN:"EARTH_NOT_FULL_OVERSPREAD_SCREEN"//Canvas没有全部被地球充满
};
World.PerspectiveCamera.prototype.setPerspectiveMatrix = function(fov,aspect,near,far){
    fov = fov != undefined ? fov : 90;
    aspect = aspect != undefined ? aspect : 1;
    near = near != undefined ? near : 1;
    far = far != undefined ? far : 1;
    if(!World.Utils.isNumber(fov)){
        throw "invalid fov: not number";
    }
    if(!World.Utils.isNumber(aspect)){
        throw "invalid aspect: not number";
    }
    if(!World.Utils.isNumber(near)){
        throw "invalid near: not number";
    }
    if(!World.Utils.isNumber(far)){
        throw "invalid far: not number";
    }
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    var mat = [1,0,0,0,
               0,1,0,0,
               0,0,1,0,
               0,0,0,1];
    var halfFov = this.fov * Math.PI/180/2;
    var a = 1 / Math.tan(halfFov);
    var b = this.far - this.near;

    mat[0] = a / this.aspect;
    mat[5] = a;
    mat[10] = -(this.far + this.near) / b;
    mat[11] = -1;
    mat[14] = -2 * this.near * this.far / b;
    mat[15] = 0;

    //by comparision with matrixProjection.exe and glMatrix,
    //the 11th element is always -1
    this.projMatrix.setElements(mat[0],mat[1],mat[2],mat[3],
                                mat[4],mat[5],mat[6],mat[7],
                                mat[8],mat[9],mat[10],mat[11],
                                mat[12],mat[13],mat[14],mat[15]);
};

World.PerspectiveCamera.prototype.getLightDirection = function(){
    var dirVertice = this.matrix.getColumnZ();
    var direction = new World.Vector(-dirVertice.x,-dirVertice.y, -dirVertice.z);
    direction.normalize();
    return direction;
};

//获取投影矩阵与视点矩阵的乘积
World.PerspectiveCamera.prototype.getProjViewMatrix = function(){
    var viewMatrix = this.getViewMatrix();
    var projViewMatrix = this.projMatrix.multiplyMatrix(viewMatrix);
    return projViewMatrix;
};

World.PerspectiveCamera.prototype.setFov = function(fov){
    if(!World.Utils.isPositive(fov)){
        throw "invalid fov";
    }
    this.setPerspectiveMatrix(fov,this.aspect,this.near,this.far);
};

World.PerspectiveCamera.prototype.setAspect = function(aspect){
    if(!World.Utils.isPositive(aspect)){
        throw "invalid aspect";
    }
    this.setPerspectiveMatrix(this.fov, aspect, this.near,this.far);
};

World.PerspectiveCamera.prototype.setNear = function(near){
    if(!World.Utils.isPositive(near)){
        throw "invalid near";
    }
    this.setPerspectiveMatrix(this.fov,this.aspect,near,this.far);
};

World.PerspectiveCamera.prototype.setFar = function(far){
    if(!World.Utils.isPositive(far)){
        throw "invalid far";
    }
    this.setPerspectiveMatrix(this.fov, this.aspect,this.near, far);
};

World.PerspectiveCamera.prototype.getViewMatrix = function(){
    //视点矩阵是camera的模型矩阵的逆矩阵
    return this.matrix.getInverseMatrix();
};

World.PerspectiveCamera.prototype.look = function(cameraPnt,targetPnt,upDirection){
    if(!(cameraPnt instanceof World.Vertice)){
        throw "invalid cameraPnt: not World.Vertice";
    }
    if(!(targetPnt instanceof World.Vertice)){
        throw "invalid targetPnt: not World.Vertice";
    }
    upDirection = upDirection != undefined ? upDirection : new World.Vector(0,1,0);
    if(!(upDirection instanceof World.Vector)){
        throw "invalid upDirection: not World.Vector";
    }
    var cameraPntCopy = cameraPnt.getCopy();
    var targetPntCopy = targetPnt.getCopy();
    var up = upDirection.getCopy();
    var transX = cameraPntCopy.x;
    var transY = cameraPntCopy.y;
    var transZ = cameraPntCopy.z;
    var zAxis = new World.Vector(cameraPntCopy.x-targetPntCopy.x,cameraPntCopy.y-targetPntCopy.y,cameraPntCopy.z-targetPntCopy.z).normalize();
    var xAxis = up.cross(zAxis).normalize();
    var yAxis = zAxis.cross(xAxis).normalize();

    this.matrix.setColumnX(xAxis.x,xAxis.y,xAxis.z);//此处相当于对Camera的模型矩阵(不是视点矩阵)设置X轴方向
    this.matrix.setColumnY(yAxis.x,yAxis.y,yAxis.z);//此处相当于对Camera的模型矩阵(不是视点矩阵)设置Y轴方向
    this.matrix.setColumnZ(zAxis.x,zAxis.y,zAxis.z);//此处相当于对Camera的模型矩阵(不是视点矩阵)设置Z轴方向
    this.matrix.setColumnTrans(transX,transY,transZ);//此处相当于对Camera的模型矩阵(不是视点矩阵)设置偏移量
    this.matrix.setLastRowDefault();

    var deltaX = cameraPntCopy.x - targetPntCopy.x;
    var deltaY = cameraPntCopy.y - targetPntCopy.y;
    var deltaZ = cameraPntCopy.z - targetPntCopy.z;
    var far = Math.sqrt(deltaX*deltaX+deltaY*deltaY+deltaZ*deltaZ);
    this.setFar(far);
};

World.PerspectiveCamera.prototype.lookAt = function(targetPnt,upDirection){
    if(!(targetPnt instanceof World.Vertice)){
        throw "invalid targetPnt: not World.Vertice";
    }
    upDirection = upDirection != undefined ? upDirection : new World.Vector(0,1,0);
    if(!(upDirection instanceof World.Vector)){
        throw "invalid upDirection: not World.Vector";
    }
    var targetPntCopy = targetPnt.getCopy();
    var upDirectionCopy = upDirection.getCopy();
    var position = this.getPosition();
    this.look(position,targetPntCopy,upDirectionCopy);
};

//点变换: World->NDC
World.PerspectiveCamera.prototype.convertVerticeFromWorldToNDC = function(verticeInWorld,/*optional*/ projViewMatrix){
    if(!(verticeInWorld instanceof World.Vertice)){
        throw "invalid verticeInWorld: not World.Vertice";
    }
    if(!(projViewMatrix instanceof World.Matrix)){
        projViewMatrix = this.getProjViewMatrix();
    }
    var columnWorld = [verticeInWorld.x,verticeInWorld.y,verticeInWorld.z,1];
    var columnProject = projViewMatrix.multiplyColumn(columnWorld);
    var w = columnProject[3];
    var columnNDC = [];
    columnNDC[0] = columnProject[0]/w;
    columnNDC[1] = columnProject[1]/w;
    columnNDC[2] = columnProject[2]/w;
    columnNDC[3] = 1;
    var verticeInNDC = new World.Vertice(columnNDC[0],columnNDC[1],columnNDC[2]);
    return verticeInNDC;
};

//点变换: NDC->World
World.PerspectiveCamera.prototype.convertVerticeFromNdcToWorld = function(verticeInNDC){
    if(!(verticeInNDC instanceof World.Vertice)){
        throw "invalid verticeInNDC: not World.Vertice";
    }
    var columnNDC = [verticeInNDC.x,verticeInNDC.y,verticeInNDC.z,1];//NDC归一化坐标
    var inverseProj = this.projMatrix.getInverseMatrix();//投影矩阵的逆矩阵
    var columnCameraTemp = inverseProj.multiplyColumn(columnNDC);//带引号的“视坐标”
    var cameraX = columnCameraTemp[0]/columnCameraTemp[3];
    var cameraY = columnCameraTemp[1]/columnCameraTemp[3];
    var cameraZ = columnCameraTemp[2]/columnCameraTemp[3];
    var cameraW = 1;
    var columnCamera = [cameraX,cameraY,cameraZ,cameraW];//真实的视坐标

    var viewMatrix = this.getViewMatrix();
    var inverseView = viewMatrix.getInverseMatrix();//视点矩阵的逆矩阵
    var columnWorld = inverseView.multiplyColumn(columnCamera);//单击点的世界坐标
    var verticeInWorld = new World.Vertice(columnWorld[0],columnWorld[1],columnWorld[2]);
    return verticeInWorld;
};

//点变换: Camera->World
World.PerspectiveCamera.prototype.convertVerticeFromCameraToWorld = function(verticeInCamera,/*optional*/ viewMatrix){
    if(!(verticeInCamera instanceof World.Vertice)){
        throw "invalid verticeInCamera: not World.Vertice";
    }
    if(!(viewMatrix instanceof World.Matrix)){
        viewMatrix = this.getViewMatrix();
    }
    var verticeInCameraCopy = verticeInCamera.getCopy();
    var inverseMatrix = viewMatrix.getInverseMatrix();
    var column = [verticeInCameraCopy.x,verticeInCameraCopy.y,verticeInCameraCopy.z,1];
    var column2 = inverseMatrix.multiplyColumn(column);
    var verticeInWorld = new World.Vertice(column2[0],column2[1],column2[2]);
    return verticeInWorld;
};

//向量变换: Camera->World
World.PerspectiveCamera.prototype.convertVectorFromCameraToWorld = function(vectorInCamera,/*optional*/ viewMatrix){
    if(!(vectorInCamera instanceof World.Vector)){
        throw "invalid vectorInCamera: not World.Vector";
    }
    if(!(viewMatrix instanceof World.Matrix)){
        viewMatrix = this.getViewMatrix();
    }
    var vectorInCameraCopy = vectorInCamera.getCopy();
    var verticeInCamera = vectorInCameraCopy.getVertice();
    var verticeInWorld = this.convertVerticeFromCameraToWorld(verticeInCamera,viewMatrix);
    var originInWorld = this.getPosition();
    var vectorInWorld = verticeInWorld.minus(originInWorld);
    vectorInWorld.normalize();
    return vectorInWorld;
};

//根据canvasX和canvasY获取拾取向量
World.PerspectiveCamera.prototype.getPickDirectionByCanvas = function(canvasX,canvasY){
    if(!World.Utils.isNumber(canvasX)){
        throw "invalid canvasX: not number";
    }
    if(!World.Utils.isNumber(canvasY)){
        throw "invalid canvasY: not number";
    }
    var ndcXY = World.Math.convertPointFromCanvasToNDC(canvasX,canvasY);
    var pickDirection = this.getPickDirectionByNDC(ndcXY[0],ndcXY[1]);
    return pickDirection;
};

//获取当前视线与地球的交点
World.PerspectiveCamera.prototype.getDirectionIntersectPointWithEarth = function(){
    var dir = this.getLightDirection();
    var p = this.getPosition();
    var line = new World.Line(p,dir);
    var result = this.getPickCartesianCoordInEarthByLine(line);
    return result;
};

//根据ndcX和ndcY获取拾取向量
World.PerspectiveCamera.prototype.getPickDirectionByNDC = function(ndcX,ndcY){
    if(!World.Utils.isNumber(ndcX)){
        throw "invalid ndcX: not number";
    }if(!World.Utils.isNumber(ndcY)){
        throw "invalid ndcY: not number";
    }
    var verticeInNDC = new World.Vertice(ndcX,ndcY,0.499);
    var verticeInWorld = this.convertVerticeFromNdcToWorld(verticeInNDC);
    var cameraPositon = this.getPosition();//摄像机的世界坐标
    var pickDirection = verticeInWorld.minus(cameraPositon);
    pickDirection.normalize();
    return pickDirection;
};

//获取直线与地球的交点，该方法与World.Math.getLineIntersectPointWithEarth功能基本一样，只不过该方法对相交点进行了远近排序
World.PerspectiveCamera.prototype.getPickCartesianCoordInEarthByLine = function(line){
    if(!(line instanceof World.Line)){
        throw "invalid line: not World.Line";
    }
    var result = [];
    //pickVertice是笛卡尔空间直角坐标系中的坐标
    var pickVertices = World.Math.getLineIntersectPointWithEarth(line);
    if(pickVertices.length == 0){
        //没有交点
        result = [];
    }
    else if(pickVertices.length == 1){
        //一个交点
        result = pickVertices;
    }
    else if(pickVertices.length == 2){
        //两个交点
        var pickVerticeA = pickVertices[0];
        var pickVerticeB = pickVertices[1];
        var cameraVertice = this.getPosition();
        var lengthA = World.Math.getLengthFromVerticeToVertice(cameraVertice,pickVerticeA);
        var lengthB = World.Math.getLengthFromVerticeToVertice(cameraVertice,pickVerticeB);
        //将距离人眼更近的那个点放到前面
        result = lengthA <= lengthB ? [pickVerticeA,pickVerticeB] : [pickVerticeB,pickVerticeA];
    }
    return result;
};

//计算拾取射线与地球的交点，以笛卡尔空间直角坐标系坐标组的组的形式返回
World.PerspectiveCamera.prototype.getPickCartesianCoordInEarthByCanvas = function(canvasX,canvasY,options){
    if(!World.Utils.isNumber(canvasX)){
        throw "invalid canvasX: not number";
    }
    if(!World.Utils.isNumber(canvasY)){
        throw "invalid canvasY: not number";
    }
    var pickDirection = this.getPickDirectionByCanvas(canvasX,canvasY);
    var p = this.getPosition();
    var line = new World.Line(p,pickDirection);
    var result = this.getPickCartesianCoordInEarthByLine(line);
    return result;
};

World.PerspectiveCamera.prototype.getPickCartesianCoordInEarthByNDC = function(ndcX,ndcY){
    if(!World.Utils.isNumber(ndcX)){
        throw "invalid ndcX: not number";
    }
    if(!World.Utils.isNumber(ndcY)){
        throw "invalid ndcY: not number";
    }
    var pickDirection = this.getPickDirectionByNDC(ndcX,ndcY);
    var p = this.getPosition();
    var line = new World.Line(p,pickDirection);
    var result = this.getPickCartesianCoordInEarthByLine(line);
    return result;
};

//得到摄像机的XOZ平面的方程
World.PerspectiveCamera.prototype.getPlanXOZ = function(){
    var position = this.getPosition();
    var direction = this.getLightDirection();
    var plan = World.Math.getCrossPlaneByLine(position,direction);
    return plan;
};

//设置观察到的层级
World.PerspectiveCamera.prototype.setLevel = function(level){
    if(!World.Utils.isInteger(level)){
        throw "invalid level";
    }
    if(level < 0){
        return;
    }
    var pOld = this.getPosition();
    if(pOld.x == 0 && pOld.y == 0 && pOld.z == 0){
        //初始设置camera
        var length = World.Math.getLengthFromCamera2EarthSurface(level) + World.EARTH_RADIUS; //level等级下摄像机应该到球心的距离
        var origin = new World.Vertice(0,0,0);
        var vector = this.getLightDirection().getOpposite();
        vector.setLength(length);
        var newPosition = vector.getVertice();
        this.look(newPosition,origin);
    }
    else{
        var length2SurfaceNow = World.Math.getLengthFromCamera2EarthSurface(World.globe.CURRENT_LEVEL);
        var length2Surface = World.Math.getLengthFromCamera2EarthSurface(level);
        var deltaLength = length2SurfaceNow - length2Surface;
        var dir = this.getLightDirection();
        dir.setLength(deltaLength);
        var pNew = pOld.plus(dir);
        this.setPosition(pNew.x,pNew.y,pNew.z);
    }
    World.globe.CURRENT_LEVEL = level;
};

//判断世界坐标系中的点是否在Canvas中可见
//options:projView、verticeInNDC
World.PerspectiveCamera.prototype.isWorldVerticeVisibleInCanvas = function(verticeInWorld,options){
    if(!(verticeInWorld instanceof World.Vertice)){
        throw "invalid verticeInWorld: not World.Vertice";
    }
    options = options||{};
    var threshold = typeof options.threshold == "number" ? Math.abs(options.threshold) : 1;
    var cameraP = this.getPosition();
    var dir = verticeInWorld.minus(cameraP);
    var line = new World.Line(cameraP,dir);
    var pickResult = this.getPickCartesianCoordInEarthByLine(line);
    if(pickResult.length > 0){
        var pickVertice = pickResult[0];
        var length2Vertice = World.Math.getLengthFromVerticeToVertice(cameraP,verticeInWorld);
        var length2Pick = World.Math.getLengthFromVerticeToVertice(cameraP,pickVertice);
        if(length2Vertice < length2Pick + 5){
            if(!(options.verticeInNDC instanceof World.Vertice)){
                if(!(options.projView instanceof World.Matrix)){
                    options.projView = this.getProjViewMatrix();
                }
                options.verticeInNDC = this.convertVerticeFromWorldToNDC(verticeInWorld,options.projView);
            }
            var result = options.verticeInNDC.x >= -1 && options.verticeInNDC.x <= 1 && options.verticeInNDC.y >= -threshold && options.verticeInNDC.y <= 1;
            return result;
        }
    }
    return false;
};

//判断地球表面的某个经纬度在Canvas中是否应该可见
//options:projView、verticeInNDC
World.PerspectiveCamera.prototype.isGeoVisibleInCanvas = function(lon,lat,options){
    var verticeInWorld = World.Math.geographicToCartesianCoord(lon,lat);
    var result = this.isWorldVerticeVisibleInCanvas(verticeInWorld,options);
    return result;
};


/**
 * 算法，一个切片需要渲染需要满足如下三个条件:
 * 1.至少要有一个点在Canvas中可见
 * 2.NDC面积足够大
 * 3.形成的NDC四边形是顺时针方向
 */
//获取level层级下的可见切片
//options:projView
World.PerspectiveCamera.prototype.getVisibleTilesByLevel = function(level,options){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    var result = [];
    options = options || {};
    if(!(options.projView instanceof World.Matrix)){
        options.projView = this.getProjViewMatrix();
    }
    //向左、向右、向上、向下最大的循环次数
    var LOOP_LIMIT = Math.min(10,Math.pow(2,level)-1);

    var mathOptions = {maxSize:Math.pow(2,level)};

    function checkVisible(visibleInfo){
        if(visibleInfo.area >= 5000 && visibleInfo.clockwise){
            if(visibleInfo.visibleCount >= 1){
                return true;
            }
        }
        return false;
    }

    function handleRow(centerRow,centerColumn){
        var result = [];
        var grid = new World.TileGrid(level,centerRow,centerColumn);// {level:level,row:centerRow,column:centerColumn};
        var visibleInfo = this.getTileVisibleInfo(grid.level,grid.row,grid.column,options);
        var isRowCenterVisible = checkVisible(visibleInfo);
        if(isRowCenterVisible){
            grid.visibleInfo = visibleInfo;
            result.push(grid);

            //向左遍历至不可见
            var leftLoopTime = 0;//向左循环的次数
            var leftColumn = centerColumn;
            while(leftLoopTime < LOOP_LIMIT){
                leftLoopTime++;
                grid = World.Math.getTileGridByBrother(level,centerRow,leftColumn,World.Math.LEFT,mathOptions);
                leftColumn = grid.column;
                visibleInfo = this.getTileVisibleInfo(grid.level,grid.row,grid.column,options);
                var visible = checkVisible(visibleInfo);
                if(visible){
                    grid.visibleInfo = visibleInfo;
                    result.push(grid);
                }
                else{
                    break;
                }
            }

            //向右遍历至不可见
            var rightLoopTime = 0;//向右循环的次数
            var rightColumn = centerColumn;
            while(rightLoopTime < LOOP_LIMIT){
                rightLoopTime++;
                grid = World.Math.getTileGridByBrother(level,centerRow,rightColumn,World.Math.RIGHT,mathOptions);
                rightColumn = grid.column;
                visibleInfo = this.getTileVisibleInfo(grid.level,grid.row,grid.column,options);
                var visible = checkVisible(visibleInfo);
                if(visible){
                    grid.visibleInfo = visibleInfo;
                    result.push(grid);
                }
                else{
                    break;
                }
            }
        }
        return result;
    }

    var verticalCenterInfo = this._getVerticalVisibleCenterInfo(options);
    var centerGrid = World.Math.getTileGridByGeo(verticalCenterInfo.lon,verticalCenterInfo.lat,level);
    var handleRowThis = handleRow.bind(this);

    var rowResult = handleRowThis(centerGrid.row,centerGrid.column);
    result = result.concat(rowResult);

    //循环向下处理至不可见
    var bottomLoopTime = 0;//向下循环的次数
    var bottomRow = centerGrid.row;
    while(bottomLoopTime < LOOP_LIMIT){
        bottomLoopTime++;
        var grid = World.Math.getTileGridByBrother(level,bottomRow,centerGrid.column,World.Math.BOTTOM,mathOptions);
        bottomRow = grid.row;
        rowResult = handleRowThis(grid.row,grid.column);
        if(rowResult.length > 0){
            result = result.concat(rowResult);
        }
        else{
            //已经向下循环到不可见，停止向下循环
            break;
        }
    }

    //循环向上处理至不可见
    var topLoopTime = 0;//向上循环的次数
    var topRow = centerGrid.row;
    while(topLoopTime < LOOP_LIMIT){
        topLoopTime++;
        var grid = World.Math.getTileGridByBrother(level,topRow,centerGrid.column,World.Math.TOP,mathOptions);
        topRow = grid.row;
        rowResult = handleRowThis(grid.row,grid.column);
        if(rowResult.length > 0){
            result = result.concat(rowResult);
        }
        else{
            //已经向上循环到不可见，停止向上循环
            break;
        }
    }

    return result;
};

//options:projView
World.PerspectiveCamera.prototype.getTileVisibleInfo = function(level,row,column,options){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    if(!World.Utils.isNonNegativeInteger(row)){
        throw "invalid row";
    }
    if(!World.Utils.isNonNegativeInteger(column)){
        throw "invalid column";
    }
    options = options||{};
    var threshold = typeof options.threshold == "number" ? Math.abs(options.threshold) : 1;
    var result = {
        lb:{lon:null,lat:null,verticeInWorld:null,verticeInNDC:null,visible:false},
        lt:{lon:null,lat:null,verticeInWorld:null,verticeInNDC:null,visible:false},
        rt:{lon:null,lat:null,verticeInWorld:null,verticeInNDC:null,visible:false},
        rb:{lon:null,lat:null,verticeInWorld:null,verticeInNDC:null,visible:false},
        Egeo:null,
        visibleCount:0,
        clockwise:false,
        width:null,
        height:null,
        area:null
    };
    if(!(options.projView instanceof World.Matrix)){
        options.projView = this.getProjViewMatrix();
    }
    result.Egeo = World.Math.getTileGeographicEnvelopByGrid(level,row,column);
    var tileMinLon = result.Egeo.minLon;
    var tileMaxLon = result.Egeo.maxLon;
    var tileMinLat = result.Egeo.minLat;
    var tileMaxLat = result.Egeo.maxLat;

    //左下角
    result.lb.lon = tileMinLon; result.lb.lat = tileMinLat;
    result.lb.verticeInWorld = World.Math.geographicToCartesianCoord(result.lb.lon,result.lb.lat);
    result.lb.verticeInNDC = this.convertVerticeFromWorldToNDC(result.lb.verticeInWorld,options.projView);
    result.lb.visible = this.isWorldVerticeVisibleInCanvas(result.lb.verticeInWorld,{verticeInNDC:result.lb.verticeInNDC,projView:options.projView,threshold:threshold});
    if(result.lb.visible){
        result.visibleCount++;
    }

    //左上角
    result.lt.lon = tileMinLon; result.lt.lat = tileMaxLat;
    result.lt.verticeInWorld = World.Math.geographicToCartesianCoord(result.lt.lon,result.lt.lat);
    result.lt.verticeInNDC = this.convertVerticeFromWorldToNDC(result.lt.verticeInWorld,options.projView);
    result.lt.visible = this.isWorldVerticeVisibleInCanvas(result.lt.verticeInWorld,{verticeInNDC:result.lt.verticeInNDC,projView:options.projView,threshold:threshold});
    if(result.lt.visible){
        result.visibleCount++;
    }

    //右上角
    result.rt.lon = tileMaxLon; result.rt.lat = tileMaxLat;
    result.rt.verticeInWorld = World.Math.geographicToCartesianCoord(result.rt.lon,result.rt.lat);
    result.rt.verticeInNDC = this.convertVerticeFromWorldToNDC(result.rt.verticeInWorld,options.projView);
    result.rt.visible = this.isWorldVerticeVisibleInCanvas(result.rt.verticeInWorld,{verticeInNDC:result.rt.verticeInNDC,projView:options.projView,threshold:threshold});
    if(result.rt.visible){
        result.visibleCount++;
    }

    //右下角
    result.rb.lon = tileMaxLon; result.rb.lat = tileMinLat;
    result.rb.verticeInWorld = World.Math.geographicToCartesianCoord(result.rb.lon,result.rb.lat);
    result.rb.verticeInNDC = this.convertVerticeFromWorldToNDC(result.rb.verticeInWorld,options.projView);
    result.rb.visible = this.isWorldVerticeVisibleInCanvas(result.rb.verticeInWorld,{verticeInNDC:result.rb.verticeInNDC,projView:options.projView,threshold:threshold});
    if(result.rb.visible){
        result.visibleCount++;
    }

    var ndcs = [result.lb.verticeInNDC,result.lt.verticeInNDC,result.rt.verticeInNDC,result.rb.verticeInNDC];
    //计算方向
    var vector03 = ndcs[3].minus(ndcs[0]);
    vector03.z = 0;
    var vector01 = ndcs[1].minus(ndcs[0]);
    vector01.z = 0;
    var cross = vector03.cross(vector01);
    result.clockwise = cross.z > 0;
    //计算面积
    var topWidth = Math.sqrt(Math.pow(ndcs[1].x-ndcs[2].x,2)+Math.pow(ndcs[1].y-ndcs[2].y,2))*World.canvas.width/2;
    var bottomWidth = Math.sqrt(Math.pow(ndcs[0].x-ndcs[3].x,2)+Math.pow(ndcs[0].y-ndcs[3].y,2))*World.canvas.width/2;
    result.width = Math.floor((topWidth+bottomWidth)/2);
    var leftHeight = Math.sqrt(Math.pow(ndcs[0].x-ndcs[1].x,2)+Math.pow(ndcs[0].y-ndcs[1].y,2))*World.canvas.height/2;
    var rightHeight = Math.sqrt(Math.pow(ndcs[2].x-ndcs[3].x,2)+Math.pow(ndcs[2].y-ndcs[3].y,2))*World.canvas.height/2;
    result.height = Math.floor((leftHeight+rightHeight)/2);
    result.area = result.width * result.height;

    return result;
};

//地球一直是关于纵轴中心对称的，获取垂直方向上中心点信息
World.PerspectiveCamera.prototype._getVerticalVisibleCenterInfo = function(options){
    options = options||{};
    if(!options.projView){
        options.projView = this.getProjViewMatrix();
    }
    var result = {
        ndcY:null,
        pIntersect:null,
        lon:null,
        lat:null
    };
    if(this.pitch == 90){
        result.ndcY = 0;
    }
    else{
        var count = 10;
        var delta = 2.0/count;
        var topNdcY = 1;
        var bottomNdcY = -1;
        //从上往下找topNdcY
        for(var ndcY=1.0;ndcY>=-1.0;ndcY-=delta){
            var pickResults = this.getPickCartesianCoordInEarthByNDC(0,ndcY);
            if(pickResults.length > 0){
                topNdcY = ndcY;
                break;
            }
        }

        //从下往上找
        for(var ndcY=-1.0;ndcY<=1.0;ndcY+=delta){
            var pickResults = this.getPickCartesianCoordInEarthByNDC(0,ndcY);
            if(pickResults.length > 0){
                bottomNdcY = ndcY;
                break;
            }
        }
        result.ndcY = (topNdcY + bottomNdcY) / 2;
    }
    var pickResults = this.getPickCartesianCoordInEarthByNDC(0,result.ndcY);
    result.pIntersect = pickResults[0];
    var lonlat = World.Math.cartesianCoordToGeographic(result.pIntersect);
    result.lon = lonlat[0];
    result.lat = lonlat[1];
    return result;
};
/////////////////////////////////////////////////////////////////////////////////////
World.ShaderContent = {
    SIMPLE_SHADER:{
        VS_CONTENT:"attribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nvarying vec2 vTextureCoord;\nuniform mat4 uMVMatrix;\nuniform mat4 uPMatrix;\nvoid main()\n{\ngl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition,1.0);\nvTextureCoord = aTextureCoord;\n}",
        FS_CONTENT:"#ifdef GL_ES\nprecision highp float;\n#endif\nuniform bool uUseTexture;\nuniform float uShininess;\nuniform vec3 uLightDirection;\nuniform vec4 uLightAmbient;\nuniform vec4 uLightDiffuse;\nuniform vec4 uLightSpecular;\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nvoid main()\n{\ngl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n}"
    }
};
//////////////////////////////////////////////////////////////////////////////////////////
World.Event = {
    canvas:null,
    bMouseDown:false,
    dragGeo:null,
    previousX:-1,
    previousY:-1,
    onMouseMoveListener:null,

    bindEvents:function(canvas){
        if(!(canvas instanceof HTMLCanvasElement)){
            throw "invalid canvas: not HTMLCanvasElement";
        }
        this.canvas = canvas;
        this.onMouseMoveListener = this.onMouseMove.bind(this);
        window.addEventListener("resize",this.initLayout.bind(this));
        this.canvas.addEventListener("mousedown",this.onMouseDown.bind(this));
        this.canvas.addEventListener("mouseup",this.onMouseUp.bind(this));
        this.canvas.addEventListener("dblclick",this.onDbClick.bind(this));
        this.canvas.addEventListener("mousewheel",this.onMouseWheel.bind(this));
        this.canvas.addEventListener("DOMMouseScroll",this.onMouseWheel.bind(this));
        document.body.addEventListener("keydown",this.onKeyDown.bind(this));
    },

    initLayout:function(){
        if(this.canvas instanceof HTMLCanvasElement){
            this.canvas.width = document.body.clientWidth;
            this.canvas.height = document.body.clientHeight;
            if(World.globe){
                World.globe.camera.setAspect(this.canvas.width/this.canvas.height);
                World.globe.refresh();
            }
        }
    },

    //将地球表面的某一点移动到Canvas上
    moveLonLatToCanvas:function(lon,lat,canvasX,canvasY){
        var pickResult = World.globe.camera.getPickCartesianCoordInEarthByCanvas(canvasX,canvasY);
        if(pickResult.length > 0){
            var newLonLat = World.Math.cartesianCoordToGeographic(pickResult[0]);
            var newLon = newLonLat[0];
            var newLat = newLonLat[1];
            this.moveGeo(lon,lat,newLon,newLat);
        }
    },

    moveGeo:function(oldLon,oldLat,newLon,newLat){
        var camera = World.globe.camera;
        var deltaLonRadian = -World.Math.degreeToRadian(newLon-oldLon);//旋转的经度
        var deltaLatRadian = World.Math.degreeToRadian(newLat-oldLat);//旋转的纬度
        camera.worldRotateY(deltaLonRadian);
        var lightDir = camera.getLightDirection();
        var plumbVector = this.getPlumbVector(lightDir);
        camera.worldRotateByVector(deltaLatRadian,plumbVector);
    },

    onMouseDown:function(event){
        if(World.globe){
            this.bMouseDown = true;
            this.previousX = event.layerX||event.offsetX;
            this.previousY = event.layerY||event.offsetY;
            var pickResult = World.globe.camera.getPickCartesianCoordInEarthByCanvas(this.previousX,this.previousY);
            if(pickResult.length > 0){
                this.dragGeo = World.Math.cartesianCoordToGeographic(pickResult[0]);
                console.log("单击点三维坐标:("+pickResult[0].x+","+pickResult[0].y+","+pickResult[0].z+");经纬度坐标:["+this.dragGeo[0]+","+this.dragGeo[1]+"]");
            }
            this.canvas.addEventListener("mousemove",this.onMouseMoveListener,false);
        }
    },

    onMouseMove:function(event){
        var globe = World.globe;
        if(globe && this.bMouseDown){
            var currentX = event.layerX||event.offsetX;
            var currentY = event.layerY||event.offsetY;
            var pickResult = globe.camera.getPickCartesianCoordInEarthByCanvas(currentX,currentY);
            if(pickResult.length > 0){
                //鼠标在地球范围内
                if(this.dragGeo){
                    //鼠标拖动过程中要显示底图
                    //globe.showAllSubTiledLayerAndTiles();
                    var newGeo = World.Math.cartesianCoordToGeographic(pickResult[0]);
                    this.moveGeo(this.dragGeo[0],this.dragGeo[1],newGeo[0],newGeo[1]);
                }
                else{
                    //进入地球内部
                    this.dragGeo = World.Math.cartesianCoordToGeographic(pickResult[0]);
                }
                this.previousX = currentX;
                this.previousY = currentY;
                this.canvas.style.cursor = "pointer";
            }
            else{
                //鼠标超出地球范围
                this.previousX = -1;
                this.previousY = -1;
                this.dragGeo = null;
                this.canvas.style.cursor = "default";
            }
        }
    },

    onMouseUp:function(){
        this.bMouseDown = false;
        this.previousX = -1;
        this.previousY = -1;
        this.dragGeo = null;
        if(this.canvas instanceof HTMLCanvasElement){
            this.canvas.removeEventListener("mousemove",this.onMouseMoveListener,false);
            this.canvas.style.cursor = "default";
        }
    },

    onDbClick:function(event){
        var globe = World.globe;
        if(globe){
            var absoluteX = event.layerX||event.offsetX;
            var absoluteY = event.layerY||event.offsetY;
            var pickResult = globe.camera.getPickCartesianCoordInEarthByCanvas(absoluteX,absoluteY);
            globe.setLevel(globe.CURRENT_LEVEL+1);
            if(pickResult.length >= 1){
                var pickVertice = pickResult[0];
                var lonlat = World.Math.cartesianCoordToGeographic(pickVertice);
                var lon = lonlat[0];
                var lat = lonlat[1];
                globe.setLevel(globe.CURRENT_LEVEL+1);
                this.moveLonLatToCanvas(lon,lat,absoluteX,absoluteY);
            }
        }
    },

    onMouseWheel:function(event){
        var globe = World.globe;
        if(!globe){
            return;
        }

        var deltaLevel = 0;
        if(event.wheelDelta){
            //非Firefox
            var delta = event.wheelDelta;
            deltaLevel = parseInt(delta / 120);
        }
        else if(event.detail){
            //Firefox
            var delta = event.detail;
            deltaLevel = -parseInt(delta / 3);
        }
        var newLevel = globe.CURRENT_LEVEL + deltaLevel;
        globe.setLevel(newLevel);
    },

    onKeyDown:function(event){
        var globe = World.globe;
        if(!globe){
            return;
        }

        var MIN_PITCH = 36;
        var DELTA_PITCH = 2;
        var camera = globe.camera;
        var keyNum = event.keyCode != undefined ? event.keyCode : event.which;
        //上、下、左、右:38、40、37、39
        if(keyNum == 38 || keyNum == 40){
            if(keyNum == 38){
                if(camera.pitch <= MIN_PITCH){
                    return;
                }
            }
            else if(keyNum == 40){
                if(camera.pitch >= 90){
                    return;
                }
                DELTA_PITCH *= -1;
            }

            var pickResult = camera.getDirectionIntersectPointWithEarth();
            if(pickResult.length > 0){
                var pIntersect = pickResult[0];
                var pCamera = camera.getPosition();
                var legnth2Intersect = World.Math.getLengthFromVerticeToVertice(pCamera,pIntersect);
                var mat = camera.matrix.copy();
                mat.setColumnTrans(pIntersect.x,pIntersect.y,pIntersect.z);
                var DELTA_RADIAN = World.Math.degreeToRadian(DELTA_PITCH);
                mat.localRotateX(DELTA_RADIAN);
                var dirZ = mat.getColumnZ().getVector();
                dirZ.setLength(legnth2Intersect);
                var pNew = pIntersect.plus(dirZ);
                camera.look(pNew,pIntersect);
                camera.pitch -= DELTA_PITCH;
                globe.refresh();
            }
            else{
                alert("视线与地球无交点");
            }
        }
    },

    getPlumbVector:function(direction){
        if(!(direction instanceof World.Vector)){
            throw "invalid direction: not World.Vector";
        }
        var dir = direction.getCopy();
        dir.y = 0;
        dir.normalize();
        var plumbVector = new World.Vector(-dir.z,0,dir.x);
        plumbVector.normalize();
        return plumbVector;
    }
};
/////////////////////////////////////////////////////////////////////////////////////////
World.WebGLRenderer = function(canvas,vertexShaderText,fragmentShaderText){
    if(!(canvas instanceof HTMLCanvasElement)){
        throw "invalid canvas: not HTMLCanvasElement";
    }
    if(!(World.Utils.isString(vertexShaderText) && vertexShaderText != "")){
        throw "invalid vertexShaderText";
    }
    if(!(World.Utils.isString(fragmentShaderText) && fragmentShaderText != "")){
        throw "invalid fragmentShaderText";
    }
    window.renderer = this;//之所以在此处设置window.renderer是因为要在tick函数中使用
    this.scene = null;
    this.camera = null;
    this.bAutoRefresh = false;
    World.Event.bindEvents(canvas);

    function initWebGL(canvas){
        try{
            var contextList = ["webgl","experimental-webgl","webkit-3d","moz-webgl"];
            for(var i=0;i<contextList.length;i++){
                var g = canvas.getContext(contextList[i],{antialias:true});
                if(g){
                    window.gl = World.gl = g;
                    World.canvas = canvas;
                    break;
                }
            }
        }
        catch(e){
        }
    }

    function getShader(gl,shaderType,shaderText){
        if(!shaderText){
            return null;
        }

        var shader = null;
        if(shaderType=="VERTEX_SHADER"){
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else if(shaderType=="FRAGMENT_SHADER"){
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        else{
            return null;
        }

        gl.shaderSource(shader,shaderText);
        gl.compileShader(shader);

        if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
            alert(gl.getShaderInfoLog(shader));
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    function initShaders(vertexShaderText,fragmentShaderText){
        var vertexShader = getShader(World.gl,"VERTEX_SHADER",vertexShaderText);
        var fragmentShader = getShader(World.gl,"FRAGMENT_SHADER",fragmentShaderText);

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram,vertexShader);
        gl.attachShader(shaderProgram,fragmentShader);
        gl.linkProgram(shaderProgram);

        if(!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)){
            console.error("Could not link program!");
            gl.deleteProgram(shaderProgram);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            return;
        }

        gl.useProgram(shaderProgram);
        gl.shaderProgram = shaderProgram;
        gl.shaderProgram.aVertexPosition = gl.getAttribLocation(gl.shaderProgram,"aVertexPosition");
        gl.shaderProgram.aTextureCoord = gl.getAttribLocation(gl.shaderProgram,"aTextureCoord");
        gl.shaderProgram.uMVMatrix = gl.getUniformLocation(gl.shaderProgram,"uMVMatrix");
        gl.shaderProgram.uPMatrix = gl.getUniformLocation(gl.shaderProgram,"uPMatrix");
        gl.shaderProgram.uSampler = gl.getUniformLocation(gl.shaderProgram,"uSampler");//纹理采样器
        gl.shaderProgram.uOffScreen = gl.getUniformLocation(gl.shaderProgram,"uOffScreen");//是否离屏渲染

        //设置默认非离屏渲染
        gl.uniform1i(gl.shaderProgram.uOffScreen,1);

        //设置默认值
        var squareArray = [1,0,0,0,
                           0,1,0,0,
                           0,0,1,0,
                           0,0,0,1];
        var squareMatrix = new Float32Array(squareArray);//ArrayBuffer
        gl.uniformMatrix4fv(gl.shaderProgram.uMVMatrix,false,squareMatrix);
    }

    initWebGL(canvas);

    if(!window.gl){
        alert("浏览器不支持WebGL或将WebGL禁用!");
        console.debug("浏览器不支持WebGL或将WebGL禁用!");
        return;
    }
    else{
        ;
    }

    initShaders(vertexShaderText,fragmentShaderText);

    gl.clearColor(255,255,255,1.0);
    //gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.DEPTH_TEST);//此处禁用深度测试是为了解决两个不同层级的切片在拖动时一起渲染会导致屏闪的问题
    gl.depthFunc(gl.LEQUAL);

    gl.enable(gl.CULL_FACE);//一定要启用裁剪，否则显示不出立体感
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);//裁剪掉背面

    //gl.enable(gl.TEXTURE_2D);//WebGL: INVALID_ENUM: enable: invalid capability
};

World.WebGLRenderer.prototype = {
    constructor:World.WebGLRenderer,

    render:function(scene,camera){
        if(!(scene instanceof World.Scene)){
            throw "invalid scene: not World.Scene";
        }
        if(!(camera instanceof World.PerspectiveCamera)){
            throw "invalid camera: not World.PerspectiveCamera";
        }
        gl.viewport(0,0,World.canvas.width,World.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        camera.viewMatrix = null;
        camera.viewMatrix = camera.getViewMatrix();
        scene.draw(camera);
    },

    bindScene : function(scene){
        if(!scene instanceof World.Scene){
            throw "invalid scene: not World.Scene";
        }
        this.scene = scene;
    },

    bindCamera : function(camera){
        if(!camera instanceof World.PerspectiveCamera){
            throw "invalid camera: not World.PerspectiveCamera";
        }
        this.camera = camera;
    },

    tick : function(){
        if(World.renderer instanceof World.WebGLRenderer){
            if(World.renderer.scene && World.renderer.camera){
                World.renderer.render(World.renderer.scene,World.renderer.camera);
            }

            if(World.renderer.bAutoRefresh){
                window.requestAnimationFrame(World.renderer.tick);
            }
        }
    },

    setIfAutoRefresh : function(bAuto){
        if(!World.Utils.isBool(bAuto)){
            throw "invalid bAuto: not bool";
        }
        this.bAutoRefresh = bAuto;
        if(this.bAutoRefresh){
            this.tick();
        }
    }
};
/////////////////////////////////////////////////////////////////////////////////////////////////
World.Scene = function(args){
    World.Object3DComponents.apply(this,arguments);
};
World.Scene.prototype = new World.Object3DComponents();
World.Scene.prototype.constructor = World.Scene;
/////////////////////////////////////////////////////////////////////////////////////////////
//缓存图片信息1、2、3、4级的图片信息
World.Image = {
    MAX_LEVEL:4,//缓存图片的最大level
    images:{}
};
World.Image.add = function(url,img){
    if(!World.Utils.isString(url)){
        throw "invalid url: not string";
    }
    if(!(img instanceof HTMLImageElement)){
        throw "invalid img: not HTMLImageElement";
    }
    this.images[url] = img;
};
World.Image.get = function(url){
    if(!World.Utils.isString(url)){
        throw "invalid url: not string";
    }
    return this.images[url];
};
World.Image.remove = function(url){
    if(!(World.Utils.isString(url))){
        throw "invalid url: not string";
    }
    delete this.images[url];
};
World.Image.clear = function(){
    this.images = {};
};
World.Image.getCount = function(){
    var count = 0;
    for(var url in this.images){
        if(this.images.hasOwnProperty(url)){
            count++;
        }
    }
    return count;
};
/////////////////////////////////////////////////////////////////////////////////////////////
World.Elevation = {
    //sampleserver4.arcgisonline.com
    //23.21.85.73
    elevationUrl:"http://sampleserver4.arcgisonline.com/ArcGIS/rest/services/Elevation/ESRI_Elevation_World/MapServer/exts/ElevationsSOE/ElevationLayers/1/GetElevationData",
    elevations:{},//缓存的高程数据
    factor:1//高程缩放因子
};
//根据level获取包含level高程信息的ancestorElevationLevel
World.Elevation.getAncestorElevationLevel = function(level){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    var a = Math.floor((level - 1 - World.ELEVATION_LEVEL) / 3);
    var ancestor = World.ELEVATION_LEVEL + 3 * a;
    return ancestor;
};

/**
 * 根据传入的extent以及行列数请求高程数据，返回(segment+1) * (segment+1)个数据，且乘积不能超过10000
 * 也就是说如果传递的是一个正方形的extent，那么segment最大取99，此处设置的segment是80
 */
World.Elevation.requestElevationsByTileGrid = function(level,row,column){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    if(!World.Utils.isNonNegativeInteger(row)){
        throw "invalid row";
    }
    if(!World.Utils.isNonNegativeInteger(column)){
        throw "invalid column";
    }
    var segment = 80;
    var name = level+"_"+row+"_"+column;
    //只要elevations中有属性name，那么就表示该高程已经请求过或正在请求，这样就不要重新请求了
    //只有在完全没请求过的情况下去请求高程数据
    if(this.elevations.hasOwnProperty(name)){
        return;
    }
    this.elevations[name] = null;
    var Eproj = World.Math.getTileWebMercatorEnvelopeByGrid(level,row,column);
    var minX = Eproj.minX;
    var minY = Eproj.minY;
    var maxX = Eproj.maxX;
    var maxY = Eproj.maxY;
    var gridWidth = (maxX - minX)/segment;
    var gridHeight = (maxY - minY)/segment;
    var a = gridWidth/2;
    var b = gridHeight/2;
    var extent = {
        xmin:minX - a,
        ymin:minY - b,
        xmax:maxX + a,
        ymax:maxY + b,
        spatialReference:{wkid:102100}
    };
    var strExtent = encodeURIComponent(JSON.stringify(extent));
    var rows = segment+1;
    var columns = segment+1;
    var f = "pjson";
    var args = "Extent="+strExtent+"&Rows="+rows+"&Columns="+columns+"&f="+f;
    var xhr = new XMLHttpRequest();
    function callback(){
        if(xhr.readyState == 4 && xhr.status == 200){
            try{
                var result = JSON.parse(xhr.responseText);
                if(this.factor == 1){
                    this.elevations[name] = result.data;
                }
                else{
                    this.elevations[name] = World.Utils.map(function(item){
                        return item*this.factor
                    }.bind(this));
                }
            }
            catch(e){
                console.error("requestElevationsByTileGrid_callback error",e);
            }
        }
    }
    xhr.onreadystatechange = callback.bind(this);
    xhr.open("GET","proxy.jsp?"+this.elevationUrl+"?"+args,true);
    xhr.send();
};


//无论怎样都尽量返回高程值，如果存在精确的高程，就获取精确高程；如果精确高程不存在，就返回上一个高程级别的估算高程
//有可能
World.Elevation.getElevation = function(level,row,column){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    if(!World.Utils.isNonNegativeInteger(row)){
        throw "invalid row";
    }
    if(!World.Utils.isNonNegativeInteger(column)){
        throw "invalid column";
    }
    var result = null;
    var exactResult = this.getExactElevation(level,row,column);
    if(exactResult){
        //获取到准确高程
        result = exactResult;
    }
    else{
        //获取插值高程
        result = this.getLinearElevation(level,row,column);
    }
    return result;
};

//把>=8级的任意一个切片的tileGrid传进去，返回其高程值，该高程值是经过过滤了的，就是从大切片数据中抽吸出了其自身的高程信息
//获取准确高程
World.Elevation.getExactElevation = function(level,row,column){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    if(!World.Utils.isNonNegativeInteger(row)){
        throw "invalid row";
    }
    if(!World.Utils.isNonNegativeInteger(column)){
        throw "invalid column";
    }
    var result = null;
    var elevationLevel = this.getAncestorElevationLevel(level);
    var elevationTileGrid = World.Math.getTileGridAncestor(elevationLevel,level,row,column);
    var elevationTileName = elevationTileGrid.level+"_"+elevationTileGrid.row+"_"+elevationTileGrid.column;
    var ancestorElevations = this.elevations[elevationTileName];
    if(ancestorElevations instanceof Array && ancestorElevations.length > 0){
        if(level > World.ELEVATION_LEVEL){
            //ltTileGridLevel表示level级别下位于Tile7左上角的TileGrid
            var ltTileGridLevel = {level:elevationTileGrid.level,row:elevationTileGrid.row,column:elevationTileGrid.column};//与level在同级别下但是在Tile7左上角的那个TileGrid
            while(ltTileGridLevel.level != level){
                ltTileGridLevel = World.Math.getTileGridByParent(ltTileGridLevel.level,ltTileGridLevel.row,ltTileGridLevel.column,World.Math.LEFT_TOP);
            }
            if(ltTileGridLevel.level == level){
                //bigRow表示在level等级下当前grid距离左上角的grid的行数
                var bigRow = row - ltTileGridLevel.row;
                //bigColumn表示在level等级下当前grid距离左上角的grid的列数
                var bigColumn = column - ltTileGridLevel.column;
                var a = 81;//T7包含(80+1)*(80+1)个高程数据
                var deltaLevel = (elevationLevel+3) - level;//当前level与T10相差的等级
                var deltaCount = Math.pow(2,deltaLevel);//一个当前tile能包含deltaCount*deltaCount个第10级的tile
                //startSmallIndex表示该tile的左上角点在81*81的点阵中的索引号
                //bigRow*deltaCount表示当前切片距离T7最上面的切片的行包含了多少T10行，再乘以10表示跨过的高程点阵行数
                //bigColumn*deltaCount表示当前切片距离T7最左边的切片的列包含了多少T10列，再乘以10表示跨国的高程点阵列数
                var startSmallIndex = (bigRow * deltaCount * 10) * a + bigColumn * deltaCount * 10;
                result = {
                    sourceLevel:elevationLevel,
                    elevations:[]
                };
                for(var i=0;i<=10;i++){
                    var idx = startSmallIndex;
                    for(var j=0;j<=10;j++){
                        var ele = ancestorElevations[idx];
                        result.elevations.push(ele);
                        idx += deltaCount;
                    }
                    //遍历完一行之后往下移，startSmallIndex表示一行的左边的起点
                    startSmallIndex += deltaCount * a;
                }
            }
        }
    }
    return result;
};

//获取线性插值的高程，比如要找E12的估算高程，那么就先找到E10的精确高程，E10的精确高程是从E7中提取的
//即E7(81*81)->E10(11*11)->插值计算E11、E12、E13
World.Elevation.getLinearElevation = function(level,row,column){
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    if(!World.Utils.isNonNegativeInteger(row)){
        throw "invalid row";
    }
    if(!World.Utils.isNonNegativeInteger(column)){
        throw "invalid column";
    }
    var result = null;
    var elevationLevel = this.getAncestorElevationLevel(level);
    var elevationTileGrid = World.Math.getTileGridAncestor(elevationLevel,level,row,column);
    var exactAncestorElevations = this.getExactElevation(elevationTileGrid.level,elevationTileGrid.row,elevationTileGrid.column);
    var deltaLevel = level - elevationLevel;
    if(exactAncestorElevations){
        result = {
            sourceLevel:elevationLevel-3,
            elevations:null
        };
        if(deltaLevel == 1){
            result.elevations = this.getLinearElevationFromParent(exactAncestorElevations,level,row,column);
        }
        else if(deltaLevel == 2){
            result.elevations = this.getLinearElevationFromParent2(exactAncestorElevations,level,row,column);
        }
        else if(deltaLevel == 3){
            result.elevations = this.getLinearElevationFromParent3(exactAncestorElevations,level,row,column);
        }
    }
    return result;
};

//从直接父节点的高程数据中获取不是很准确的高程数据，比如T11从E10的高程中(10+1)*(10+1)中获取不是很准确的高程
//通过线性插值的方式获取高程，不精确
World.Elevation.getLinearElevationFromParent = function(parentElevations,level,row,column){
    if(!(World.Utils.isArray(parentElevations) && parentElevations.length > 0)){
        throw "invalid parentElevations";
    }
    if(!World.Utils.isNonNegativeInteger(level)){
        throw "invalid level";
    }
    if(!World.Utils.isNonNegativeInteger(row)){
        throw "invalid row";
    }
    if(!World.Utils.isNonNegativeInteger(column)){
        throw "invalid column";
    }
    //position为切片在直接父切片中的位置
    var position = World.Math.getTilePositionOfParent(level,row,column);
    //先从parent中获取6个半行的数据
    var elevatios6_6 = [];
    var startIndex = 0;
    if(position == World.Math.LEFT_TOP){
        startIndex = 0;
    }
    else if(position == World.Math.RIGHT_TOP){
        startIndex = 5;
    }
    else if(position == World.Math.LEFT_BOTTOM){
        startIndex = 11*5;
    }
    else if(position == World.Math.RIGHT_BOTTOM){
        startIndex = 60;
    }
    for(var i=0;i<=5;i++){
        var idx = startIndex;
        for(var j=0;j<=5;j++){
            var ele = parentElevations[idx];
            elevatios6_6.push(ele);
            idx++;
        }
        //下移一行
        startIndex += 11;
    }
    //此时elevatios6_6表示的(5+1)*(5+1)的高程数据信息

    //下面通过对每一行上的6个点数字两两取平均变成11个点数据
    var elevations6_11 = [];
    for(var i=0;i<=5;i++){
        for(var j=0;j<=5;j++){
            var idx = 6*i+j;
            var eleExact = elevatios6_6[idx];
            if(j>0){
                var eleExactLeft = elevatios6_6[idx-1];
                var eleLinear = (eleExactLeft+eleExact)/2;
                elevations6_11.push(eleLinear);
            }
            elevations6_11.push(eleExact);
        }
    }
    //此时elevations6_11表示的是(5+1)*(10+1)的高程数据信息，对每行进行了线性插值

    //下面要对每列进行线性插值，使得每列上的6个点数字两两取平均变成11个点数据
    var elevations11_11 = [];
    for(var i=0;i<=5;i++){
        for(var j=0;j<=10;j++){
            var idx = 11*i+j;
            var eleExact = elevations6_11[idx];
            if(i>0){
                var eleExactTop = elevations6_11[idx-11];
                var eleLinear = (eleExactTop+eleExact)/2;
                elevations11_11[(2*i-1)*11+j] = eleLinear;
            }
            elevations11_11[2*i*11+j] = eleExact;
        }
    }
    //此时elevations11_11表示的是(10+1)*(10+1)的高程数据信息

    return elevations11_11;
};

//从相隔两级的高程中获取线性插值数据，比如从T10上面获取T12的高程数据
//parent2Elevations是(10+1)*(10+1)的高程数据
//level、row、column是子孙切片的信息
World.Elevation.getLinearElevationFromParent2 = function(parent2Elevations,level,row,column){
    var parentTileGrid = World.Math.getTileGridAncestor(level-1,level,row,column);
    var parentElevations = this.getLinearElevationFromParent(parent2Elevations,parentTileGrid.level,parentTileGrid.row,parentTileGrid.column);
    var elevations = this.getLinearElevationFromParent(parentElevations,level,row,column);
    return elevations;
};

//从相隔三级的高程中获取线性插值数据，比如从T10上面获取T13的高程数据
//parent3Elevations是(10+1)*(10+1)的高程数据
//level、row、column是重孙切片的信息
World.Elevation.getLinearElevationFromParent3 = function(parent3Elevations,level,row,column){
    var parentTileGrid = World.Math.getTileGridAncestor(level-1,level,row,column);
    var parentElevations = this.getLinearElevationFromParent2(parent3Elevations,parentTileGrid.level,parentTileGrid.row,parentTileGrid.column);
    var elevations = this.getLinearElevationFromParent(parentElevations,level,row,column);
    return elevations;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
World.Globe = function(canvas,args){
    if(!(canvas instanceof HTMLCanvasElement)){
        throw "invalid canvas: not HTMLCanvasElement";
    }
    args = args||{};
    World.globe = this;
    this.MAX_LEVEL = 15;//最大的渲染级别15
    this.CURRENT_LEVEL = -1;//当前渲染等级
    this.REFRESH_INTERVAL = 300;//Globe自动刷新时间间隔，以毫秒为单位
    this.idTimeOut = null;//refresh自定刷新的timeOut的handle
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.tiledLayer = null;
    var vs_content = World.ShaderContent.SIMPLE_SHADER.VS_CONTENT;
    var fs_content = World.ShaderContent.SIMPLE_SHADER.FS_CONTENT;
    this.renderer = World.renderer = new World.WebGLRenderer(canvas,vs_content,fs_content);

//    var W = World.canvas.width;
//    var H = World.canvas.height;

//    World.frameBuffer = gl.createFramebuffer();
//    gl.bindFramebuffer(gl.FRAMEBUFFER,World.frameBuffer);
//
////    World.depthTexture = gl.createTexture();
////    gl.bindTexture(gl.TEXTURE_2D,World.depthTexture);
////    gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT,W,H,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_SHORT,null);
////    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
////    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
////    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
////    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
////    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,World.depthTexture,0);
//
//    World.depthRendererBuffer = gl.createRenderbuffer();
//    gl.bindRenderbuffer(gl.RENDERBUFFER,World.depthRendererBuffer);
//    gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,W,H);
//    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,World.depthRendererBuffer);
//    gl.bindRenderbuffer(gl.RENDERBUFFER,null);
//
//    World.texture = gl.createTexture();
//    gl.bindTexture(gl.TEXTURE_2D,World.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
//    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
//    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
//    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
//    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
//    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,World.texture,0);
//    gl.bindTexture(gl.TEXTURE_2D,null);
//
//    gl.bindFramebuffer(gl.FRAMEBUFFER,null);


    this.scene = new World.Scene();
    var radio = canvas.width / canvas.height;
    this.camera = new World.PerspectiveCamera(30,radio,1.0,20000000.0);
    this.renderer.bindScene(this.scene);
    this.renderer.bindCamera(this.camera);
    this.setLevel(0);
    this.renderer.setIfAutoRefresh(true);
    World.Event.initLayout();
};
World.Globe.prototype = {
    constructor:World.Globe,

    setTiledLayer:function(tiledLayer){
        if(!(tiledLayer instanceof World.TiledLayer)){
            throw "invalid tiledLayer: not World.TiledLayer";
        }

        clearTimeout(this.idTimeOut);
        //在更换切片图层的类型时清空缓存的图片
        World.Image.clear();
        if(this.tiledLayer){
            var b = this.scene.remove(this.tiledLayer);
            if(!b){
                console.error("this.scene.remove(this.tiledLayer)失败");
            }
            this.scene.tiledLayer = null;
        }
        this.tiledLayer = tiledLayer;
        this.scene.add(this.tiledLayer);
        //添加第0级的子图层
        var subLayer0 = new World.SubTiledLayer({level:0});
        this.tiledLayer.add(subLayer0);

        //要对level为1的图层进行特殊处理，在创建level为1时就创建其中的全部的四个tile
        var subLayer1 = new World.SubTiledLayer({level:1});
        this.tiledLayer.add(subLayer1);
        World.canvas.style.cursor = "wait";
        for(var m=0;m<=1;m++){
            for(var n=0;n<=1;n++){
                var args = {level:1,row:m,column:n,url:""};
                args.url = this.tiledLayer.getImageUrl(args.level,args.row,args.column);
                var tile = new World.Tile(args);
                subLayer1.add(tile);
            }
        }
        World.canvas.style.cursor = "default";
        this.tick();
    },

    setLevel:function(level){
        if(!World.Utils.isInteger(level)){
            throw "invalid level";
        }
        if(level < 0){
            return;
        }
        level = level > this.MAX_LEVEL ? this.MAX_LEVEL : level;//超过最大的渲染级别就不渲染
        if(level != this.CURRENT_LEVEL){
            if(this.camera instanceof World.PerspectiveCamera){
                //要先执行camera.setLevel,然后再刷新
                this.camera.setLevel(level);
                this.refresh();
            }
        }
    },

    /**
     * 返回当前的各种矩阵信息:视点矩阵、投影矩阵、两者乘积，以及前三者的逆矩阵
     * @returns {{View: null, _View: null, Proj: null, _Proj: null, ProjView: null, _View_Proj: null}}
     * @private
     */
    _getMatrixInfo:function(){
        var options = {
            View:null,//视点矩阵
            _View:null,//视点矩阵的逆矩阵
            Proj:null,//投影矩阵
            _Proj:null,//投影矩阵的逆矩阵
            ProjView:null,//投影矩阵与视点矩阵的乘积
            _View_Proj:null//视点逆矩阵与投影逆矩阵的乘积
        };
        options.View = this.getViewMatrix();
        options._View = options.View.getInverseMatrix();
        options.Proj = this.projMatrix;
        options._Proj = options.Proj.getInverseMatrix();
        options.ProjView = options.Proj.multiplyMatrix(options.View);
        options._View_Proj = options.ProjView.getInverseMatrix();
        return options;
    },

    tick:function(){
        var globe = World.globe;
        if(globe){
            globe.refresh();
            this.idTimeOut = setTimeout(globe.tick,globe.REFRESH_INTERVAL);
        }
    },

    refresh:function(){
        if(!this.tiledLayer || !this.scene || !this.camera){
            return;
        }
        var level = this.CURRENT_LEVEL + 3;
        this.tiledLayer.updateSubLayerCount(level);
        var projView = this.camera.getProjViewMatrix();
        var options = {projView:projView,threshold:1};
        options.threshold = Math.min(90/this.camera.pitch,1.5);
        //最大级别的level所对应的可见TileGrids
        var lastLevelTileGrids = this.camera.getVisibleTilesByLevel(level,options);
        var levelsTileGrids = [];//level-2
        var parentTileGrids = lastLevelTileGrids;
        for(var i=level;i>=2;i--){
            levelsTileGrids.push(parentTileGrids);//此行代码表示第i层级的可见切片
            parentTileGrids = World.Utils.map(parentTileGrids,function(item){
                return item.getParent();
            });
            parentTileGrids = World.Utils.filterRepeatArray(parentTileGrids);
        }
        levelsTileGrids.reverse();//2-level
        for(var i=2;i<=level;i++){
            var subLevel = i;
            var subLayer = this.tiledLayer.children[subLevel];
            subLayer.updateTiles(levelsTileGrids[0],true);
            levelsTileGrids.splice(0,1);
        }
        if(World.TERRAIN_ENABLED){
            this.requestElevationsAndCheckTerrain();
        }
    },

    //请求更新高程数据，并检测Terrain
    requestElevationsAndCheckTerrain:function(){
        var level = this.tiledLayer.children.length - 1;
        //当level>7时请求更新高程数据
        //请求的数据与第7级的切片大小相同
        //if(level > World.ELEVATION_LEVEL){

        //达到TERRAIN_LEVEL级别时考虑三维请求
        if(level >= World.TERRAIN_LEVEL){
            for(var i=World.ELEVATION_LEVEL+1;i<=level;i++){
                var subLayer = this.tiledLayer.children[i];
                subLayer.requestElevations();
                //检查SubTiledLayer下的子图层是否符合转换成TerrainTile的条件，如果适合就自动以三维地形图显示
                if(i>=World.TERRAIN_LEVEL){
                    subLayer.checkTerrain();
                }
            }
        }
    }
};