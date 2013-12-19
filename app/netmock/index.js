var http = require('http'),https = require('https'), fs = require('fs'), httpProxy = require('http-proxy'),
    host = require('./host'), mocks = require('./mocks'), util = require('../helpers/util'),
    iconv = require('iconv-lite'), zlib = require('zlib'),
    //当前正在运行中的mock
    runningMock,
    //运行中的路由列表
    runningRoutes,
    //http服务器
    currentServer,
    //服务器状态
    SERVER_STATUS = {
      running: 'running',
      operating: 'operating',
      closed: 'closed'
    },
    //服务器运行状态
    isRunning = SERVER_STATUS.closed,
    //本地文件或者文件夹
    filenameReg = /^[a-zA-Z]:(([a-zA-Z]*)||([a-zA-Z]*\\))*/,
    //匹配url中的多级路径,并且带有后缀名
    dirReg = /(^.*)\/(.*\..*)$/,
    //自定义事件监听
    events = {},
    //默认系统配置存储目录
    SYSTEM_SETTING_FILE = './conf/systemsetting.json',
    //系统设置
    systemSetting,
    //日记
    mockLogs = [];

/**
 * @name matchRoute
 * @function
 *
 * @description 判断指定的路径是否匹配当前运行的mock中的路由
 * @param {string} path 要判断的路径
 * @returns {Object} route 匹配到的route.
 */
var matchRoute = function (path) {
  var route;
  if (!runningRoutes) return;
  path = path.toLowerCase();
  for (var key in runningRoutes) {
    if (runningRoutes[key].path.toLowerCase() === path) {
      route = runningRoutes[key];
      break;
    }
  }
  if (route) return route;
  if (path.charAt(path.length - 1) == '/') {
    path = path.slice(0, path.length - 1);
  }
  else {
    path += '/';
  }
  route = runningRoutes[path];
  return route;
};

/**
 * @name checkStaticDir
 * @function
 *
 * @description 判断路径的是否属于某个静态文件夹路由的子目录或者子文件
 * @param {string} path 要判断的路径
 * @returns {Object} route 匹配到的route.
 */
var checkStaticDir = function (path) {
  var result = {},
  route, dirs, dir;
  if (!runningRoutes) return result;
  dirs = path.toLowerCase().split('/');
  dirs = dirs.filter(function (n) {
    return !!n;
  });
  
  if ('/' !== dirs[0]) dirs.unshift('/');
  //判断每一级的路径
  for (var i = dirs.length; i > 0; i--) {
    dir = dirs.slice(0, i).join('/');
    dir = dir.replace(/\/{1,}/ig, '/');
    route = matchRoute(dir);
    //存在此路径且是一个存在的文件夹
    if (route && filenameReg.test(route.responseData)
      && fs.existsSync(route.responseData) && fs.statSync(route.responseData).isDirectory()) {
      result.route = route;
      //result.filename = filename;
      return result;
    }
  }
  return result;
};

/**
 * @name resolvePath
 * @function
 *
 * @description 根据匹配的路由和http路径,计算出本地目录的真实路径
 * @param {object} route 匹配的路由
 * @param {string} httpPath http的路径部分
 * @returns {string} 本地真实路径.
 */
var resolvePath = function(route, httpPath) {
  var locPath = route.responseData, sliceIndex = 2;
  if ('/' === route.path) {
    sliceIndex = 1;
  }
  httpPath = httpPath.split('/').slice(sliceIndex);
  return require('path').normalize(locPath + '/' + httpPath.join('/'));
};

/**
 * @name renderDir
 * @function
 *
 * @description 根据匹配的路由和http路径,计算出本地目录的真实路径
 * @param {Object} urlOpt http请求信息
 * @param {string} dir 对应的本地目录
 * @returns {string} 本地目录的文件列表的html表示
 */
var renderDir = function (urlOpt, dir) {
  if (!fs.existsSync(dir)) return '';
  var files = fs.readdirSync(dir), resData = '<h3>' + dir + '</h3>', href = '';
  files.forEach(function (file) {
    href = (urlOpt.href + '/' + file).replace(/((\:?)\/{1,})/g, function ($m, $1, $2) { return $2 ? $1 : '/'; });
    resData += '<a href="' + href + '">' + file + '</a></br>';
  });
  return resData;
};

/**
 * @name noErrorDecodeUri
 * @function
 *
 * @description 尝试对url进行decodeURIComponent,如果失败,则还回原始url
 * @param {string} url 要decode的url
 * @returns {string} decode之后的url
 */
var noErrorDecodeUri = function(url) {
  try {
    return window.decodeURIComponent(url);
  } catch(e) {
    return url;
  }
};

/**
 * @name isMatchMockName
 * @function
 *
 * @description 判断指定的域名是否匹配当前运行的mock(name以及secondaryName)
 * @param {string} host 要判断的域名
 * @returns {boolean}  true:匹配
 */
var isMatchMockName = function(host) {
  var result = false;
  if (runningMock && (host == runningMock.name.toLowerCase() || (runningMock.secondaryName && ~runningMock.secondaryName.toLowerCase().indexOf(host)))) {
    result = true;
  }
  return result;
};

//运行代理服务器
var proxyServer = httpProxy.createServer(function (req, res, proxy) {
  req.reqDate = new Date();
  var buffer = httpProxy.buffer(req),
    url = req.url.toLowerCase(),
    urlOpt = require('url').parse(url, true), route,
    host = urlOpt.hostname || 'localhost', port = urlOpt.port || 80;
  urlOpt.path = noErrorDecodeUri(urlOpt.path);
  urlOpt.pathname = noErrorDecodeUri(urlOpt.pathname);
  route = matchRoute(urlOpt.pathname);
  if (isMatchMockName(host) && route && !route.noProxy) {
    host = 'localhost';
    port = runningMock.port || 80;
  }
  else if (isMatchMockName(host)  && checkStaticDir(urlOpt.pathname).route) {
    host = 'localhost';
    port = runningMock.port || 80;
  }
  if (route && route.delay) {
    //模拟延迟
    setTimeout(function () {
      proxy.proxyRequest(req, res, {
        host: host,
        port: port,
        buffer: buffer
      });
    }, route.delay);
  }
  else {
    proxy.proxyRequest(req, res, {
      host: host,
      port: port,
      buffer: buffer
    });
  }
});

/**
 * @name isGbk
 * @function
 *
 * @description 检查html内容是否为gbk编码
 * @param {string} ct http的content type
 * @param {buffer} buffer http response的内容
 * @returns {boolean} true:是gbk编码,false:非gbk编码
 */
var isGbk = function (ct, buffer) {
  var ct = ct || '', contentStr = buffer.toString();
  if (~ct.toLowerCase().indexOf('gbk') || ~ct.toLowerCase().indexOf('gb2312')
     || ~contentStr.indexOf('charset=gb2312') || ~contentStr.indexOf('charset=gbk')
     || ~contentStr.indexOf('charset="gbk"') || ~contentStr.indexOf('charset="gb2312"')) {
    return true;
  }
  return false;
};

//日记
proxyServer.proxy.on('proxyResponse', function (req, res, response) {
  var logObj = {}, pathArr, buffer = [], resStr = '',
      urlOpt = require('url').parse(req.url.toLowerCase(), true),
      url = noErrorDecodeUri(req.url),
      filename;
  if (urlOpt.query.httpmocknolog) return;
  pathArr = url.split('/');
  filename = pathArr[pathArr.length - 1];
  filename = filename || url;
  logObj.url = url;
  logObj.filename = filename;
  logObj.method = req.method;
  logObj.contentType = response.headers['content-type'] || '';
  logObj.statusCode = response.statusCode;
  logObj.reqHeader = req.headers;
  logObj.queryObject = urlOpt.query || {};
  logObj.resHeader = response.headers;
  logObj.delay = new Date() - req.reqDate;
  response.on('data', function (trunk) {
    buffer.push(trunk);
    resStr += trunk;
  });
  response.on('end', function () {
    buffer = Buffer.concat(buffer);
    var resObj = module.exports.parseRes(response.headers, url, buffer);
    logObj.resObj = resObj;
    if (resObj.gzip) {
      zlib.unzip(buffer, function (err, buffer) {
        if (isGbk(response.headers['content-type'], buffer)) {
          //将gbk转为utf8
          buffer = iconv.decode(buffer, 'GBK');
        }
        logObj.content = buffer;
        logObj.size = buffer.length / 1000;
        module.exports.addLog(logObj);
      });
    }
    else {
      if (isGbk(response.headers['content-type'], buffer)) {
        buffer = iconv.decode(buffer, 'GBK');
      }
      logObj.content = buffer;
      logObj.size = buffer.length / 1000;
      module.exports.addLog(logObj);
    }
  });
});
proxyServer.listen(17173);


var runServer = function () {
  var serverHandler = function(req, res) {
    var urlOpt = require('url').parse(req.url.toLowerCase(), true), route, header = {}, resData, customFn;
    urlOpt.path = noErrorDecodeUri(urlOpt.path);
    urlOpt.pathname = noErrorDecodeUri(urlOpt.pathname);
    var dirArr = dirReg.exec(urlOpt.pathname), filename;
    dirArr && (filename = dirArr[2]);
    //全局设置
    var ss = module.exports.getSystemSetting();
    if (ss && ss.globalHeaders) {
      ss.globalHeaders.forEach(function(ct) {
        header[ct.name.toLowerCase()] = ct.value;
      });
    }
    //完全匹配的路由
    if (route = matchRoute(urlOpt.pathname)) {
      //route设置
      header['content-type'] = route.contentType;
      if (route.customHeaders) {
        route.customHeaders.forEach(function(ct) {
          header[ct.name.toLowerCase()] = ct.value;
        });
      }
      res.writeHead(route.statusCode, header);

      //自定义处理函数
      if (route.customHandler) {
        try {
          customFn = new Function('query', route.responseData);
          resData = customFn(urlOpt.query);
          resData =resData;
          console.log(resData);
        } catch(e) {
          resData = JSON.stringify(e.message);
          module.exports.fire('error', { msg: '自定义函数异常:' + resData });
        }
      }
        //文件,文件夹
      else if (filenameReg.test(route.responseData)) {
        if (fs.existsSync(route.responseData)) {
          //如果是一个目录,就列出目录下所有文件
          if (fs.statSync(route.responseData).isDirectory()) {
            header['content-type'] = 'text/html';
            res.writeHead(route.statusCode, header);
            resData = renderDir(urlOpt, resolvePath(route, urlOpt.pathname));
          } else {
            resData = fs.readFileSync(route.responseData);
          }
        } else {
          res.writeHead(404, header);
          resData = '文件不存在';
        }
      } else {
        if (urlOpt.query.callback) {
          resData = urlOpt.query.callback + '(' + route.responseData + ');';
        } else {
          resData = route.responseData;
        }
      }
    }
      //静态文件夹的子目录(文件)路由
    else if ((route = checkStaticDir(urlOpt.pathname).route)) {
      //根据后缀名设置content-type
      if (!filename) {
        header['content-type'] = 'text/html';
      } else if (~filename.indexOf('.js')) {
        header['content-type'] = 'application/x-javascript';
      } else if (~filename.indexOf('.html') || ~filename.indexOf('.shtml') || ~filename.indexOf('.htm')) {
        header['content-type'] = 'text/html';
      } else if (~filename.indexOf('.css')) {
        header['content-type'] = 'text/css';
      } else if (~filename.indexOf('.xml')) {
        header['content-type'] = 'application/xml';
      } else if (~filename.indexOf('.json')) {
        header['content-type'] = 'application/json';
      } else if (~filename.indexOf('.jpg')) {
        header['content-type'] = 'image/jpeg';
      } else if (~filename.indexOf('.png')) {
        header['content-type'] = 'image/png';
      } else if (~filename.indexOf('.gif')) {
        header['content-type'] = 'image/gif';
      } else if (~filename.indexOf('.bmp')) {
        header['content-type'] = 'image/bmp';
      } else {
        header['content-type'] = 'application/x-msdownload';
      }
      //根目录自定义header
      if (route.customHeaders) {
        route.customHeaders.forEach(function(ct) {
          header[ct.name.toLowerCase()] = ct.value;
        });
      }
      res.writeHead(route.statusCode, header);
      var dir = resolvePath(route, urlOpt.pathname);
      if (fs.existsSync(dir)) {
        //如果是一个目录,就列出目录下所有文件
        if (fs.statSync(dir).isDirectory()) {
          header['content-type'] = 'text/html';
          res.writeHead(route.statusCode, header);
          resData = renderDir(urlOpt, dir);
        } else {
          resData = fs.readFileSync(dir);
        }
      } else {
        res.writeHead(404, header);
        resData = '文件不存在';
      }
    } else {
      resData = '404';
    }
    res.end(resData || '');
  };
  //处理请求
  if (runningMock.protocol === 'https') {
    currentServer = https.createServer({
      key: fs.readFileSync('./netmock/2-key.pem'),
      cert: fs.readFileSync('./netmock/2-cert.pem')
    }, serverHandler);
  } else {
    currentServer = http.createServer(serverHandler);
  }
  currentServer.on('error', function (e) {
    if (e.code == 'EACCES') {
      module.exports.fire('error', { msg: '端口被占用' });
    }
    else {
      module.exports.fire('error', { msg: '异常了,重启吧..' });
    }
    isRunning = SERVER_STATUS.closed;
    module.exports.fire('serverStatusChange', { status: SERVER_STATUS.closed });
  });
  currentServer.listen(runningMock.port);
  currentServer.timeout = 12000;
  isRunning = SERVER_STATUS.running;
  module.exports.fire('serverStatusChange', { status: SERVER_STATUS.running, mock: runningMock });
};

module.exports = {
  resDataType: {
    text: 'text',
    image: 'image',
    javascript: 'javascript',
    css: 'css',
    file: 'file'
  },
  /**
   * @name parseRes
   * @function
   *
   * @description 判断http返回的内容的类型以及是否经过gzip压缩
   * @param {object} resHeader http response header
   * @param {url} url http请求的地址
   * @returns {Object} dataType:返回内容的格式,gzip:是否经过gzip压缩
   */
  parseRes: function (resHeader, url) {
    var dataType = this.resDataType.file, ct = resHeader['content-type'] || '', gzip = false;
    if (~url.indexOf('.png') || ~url.indexOf('.jpg') || ~url.indexOf('.gif') || ~url.indexOf('.bmp') || ~url.indexOf('.ico') || ~ct.indexOf('image')) {
      dataType = this.resDataType.image;
    }
    else if (~ct.indexOf('css') || ~url.indexOf('.css')) {
      dataType = this.resDataType.css;
    }
    else if (~ct.indexOf('javascript') || ~ct.indexOf('json') || ~url.indexOf('.js') || ~url.indexOf('.json')) {
      dataType = this.resDataType.javascript;
    }
    else if (~ct.indexOf('html') || ~ct.indexOf('csv') || ~ct.indexOf('text') || ~ct.indexOf('xml') || ~url.indexOf('.txt')
       || ~url.indexOf('.html') || ~url.indexOf('.htm') || ~url.indexOf('.shtml') || ~url.indexOf('.xml') || ~url.indexOf('.asp') || ~url.indexOf('.php')) {
      dataType = this.resDataType.text;
    }

    if (!!resHeader['content-encoding'] && !!~resHeader['content-encoding'].indexOf('gzip')) {
      gzip = true;
    }
    return {
      dataType: dataType,
      gzip: gzip
    };
  },
  getServerStatus: function () {
    return {
      mock: runningMock,
      status: isRunning
    };
  },
  on: function (name, fn) {
    events[name] = events[name] || [];
    events[name].push(fn);
  },
  fire: function (name, data) {
    var fns = events[name];
    if (fns) {
      fns.forEach(function (fn) {
        fn(data);
      });
    }
  },
  host: host,
  mocks: mocks,
  start: function (mockId) {
    var mock = mocks.getMocks()[mockId];
    if (!mock) return;
    if (mock.mockType == 1) {
      host.disProxy();
      host.addHost('127.0.0.1', mock.name);
      host.addHost('127.0.0.1', mock.secondaryName);
      
    }
    else {
      host.removeHost('127.0.0.1', mock.name);
      host.removeHost('127.0.0.1', mock.secondaryName);
      host.setProxy();
    }
    isRunning = SERVER_STATUS.operating;
    module.exports.removeCurrentHost();
    module.exports.fire('serverStatusChange', { status: SERVER_STATUS.operating });
    runningMock = mock;
    runningRoutes = mocks.getRoutes(mockId);
    this.runServer();
  },
  //刷新当前运行的route的数据
  updateCurrentRoute: function () {
    if (runningMock) {
      runningRoutes = mocks.getRoutes(runningMock.id);
    }
  },
  removeCurrentHost:function() {
    runningMock && host.removeHost('127.0.0.1', runningMock.name);
    runningMock && host.removeHost('127.0.0.1', runningMock.secondaryName);
  },
  stop: function () {
    isRunning = SERVER_STATUS.operating;
    module.exports.fire('serverStatusChange', { status: SERVER_STATUS.operating });
    currentServer && currentServer.address() && currentServer.close(function () {
      host.disProxy();
      module.exports.removeCurrentHost();
      runningMock = undefined;
      runningRoutes = undefined;
      currentServer = null;
      isRunning = SERVER_STATUS.closed;
      module.exports.fire('serverStatusChange', { status: SERVER_STATUS.closed });
    });
  },
  getRunningInstance: function () {
    return {
      mock: runningMock,
      routes: runningRoutes
    };
  },
  runServer: function () {
    if (currentServer && currentServer.address()) {
      currentServer.close(function () {
        runServer();
      });
    }
    else {
      runServer();
    }
  },
  getSystemSetting: function () {
    if (systemSetting) return systemSetting;
    var setting;
    if (fs.existsSync(SYSTEM_SETTING_FILE)) {
      setting = util.readJsonSync(SYSTEM_SETTING_FILE);
    }
    setting = setting || {};
    systemSetting = setting;
    return setting;
  },
  saveSystemSetting: function (data) {
    var globalHeaders = [];
    if (!fs.existsSync(data.storeDir)) {
      return { success: false, msg: '存储路径不存在' };
    }
    if (!fs.existsSync(data.proxyDir)) {
      return { success: false, msg: '代理文件路径不存在' };
    }
    if (data.globalHeaders) {
      data.globalHeaders.forEach(function (item) {
        if (item.name && item.value) globalHeaders.push(item);
      });
    }
    data.globalHeaders = globalHeaders;
    util.writeFileSync(SYSTEM_SETTING_FILE, JSON.stringify(data));
    systemSetting = data;
    return { success: true, msg: 'success' };
  },
  setSystemSettingFile: function (filename) {
    SYSTEM_SETTING_FILE = filename;
  },
  addLog: function (obj) {
    obj.date = new Date();
    obj.id = util.generalId();
    mockLogs.push(obj);
    module.exports.fire('log', obj);
  },
  getLogs: function (filter) {
    var logs = mockLogs;
    if (filter) {
      logs = mockLogs.filter(function (log) {
        return ~log.url.toLowerCase().indexOf(filter.toLowerCase());
      });
    }
    return logs;
  },
  clearLog: function () {
    mockLogs = [];
  }
};