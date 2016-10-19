 <p align="center">
  <a target="_blank" href="https://ispring.github.io/WebGlobe/index.html">
    <img src="https://github.com/iSpring/WebGlobe/blob/master/screenshot.png">
  </a>
  <p align="center">A WebGL virtual globe and map engine</p>
</p>
 

 
## WebGlobe
WebGlobe是基于HTML5原生WebGL实现的轻量级Google Earth三维地图引擎，支持诺基亚地图、微软Bing地图、腾讯地图、天地图、OpenStreetMap等。

没有使用第三方框架，无需插件，所有支持WebGL的浏览器均可使用。效率高，内存占用少。会持续完善，目标是使其成为三维在线地图服务网站。

Demo: https://ispring.github.io/WebGlobe/index.html

**如果觉得不错，欢迎Star和Fork！**

## Setup dev environment
 1. 项目采用TypeScript编写，编译成JavaScript运行，推荐使用[Visual Studio Code](http://code.visualstudio.com/)作为编辑器。
 
 2. 通过npm install -g typescript gulp-cli安装全局模块typescript和gulp。
 
 3. 在项目的根目录下执行npm install，安装所需模块。
 
 4. 通过gulp进行编译打包，gulpfile中定义了多个task： 
    - clear用于清除编译打包的结果
    - compile用于将TypeScript版本的模块编译成JavaScript版本的AMD模块
    - bundle用于将TypeScript版本的模块打包成一个JavaScript压缩文件
    - build用于执行以上所有的task
    
 5. 通过index-src.html可以加载AMD格式的源码，方便调试；通过index-bundle.html可以加载打打包压缩后的JavaScript文件，减少了网络请求数量，减少了文件体积，用于生产环境。



