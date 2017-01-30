<p align="center">
  <a target="_blank" href="https://ispring.github.io/WebGlobe/index.html">
    <img src="https://github.com/iSpring/WebGlobe/blob/develop/webglobe.png">
  </a>
  <p align="center">A WebGL virtual globe and map engine</p>
</p>



## WebGlobe
[![Build Status](https://travis-ci.org/iSpring/WebGlobe.svg?branch=develop)](https://travis-ci.org/iSpring/WebGlobe)

WebGlobe是基于HTML5原生WebGL实现的轻量级Google Earth三维地图引擎，支持Google地图、微软Bing地图、OpenStreetMap等。

没有使用第三方框架，无需插件，所有支持WebGL的浏览器均可使用。效率高，内存占用少。会持续完善，目标是使其成为三维在线地图服务网站。

Demo: https://ispring.github.io/WebGlobe/index.html

**如果觉得不错，欢迎Star和Fork！**

## Setup dev environment
 1. 项目有两个主要的分支：develop分支和master分支，develop是主分支，开发的代码都提交到该分支；master分支用于release，当develop分支中的代码比较稳定且有重要更新的时候，会将develop分支的代码merge到master分支，然后通过master分支进行发布新版本。

 2. 项目采用TypeScript编写，使用Webpack进行编译打包，编译成JavaScript运行，推荐使用[Visual Studio Code](http://code.visualstudio.com/)作为编辑器。

 3. 在项目的根目录下执行npm install，安装所需模块。

 4. package.json中定义了npm scripts：
    - npm run clean 用于清除编译打包的结果
    - npm run build:dev 对代码进行编译打包，代码没有压缩混淆，用于开发环境
    - npm run build:prod 对代码进行编译打包，代码进行了压缩混淆，用于生产环境
    - npm start 用于执行build:dev

 5. 开发过程中，在WebGlobe根目录下执行npm start即可进行打包编译
 
 6. 有问题的话欢迎大家提issue或者到 https://gitter.im/iSpring/WebGlobe 进行讨论
