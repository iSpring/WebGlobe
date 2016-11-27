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
 1. 项目有两个主要的分支：develop分支和master分支，develop是主分支，开发的代码都提交到该分支；master分支用于release，当develop分支中的代码比较稳定且有重要更新的时候，会将develop分支的代码merge到master分支，然后通过master分支进行发布新版本。

 2. 项目采用TypeScript编写，编译成JavaScript运行，推荐使用[Visual Studio Code](http://code.visualstudio.com/)作为编辑器。

 3. 通过npm install -g typescript安装全局模块typescript。

 4. 在项目的根目录下执行npm install，安装所需模块。

 5. 使用gulp进行编译打包，gulpfile中定义了多个task，并在package.json中定义了对应的npm scripts：
    - npm run clear 用于清除编译打包的结果
    - npm run compile 用于将TypeScript版本的模块编译成JavaScript版本的AMD模块
    - npm run bundle 用于将TypeScript版本的模块打包成一个JavaScript压缩文件
    - npm run build 用于执行以上所有的task
    - npm start 用于执行build

 6. 通过index-src.html可以加载AMD格式的源码，方便调试；通过index-bundle.html可以加载打打包压缩后的JavaScript文件，减少了文件体积和网络请求数量，用于生产环境。



