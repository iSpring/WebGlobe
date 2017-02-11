<p align="center">
  <a target="_blank" href="https://ispring.github.io/WebGlobe/index.html">
    <img src="https://github.com/iSpring/WebGlobe/blob/develop/webglobe.png">
  </a>
  <p align="center">A WebGL virtual globe and map engine</p>
</p>



## WebGlobe
[![Build Status](https://travis-ci.org/iSpring/WebGlobe.svg?branch=develop)](https://travis-ci.org/iSpring/WebGlobe)
[![Release](https://img.shields.io/badge/release-0.4.4-blue.svg)](https://github.com/iSpring/WebGlobe/releases)
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/iSpring/WebGlobe)

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

Demo: https://ispring.github.io/WebGlobe/index.html

**如果觉得不错，欢迎Star和Fork！**

## Features
 1. 没有使用第三方框架，无需插件，所有支持WebGL的浏览器均可使用。
 
 2. 支持Google、高德、微软Bing、腾讯、360、OpenStreetMap等底图服务。

 3. 支持影像图、行政图以及实施交通图。

 4. 支持移动浏览器并对移动浏览器做了优化。

 5. 轻量级，编译压缩后不足100KB。

## Getting Started
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
