 - 0.0.4.4 优化了判断切片是否可见的算法，使用经纬度判断法(isTileVisible2)取代了老式的计算方法(isTileVisible)

 - 0.0.4.5 继续优化isTileVisible算法，许多参数从函数外面传递进来，比如geoExtent和projViewMatrix，循环传递使用，减少了生成这两个变量所调用函数的次数；引入了World.Globe，将一些处理逻辑放到了Globe中，比如讲renderer中的updateGlobe方法迁移到Globe中的refresh方法，尽量只对二次开发人员暴露World.Globe的接口，更合理一些，从而将版本从0.0.4.4升级到0.0.4.5

 - 0.0.4.6 不再通过ajax获取vertexShader和fragmentShader的文本内容，而是将其以字符串的形式直接放入到World.js文件中(World.ShaderContent)，从而减少了对于其他GLSL文件的依赖，并因此将World.js的版本升级到0.0.4.6

 - 0.0.4.7 新增了World.TiledLayer类型，取消掉了World.NokiaTile等类型，图层都继承自World.TiledLayer，并重写其中的getImageUrl方法，所有的切片都放到World.TiledLayer中进行管理，结构化明确，更加面向对象，因此将版本升级到0.0.4.7

 - 0.0.5.0 从0.0.4.7直接升级到0.0.5.0,在TiledLayer的基础上又增加了SubTiledLayer类，并在此基础上优化了诸多算法，包括通过添加isvisible判断是否渲染，完善了camera的getCurrentGeoExtent算法，结构更合理，访问速度更快，故升级到0.0.5.0

 - 0.0.5.1 优化了各种TiledLayer的getImageUrl的算法

 - 0.0.5.2

   - gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);

   - gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);

   - 通过执行以上命令消除了两个切片之间的白线问题

 - 0.0.5.3 从0.0.5.2升级到0.0.5.3:globe中增加了calculateCameraMoveInfo方法，在大比例尺下移动视图也比较正常

 - 0.0.5.4 升级到0.0.5.4：在World.Object3D的destroy方法中释放了显卡中的各种buffer和texture资源

 - 0.0.5.5 在render方法中计算了viewMatrix并赋值给camera作为其中的一个属性，这样就只调用一次getViweMatrix方法，不用在draw(camera)中再多次计算

 - 0.0.5.6 在创建level为1的subTiledLayer的时候就全部创建其下的四个切片，并且从不删除该subTiledLayer;将自动更新时间设置为750毫秒

 - 0.0.5.7 添加了World.BingTiledLayer，支持微软Bing地图渲染（有三种风格:a、r、h）

 - 0.0.5.8 添加了World.SosoTiledLayer，支持soso地图

 - 0.0.5.9 添加了World.TiandituTiledLayer，支持天地图

 - 0.0.6.0 通过添加代理页proxy.jsp可以加载ArcGIS的切片地图，包括ArcGISOnline以及捷泰地图，或其他ArcGIS Server发布的地图服务

 - 0.0.6.1 通过代理方式支持高德地图

 - 0.0.6.2 用bind方式代替闭包实现World.TextureMaterial.prototype.setImageUrl中handleLoadedTexture操作texture

 - 0.0.6.3 在Matrix和Object3D中加入对worldScale和localScale的支持

 - 0.0.6.4 在Matrix和Object3D中加入对localRotateByVector的支持

 - 0.0.6.5 修复了在层级比较大的情况下切片不能完全正常匹配的问题，解决办法是取消掉了对切片范围的一像素扩容

 - 0.0.6.6 将World.Scene继承自World.Object3DComponents,减少冗余代码，结构也更合理，也因此调整了World.js中各代码块的位置

 - 0.0.6.7 在拖动鼠标时，鼠标拖动点与经纬度进行了绑定，实现定点拖动

 - 0.0.6.8 将CanvasEventHandler.js中的事件代码移植到World.Event中，以后在html页面中只需要引入World.js一个js文件即可

 - 0.0.6.9 修改了camera中的isLonVisible方法，将其精简完善，从而解决了在伦敦中央经线附近在14级时一片漆黑的问题

 - 0.0.7.0 修改了无法删除canvas的onMouseMove事件的问题

 - 0.0.7.1 修改了将视图缩放到中国区域范围的时候，camera.getGeoExtent()获取的经纬度不准确的问题，原因是在计算由于地球自身视线遮挡的经度范围时，只是简单的在中心经度上加减偏移量，对于如果中心点的纬度为0时是正确的，只要中心点纬度不为0，这种简单的加减经度偏移量是不准确的

 - 0.0.7.2 完善了各种坐标系之间坐标的换算

 - 0.0.7.3 基本完成camera.getExtentInfo的编写,准备用其替换camera.getGeoExtent方法，并添加了camera.isGeoVisibleInCanvas方法

 - 0.0.7.4 继续晚上camera.getExtentInfo方法，在沿着经线上下偏移纬度时不准确，比如65+40=105>90，导致其超出[-90,90]的范围，现在会确保其范围是正确的，但是有可能把范围算大了

 - 0.0.7.5 完成camera.getExtentInfo方法的重写，并对老旧代码删除，用新代码替换老代码

 - 0.0.7.6 以前为了优化效率，在很多地方设置了SubTiledLayer的isvisible和Tile的isvisible都为false，但是体验效果却不好，经常会拿level1来作为保底图层；现在只要camera变化了就将所有SubTiledLayer和Tile的isvisible都设置为true，体验效果好，只有在camera位置没有发生变化，且level最大的那级图层的所有切片都已加载的情况下（即SubTiledLayer.checkIfLoaded为true）时才会将无需显示的那些SubTiledLayer的isvisible属性置为false

 - 0.0.7.7 将MAX_LEVEL、CURRENT_LEVEL、BELOW_LEVEL、OLD_POSITION属性从World中迁移如World.Globe中，更合理

 - 0.0.7.8 完善了onMouseMove事件代码，提供与Google New Map一样的体验

 - 0.0.7.9 修改完善了getPickDirectionByNDC方法，ndcZ传入0.1而非0.5,0.5在某些情况下会导致计算的w为0

 - 0.0.8.0 将ndcZ最终改为0.499,没发现问题；并且在camera.isTileVisible方法内通过判断切片斜对角线的长度是否均小于0.1来决定不可见或可见，这对于倾斜视角下很有用，会剔除掉那些面积很小的切片，直接用面积比较不如用斜对角线长度比较实用，并因此在任意时刻都渲染全部的切片，去掉了checkIfLoaded的优化代码

 - 0.0.8.1 打算重写算法，添加了两个重要的方法camera.getVisibleTilesByLevel和getTileVisibleInfo，直接从第level级获取可见的切片，无需从第0级依次遍历

 - 0.0.8.2 重写了算法，不再根据经纬度依次从第1级开始判断，直接通过camera.getVisibleTilesByLevel获取第level级别的可见切片，即使缩放到20级，内存也在170M左右，而且很流畅，删除了以前的老代码，实现重大升级

 - 0.0.8.3 加入World.Elevation代码，用于请求高程数据，开始改造Object3D和Tile的相关方法，使其能根据传入的vertice等信息动态更改buffer

 - 0.0.8.4 实现最最基础的三维地形图

 - 0.0.8.5 上一版本的World.Elevation.getElevationByCache有问题，现在已修改完善，正确计算切片高程的起点索引值

 - 0.0.8.8 重写了Tile.handleTile方法，将老的方法命名为handTile2，但没有删除，新的handleTile方法从左上角至右下角遍历，并且多个三角形公用同一个顶点

 - 0.1.0 将Globe.js拆分成多个AMD模块，AMD代码放在js目录下；并将AMD代码用TypeScript重新实现，放到ts目录下，并对原有AMD的代码进行微调：解除了Vertice与Vector之间的相互引用，解除了Math与TileGrid之间的相互引用；通过gulp分别实现了对AMD和TypeScript代码进行编译压缩，通过requirejs均可加载相应bundle代码

 - 0.1.1 在js和ts中均修复了在两极地区抖动的问题：world/Event#moveGeo()

 - 0.2 引入World.js中的许多类的设计理念，包括Program、GraphicGroup、Graphic、Geometry、Material、VertexBufferObject等，现在SubTiledLayer和TiledLayer都继承自GraphicGroup，并且让Tile继承自于Graphic

 - 0.2.1 修复了在leve 15及以上的情况下，拖动地图导致地图空白的问题，见issue#9

 - 0.2.2 删除高程相关代码

 - 0.2.3 将world/geometries/Geomtry重命名为world/geometries/Mesh，并在package.json中添加了多个npm scripts，对应gulp中定义的tasks

 - 0.2.4 之前EARTH_RADIUS的值为6378137，特别大，导致了深度值计算有问题，从而使得深度测试不能正常进行。将EARTH_RADIUS改成14000，使得深度测试可以正常进行。并加入了Poi和PoiLayer这两个类。

 - 0.3.0
   - 将EARTH_RADIUS从14000改为500，在0-10级的时候，通过改变Camera的position实现缩放，在10级之后通过改变fov实现缩放。
   - Camera中所有的计算（比如计算视野中的可见切片）都是基于matrix、viewMatrix、projMatrix和projViewMatrix。
   - 但是实际传递给shader用于绘图的是projViewMatrixForDraw。Camera.getPickCartesianCoordInEarthByCanvas()方法也是基于projViewMatrixForDraw系列矩阵的。
   - 该版本提高了深度值的精度，基本解决了z值精度问题。在update()方法中会计算projViewMatrixForDraw系列矩阵。

 - 0.3.1 使得Globe.animateToLevel()可以在0.3.0的版本上运行，解决办法是引入了camera.animationLevel，其值是非整数。

 - 0.3.2 优化了Camera.update()方法，只有发生用户交互的情况下才实际进行计算。

 - 0.3.3 优化了Globe.refresh()方法，只有发生用户交互的情况下才重新计算可见切片。

 - 0.3.4 增加了Atmosphere效果。

 - 0.3.5 优化了切片加载的算法：
   - 当MeshTextureMaterial执行destroy的时候，取消掉原有的图片请求；
   - 当缩放的时候，不会请求父级别以及父父级别的切片。比如缩放到第15级的时候，不再请求第13和14级的切片，但是会请求12级及以前的切片，减少了图片请求的数量。

 - 0.3.6
   - 使得PoiLayer能基本搜索POI并将其显示；
   - 为IE11等浏览器添加ES6方法的polyfill；
   - 在Matrix中用Float64Array存储数据，并同时提供getFloat32Array()方法以便给Shader传递Float32Array类型的数据（Shader不支持Float64Array）。

 - 0.3.7 删除Poi类，并让PoiLayer继承自Graphic，每次OnDraw()的时候将所有poi点的坐标动态赋值给buffer，大幅减少了绘图命令的调用，提高了FPS。

 - 0.3.8 在TiledLayer中为program中的uniform变量设置值，减少了WebGL命令的调用次数。

 - 0.3.9 用webpack代替gulp作为打包工具

 - 0.3.10 每次渲染之前都会检查Camera是否发生变化，如果变化则更新切片列表，并且保证Canvas八个角点都有保底的可见切片，不再从level1全部渲染切片，减少WebGL绘图命令

 - 0.3.11 修复了0.3.10里面的一个bug

 - 0.3.12 使得GoogleTiledLayer可以使用，并且为GoogleTiledLayer和OsmTiledLayer增加了多种Style

 - 0.3.13 添加LabelLayer和AutonaviLabelLayer，叠加GoogleTiledLayer，取得了较好的效果

 - 0.3.14 在移动端浏览器上面可以通过手势缩放

 - 0.3.15 添加了TrafficLayer、SosoTrafficLayer、QihuTrafficLayer，可以查看实时交通

 - 0.3.16 使得QihuTrafficLayer可以运行

 - 0.3.17 添加Location模块，监听位置变化

 - 0.3.18 在Camera中增加了resolution相关的方法，并可以通过Camera.getBestDisplayLevel()方法获取当前摄像机位置下最优的显示层级的切片

 - 0.4.0
   - 去除了level和lastLevel的概念，只保留一个概念：renderingLevel，renderingLevel即相当于之前的lastLevel，表示最后渲染切片的级别；
   - 增加了calculateDistance2EarthOriginByResolution()和calculateResolutionAndBestDisplayLevelByDistance2EarthOrigin()等相关方法，并依据这些方法完成Camera位置与renderingLevel之间的映射

 - 0.4.1 将renderingLevel重命名为level，将set/getRenderingLevel()重命名为set/getLevel()

 - 0.4.2 重命名Camera中的相关方法

 - 0.4.3 向Camera添加isEarthFullOverlapScreen()等方法

 - 0.4.4 默认显示当前位置

 - 0.4.5 添加Travis CI服务，在每次push代码的时候进行测试，在README.md中添加了各种Badge

 - 0.4.6 增加了GlobeOptions类，为Globe构造函数传递参数

 - 0.4.7 修复Camera中setDeltaPitch的bug

 - 0.4.8 使用Webpack加载图片、分离JavaScript与CSS、基于文件内容生成hash

 - 0.4.9 当level>=10时可以进行POI搜索，并且当地图范围变化时会重新动态搜索

 - 0.4.10 开发模式下，启用SourceMap

 - 0.4.11
   - 分离core和webapp目录，基本搭建起了webapp的路由机制，基本完成首页界面
   - 将所有服务都放入到Service类中，并添加searchNearby接口
   - 将core中的import require改成import from

 - 0.4.12 使用更加快速的城市级别的定位服务，明显缩短定位时间

 - 0.4.13
   - 添加MultiPointsGraphic类，并让PoiLayer继承自该类
   - 通过配置tsconfig.json删除了很多无用的import和变量

 - 0.4.14
   - versions.txt -> versions.md
   - 基本完成附近搜索功能，将搜索结果分页显示

 - 0.4.15
   - 阻止隐藏地址栏
   - 处理文本框和软键盘
   - 对nearby/Search和nearby/Result的UI做了增强

 - 0.4.16 从Kernel中删除了globe和canvas属性

 - 0.4.17
   - 设置Globe的构造函数为私有方法，只能通过静态方法getInstance获取其单例
   - 将Globe包装成React组件

 - 0.4.18
   - 优化定位逻辑
   - 将附近搜索的结果在地图中显示

 - 0.4.19
   - 使用WebGLRenderingContext引用WebGL静态常量
   - 在绘制PoiLayer时禁用深度测试

 - 0.4.20
   - 在Service中添加searchByCurrentCity接口
   - 为Globe添加pause和resume方法，在React组件中调用

 - 0.4.21
   - 添加RouteComponent，所有routes目录下的Component均继承自它，异步操作会显示loading
   - 对附近搜索无结果的情况进行友好显示

 - 0.4.22
   - 继续完善index/Nav页面
   - 添加了路线规划相关的服务

- 0.4.23
   - 完善Service.gaodeRouteByDriving()方法
   - MeshGraphic => MeshTextureGraphic
   - 添加MeshColorGraphic

 - 0.4.24 RouteLayer基本可以实现固定宽度的Polyline

 - 0.4.25 更新webpack.config.js

 - 0.4.26 Camera中添加centerTo和animateTo方法

 - 0.4.27 Camera中添加setExtent和animateToExtent方法

 - 0.4.28 通过判断道路拐点解决"箭头道路"的问题

 - 0.4.29 可以在nav/Paths页面中直接切换出行方式重新进行路线规划

 - 0.4.30 在RouteComponent中添加getPreviousLocation()方法，并在nearyby/Result中使用

 - 0.4.31 在公交导航中支持火车出行

 - 0.4.32 通过http://fontello.com/ 自定义FontAwesome

 - 0.4.33 Globe构造函数支持pauseRendering参数，可以实现切片延迟加载

 - 0.4.34 searchByBuffer和searchByCity支持SearchType参数，可以智能判断类型，并且可以在查询无结果的情况下改变SearchType再次查询，优化查询体验

 - 0.4.35 iOS系统中的浏览器不能访问类WebGLRenderingContext的静态常量，将所有用到WebGLRenderingContext的地方重新改成Kernel.gl的形式，用实例常量访问即可修复iOS中无法渲染的严重bug

 - 0.4.36 更新webpack.config.js文件，在生产环境中配置new webpack.DefinePlugin，将NODE_ENV配置为production，使得压缩打包后的React体积减小88KB，参见https://facebook.github.io/react/docs/optimizing-performance.html#use-the-production-build

 - 0.5.0 为搜索框添加搜索图标，方便搜索

 - 0.5.1 更新README.md，发布新版本

 - 0.5.5 修复了Camera中计算出的实际分辨率总是真实值的1.3倍的bug

 - 0.5.6 可以点击拾取PoiLayer

 - 0.5.7 Graphic支持attributes属性，优化PoiLayer拾取逻辑，修复Service.ts中Promise导致TypeScript报错的问题

 - 0.5.8 重新修改了resolutionFactor1和resolutionFactor2的值，确保图片是256大小显示，并且确保getResolution()和getResolutionInWorld()方法用于让其他类调用获取实际的分辨率

 - 0.5.9
   - 使得Globe支持resolutionFactor参数，并且在webapp.html中设置值为1.2
   - 优化了webapp.html搜索体验，支持“当前位置”

 - 0.6.0 更新README.md和图片，发布新版本

 - 0.6.1 修复VertexBufferObject中无法重用Buffer的Bug

 - 0.6.2 使得地图在高清屏上更清楚

 - 0.6.3 升级webpack到3.x，修复npm test错误