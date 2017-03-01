前端目录  `DomeOS/front` &nbsp;&nbsp; &nbsp;&nbsp; *（所有前端相关命令行在该目录下执行）*

## 搭建环境

系统采用gulp构建工具，bower包依赖管理工具

 **！！！注意：** 

 &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;不要随意更改bower引用包的版本，angular、ui-bootstarp等等很多包之间可能具有不兼容特性。

* 安装npm包：`npm install`
* 安装外部引用：`bower install`
* 安装sass和compass：
	1. 安装ruby：参考 [安装教程](http://www.w3cplus.com/sassguide/install.html)   (！注意安装淘宝RubyGems镜像)
	2. 安装sass：`gem install sass`
	3. 安装compass：`gem install compass`

*****
## 开发  (目录DomeOS/front/app)

执行`gulp watch` 

本系统 css采用sass预处理器，采用compass辅助sass开发；html采用jade模板引擎。

**！注意：**

 &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; 请勿修改.html、.css文件，因为修改了一样会在编译时被覆盖；

 &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; 不要随意更改domeApp.js里module的注入顺序。


* 运行`gulp watch` :监听文件修改，并编译scss、jade文件。

（ `DomeOS/front/app/index.html`为`DomeOS/front/app/index/_index.jade`编译的后的结果 ）


## 上线  (目录：DomeOS/front/dist)

执行`gulp package` 
会将代码压缩合并，并加上MD5字符串 