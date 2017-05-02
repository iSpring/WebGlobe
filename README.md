<div align="center">
  <a target="_blank" href="https://ispring.github.io/WebGlobe/index.html">
    <img src="https://github.com/iSpring/WebGlobe/blob/develop/images/webglobe.png">
  </a>
  <p align="center">A WebGL virtual globe and map engine</p>
</div>


## WebGlobe
[![Build Status](https://travis-ci.org/iSpring/WebGlobe.svg?branch=develop)](https://travis-ci.org/iSpring/WebGlobe)
[![Release](https://img.shields.io/badge/release-0.4.4-blue.svg)](https://github.com/iSpring/WebGlobe/releases)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/iSpring/WebGlobe)

[![Chrome 8+](https://img.shields.io/badge/Chrome-8+-1DA362.svg)](http://caniuse.com/#search=WebGL)
[![Firefox 4+](https://img.shields.io/badge/Firefox-4+-E77827.svg)](http://caniuse.com/#search=WebGL)
[![IE11](https://img.shields.io/badge/IE-11+-00BCF2.svg)](http://caniuse.com/#search=WebGL)
[![Edge12+](https://img.shields.io/badge/Edge-12+-2F78BD.svg)](http://caniuse.com/#search=WebGL)
[![Safari 5.1+](https://img.shields.io/badge/Safari-5.1+-07C0F2.svg)](http://caniuse.com/#search=WebGL)
[![Opera 12.1+](https://img.shields.io/badge/Opera-12.1+-E23232.svg)](http://caniuse.com/#search=WebGL)

[![Chrome for Android 25+](https://img.shields.io/badge/Chrome%20for%20Android-25+-1DA362.svg)](http://caniuse.com/#search=WebGL)
[![Firefox Mobile 4+](https://img.shields.io/badge/Firefox%20Mobile-4+-E77827.svg)](http://caniuse.com/#search=WebGL)
[![Safari Mobile 8.1+](https://img.shields.io/badge/Safari%20Mobile-8.1%2B-07C0F2.svg)](http://caniuse.com/#search=WebGL)
[![Opera Mobile 12+](https://img.shields.io/badge/Opera%20Mobile-12+-E23232.svg)](http://caniuse.com/#search=WebGL)


WebGlobe是基于HTML5原生WebGL实现的轻量级Google Earth三维地图引擎。

桌面版在线访问地址: https://ispring.github.io/WebGlobe/index.html

移动版二维码访问(小米系统中的微信、小米默认浏览器在某些情况下存在已知bug): 
<div align="center">
  <img src="https://github.com/iSpring/WebGlobe/blob/develop/images/qrcode.png">
</div>

**如果觉得不错，欢迎Star和Fork！**

## Features
 1. 没有使用第三方框架，无需插件，所有支持WebGL的浏览器均可使用。

 2. 支持Google、高德、微软Bing、腾讯、360、OpenStreetMap等底图服务。

 3. 支持影像图、行政图以及实施交通图。

 4. 支持搜索服务以及路线规划服务。

 5. 支持移动浏览器并对移动浏览器做了优化，并针对移动端做了一个WebApp，能够实现常用的地图功能，具有实用性。

## Getting Started
 1. 在项目的根目录下执行`npm install`，安装所需模块。执行`npm start`即可进行打包编译，在浏览器中打开生成的`index.html`即可。

 2. 项目有两个主要的分支：develop分支和master分支，develop是主分支，开发的代码都提交到该分支，master分支用于发布新版本。

 3. 项目采用TypeScript编写，使用Webpack进行编译打包，编译成JavaScript运行，推荐使用最新的[Visual Studio Code](http://code.visualstudio.com/)作为编辑器。

 4. package.json中定义了`npm scripts`：
    - npm run clean 用于清除编译打包的结果
    - npm run build:dev 对代码进行编译打包，代码没有压缩混淆，用于开发环境
    - npm run build:prod 对代码进行编译打包，代码进行了压缩混淆，用于生产环境
    - npm start 用于执行build:dev

 5. 接入持续集成服务[Travis CI](https://travis-ci.org/iSpring/WebGlobe)，保证代码质量。

 6. 有问题的话欢迎大家提issue或者到[Gitter](https://gitter.im/iSpring/WebGlobe)中进行讨论。

 ## Screenshots
1. WebGlobe移动端主界面
  <div align="left">
    <a target="_blank" href="#">
      <img src="https://github.com/iSpring/WebGlobe/blob/webapp/images/1.png">
    </a>
  </div>


2. 附近搜索
  <div align="left">
    <a target="_blank" href="#">
      <img src="https://github.com/iSpring/WebGlobe/blob/webapp/images/2.png">
    </a>
  </div>


3. 搜索结果列表展示
  <div align="left">
    <a target="_blank" href="#">
      <img src="https://github.com/iSpring/WebGlobe/blob/webapp/images/3.png">
    </a>
  </div>


4. 搜索结果地图展示
  <div align="left">
    <a target="_blank" href="#">
      <img src="https://github.com/iSpring/WebGlobe/blob/webapp/images/4.png">
    </a>
  </div>


5. 路线规划
  <div align="left">
    <a target="_blank" href="#">
      <img src="https://github.com/iSpring/WebGlobe/blob/webapp/images/5.png">
    </a>
  </div>


6. 驾车出行路线
  <div align="left">
    <a target="_blank" href="#">
      <img src="https://github.com/iSpring/WebGlobe/blob/webapp/images/6.png">
    </a>
  </div>


7. 公交出行路线
  <div align="left">
    <a target="_blank" href="#">
      <img src="https://github.com/iSpring/WebGlobe/blob/webapp/images/7.png">
    </a>
  </div>


8. 步行出行路线
  <div align="left">
    <a target="_blank" href="#">
      <img src="https://github.com/iSpring/WebGlobe/blob/webapp/images/8.png">
    </a>
  </div>