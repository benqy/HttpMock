#HttpMock

这是一个给前端开发者使用的web服务器+代理服务器.  
作为前端开发,你是否经常等待后端的接口呢?是否每天都要开fiddler和web服务器,你是否讨厌web服务器麻烦的配置,以及开发和调试阶段的不方便?  
这个工具就是为了解决这些问题.


##功能说明  
支持设置自定义header,设置请求的延迟,用js写简单的服务端逻辑,快速拖动文件/文件夹来创建http服务,查看http日记,调试手机的http请求.  
目前支持windows系统.没水果电脑,没办法生成水果版本.
###启动软件  
一, **打包好的Windows EXE**: [v0.2.2release](http://pan.baidu.com/s/107of0)  
二, **开发**  
1. 下载源代码  
2. 下载[node-webkit压缩包](https://github.com/rogerwang/node-webkit)  
3. 解压node-webkit到项目根目录  
4. 进入app文件夹,运行npm install  
5. 返回根目录双击nw.exe即可  
6. 打包等更详细的开发文档,请看[node-webkit的WIKI](https://github.com/rogerwang/node-webkit)

###自动打包发布
1. 打包之前,请确保上一步(开发)操作完成.应用可以运行
2. 目前只实现了windows下的打包,运行build目录下的build-win.bat,就会自动打包到build\bin下.

###创建http服务  
mock:即站点,每次只能有一个mock处于启动状态(这设定貌似不合理?但是我目前够用)  
route:即站点的路径,一个mock可以有n个route,但是path不能重复.  
初次启动软件,先创建一个mock(在mock列表右上角),然后在创建的mock的界面里给这个mock添加route.  
mock界面里有个启动按钮,启动后就可以访问页面了,route列表里有在浏览器打开页面的快捷按钮.

###服务器类型:host和代理  
在创建mock的时候,有两种mock类型可选:"修改本地HOST"和"浏览器代理".  

* 修改本地HOST:启动mock时,会自动在host文件里设置mock的域名映射到本机ip(127.0.0.1)
* 浏览器代理:启动mock时不会修改host文件,但是软件会运行一个代理服务器(端口可在系统设置里修改),并将ie浏览器代理指向这个代理服务器(仅http).这样所有http请求都会由代理服务器转发,并在http日记模块里生成http日记. 代理服务器收到请求时,会判断route列表里是否有这个请求,有则重定向到这个route,否则直接请求原始的地址.  


###自定义请求的服务端逻辑  

###系统设置  
没啥内容,看看就知道了.  
可以把存档目录设置在你的同步盘里,这样就可以在公司和家里同步配置了.

###日记模块  
界面代码重构中,这个模块还未完成.

##changelog  
###2013-12-17 15:09:33
v0.2.2release  
* 支持https服务器(暂不支持https代理)  
* **修复代理设置不会马上生效的问题**

###2013-08-28 14:39:44
v0.2.2beta2 ing..........  

* 解决编辑route时,名称显示为undefined的问题

###2013-08-27 17:03:17
v0.2.2beta  

* mock可以绑定多个备用域名.  
* 增加host管理模块,前端开发中经常要干这事.

###2013-08-23 16:53:12
v0.2.1beta  

* 增加日记模块,并支持点击表头排序功能.  

###2013-08-19 16:40:04
v0.2.0beta  

* 重写全部界面代码,和大部分后台代码,日记模块暂未完成.

###2013-08-08 23:05:23
v0.1.5beta 

* 静态文件夹现在支持递归子文件夹了
* 解决gzip情况下,判断文件编码错误的问题  


###2013-08-07 01:05:08
v0.1.4beta

* 现在支持自定义服务端处理函数,可以用js写服务端逻辑.
* 存档文件夹支持自定义了,在系统设置里.
* 如果请求带有名为callback的参数,会按jsonp的格式返回结果.
* 创建的路由如果是文件夹,则文件夹内的所有文件都可以访问,并且访问这个路由,会列出文件夹里的所有文件.
* 查看请求内容时,会自动格式化压缩过的css和js.
* 日记增加清除列表功能,分组显示和排序功能在计划中.
* 现在可以正确的处理GBK和gzip压缩的情况了.
* 现在只会代理http协议的请求,不会影响https和其他协议的请求了.
* 修改路由会及时生效.
* 减少异常,提高程序的稳定性.
* 总之解决一吨的bug,但是还有很多.


###2013-08-01 10:01:23
v0.1.3beta 

* 完善log模块

###2013-07-31 23:51:01
v0.1.2beta

* 增加了log模块,模块完成度50%

###2013-07-30 22:57:52  
v0.1.1beta

* 增加静态文件模块,路由的response如果是文件路径格式,则请求的response会返回文件的内容.你可以将文件拖动到软件上以方便的创建静态路由
* 拖动文件到软件上,会自动弹出添加路由表单,并根据文件类型填写表单内容(js,html)
* 每次启动软件时,会随机显示各种小技巧,点击next按钮可以按顺序查看每一条


###2013-07-30 07:52:52
v0.1.0beta

* 第一个可用版本

##测试


*  配置测试数据:运行软件,在系统设置里将"存档文件夹"设置为test目录下的testData.
*  设置软件启动页:关闭软件,在app里的package.json里,将main值设置为testrunner.html.
*  运行软件即可看到测试结果  


## License
[WTFPL公共许可证](http://www.wtfpl.net/)

```
( WTFPL )

除了第三方模块遵循原协议外.其他的爱干啥干啥,爱咋整咋整.  

DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                   Version 2, December 2004  

Copyright (C) 2013 benqy <hmjlr123@gmail.com>  

Everyone is permitted to copy and distribute verbatim or modified
copies of this license document, and changing it is allowed as long
as the name is changed.

           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

```

##截图  

###mock管理界面
![](https://raw.github.com/benqy/HttpMock/master/mock.png)  
###日记界面(高亮显示html,js,css,自动格式化等)
![](https://raw.github.com/benqy/HttpMock/master/log.png)  
###系统设置
![](https://raw.github.com/benqy/HttpMock/master/sys.png)

