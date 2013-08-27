'use strict';
(function (global) {
  var nm = require('./netmock'), mocks = nm.mocks.getMocks(), app, currentMock;
  //http服务器运行状态
  var SERVER_STATUS = {
    running: 'running',
    operating: 'operating',
    closed: 'closed'
  },//当前http服务器状态
    serverStatus = {
      status: SERVER_STATUS.closed,
      mockId: null
    };
  app = global.app = {
    store: {},
    model: {
      Mock: function (option) {
        option = option || {};
        this.name = option.name;
        this.port = option.port || 80;
        this.desc = option.desc;
        this.mockType = option.mockType || 1;
      },
      Route: function (mockId) {
        this.mockId = mockId;
        this.path = '/';
        this.statusCode = "200";
        this.contentType = "text/plain";
        this.noproxy = false;
        this.customHandler = false;
        this.customHeaders = [{ name: '', value: '' }];
      }
    }
  };

  app.store.mock = {
    /**
     * @name getMock
     * @function
     *
     * @description 根据id取mock.
     * @param {string} id mockid,如果省略参数,则取所有mock.
     * @returns {Object} 单个mock对象或者mock集合对象.
     */
    getMock: function (id) {
      //var result;
      //if (id) {
      //  result = mocks[id];
      //}
      //else {
      //  result = [];
      //  for (var key in mocks) {
      //    result.push(mocks[key]);
      //  }
      //}
      //return result;
      return id ? mocks[id] : mocks;
    },
    /**
     * @name updateMock
     * @function
     *
     * @description 保存mock.
     * @param {Object} mock 要保存的mock对象,根据是否有id来判断是新建还是修改.
     * @returns {Object} 执行结果.
     */
    updateMock: function (mock) {
      var oldMock = mocks[mock.id], result;
      delete mock.cls;
      delete mock.$$hashKey;
      delete mock.runningStatus;
      //保存数据
      result = nm.mocks.updateMock(mock);
      //更新model
      if (result.success) {
        if (oldMock) {
          for (var key in mock) {
            oldMock[key] = mock[key];
          }
        }
        else {
          mocks[mock.id] = mock;
        }
      }
      return result;
    },
    /**
     * @name getCurrentMock
     * @function
     *
     * @description 获取或者设置当前mock.
     * @param {string} mockId mockid,如果省略参数,则取当前mock,否则为设置当前mock.
     * @returns {Object} 单个mock对象或者mock集合对象.
     */
    getCurrentMock: function (mockId) {
      if (mocks.length) {
        currentMock = null;
      }
      else if (mockId) {
        currentMock = mocks[mockId];
      }
      else if (!currentMock) {
        for (var key in mocks) {
          currentMock = mocks[key];
          break;
        }
      }
      if (currentMock) {
        for (var key in mocks) {
          mocks[key].isCurrent = undefined;
        }
        currentMock.isCurrent = true;
      }

      return currentMock;
    },
    /**
     * @name delMock
     * @function
     *
     * @description 删除mock.
     * @param {string} id mockid,参数不可省略.
     * @returns {Object} 执行结果.
     */
    delMock: function (id) {
      var result = nm.mocks.delMock(id);
      result.success && delete mocks[id];
      currentMock = null;
      return result;
    },
    /**
     * @name run
     * @function
     *
     * @description 运行mock服务器.
     * @param {string} mockId 要运行的mock的id.
     * @returns {undefined} 要获取运行结果,请监听netmock的start事件.
     */
    run: function (mockId) {
      nm.start(mockId);
    },
    /**
     * @name stop
     * @function
     *
     * @description 停止当前正在运行的mock服务器.
     * @returns {undefined} 要获取运行状态,请监听netmock的stop事件.
     */
    stop: function () {
      nm.stop();
    },
    /**
     * @name getServerStatus
     * @function
     *
     * @description 获取服务器运行状态.
     * @returns {Object} 服务器状态对象.
     */
    getServerStatus: function () {
      return serverStatus;
    }
  };

  //服务器运行状态改变
  nm.on('serverStatusChange', function (data) {
    var currentMockScope = $('#startServer').scope(), mocksScope = $('#mocklist').scope();
    if (data.mock) {
      serverStatus.mockId = data.mock.id;
    }
    else {
      serverStatus.mockId = null;
    }
    serverStatus.status = data.status;
    
    if (!currentMockScope.$$phase && !currentMockScope.$root.$$phase) {
      currentMockScope.$digest();
    }
    if (!mocksScope.$$phase && !mocksScope.$root.$$phase) {
      mocksScope.$digest();
    }
  });

  app.store.route = {
    /**
     * @name getRoute
     * @function
     *
     * @description 获取指定的route.
     * @param {string} mockId route所属的mock的id,不可生路.
     * @param {string} routeId 如果省略,则取出指定mock的所有route.
     * @returns {Object} 单个mock对象或者mock集合对象.
     */
    getRoute: function (mockId, routeId) {
      var routes = nm.mocks.getRoutes(mockId);
      if (routeId) {
        return routes ? routes[routeId] : {};
      }
      return routes;
    },
    /**
     * @name updateRoute
     * @function
     *
     * @description 保存route
     * @param {Object} route 要保存的route对象
     * @returns {Object} 运行结果.
     */
    updateRoute: function (route) {
      var result;
      delete route.$$hashKey;
      result = nm.mocks.updateRoute(route);
      result.success && nm.updateCurrentRoute();
      return result;
    },
    /**
     * @name delRoute
     * @function
     *
     * @description 删除指定的route
     * @param {string} mockId 要删除的route所属的mock的id,不可省略
     * @param {string} routeId 要删除的routeId,不可生路
     * @returns {Object} 执行结果
     */
    delRoute: function (mockId, routeId) {
      return nm.mocks.delRoute(mockId, routeId);
    }
  };

  app.store.systemSetting = {
    /**
     * @name getSystemSetting
     * @function
     *
     * @description 获取软件的设置.
     * @returns {Object} 软件的设置对象.
     */
    getSystemSetting: function () {
      return nm.getSystemSetting();
    },
    /**
     * @name update
     * @function
     *
     * @description 保存系统设置.
     * @param {ss} ss 系统设置对象.
     * @returns {Object} 保存结果.
     */
    update: function (ss) {
      return nm.saveSystemSetting(ss);
    }
  };

  app.store.host = {
    /**
      * @name get
      * @function
      *
      * @description 读取host文件,并解析为分组后的集合对象
      * @returns {Object} host集合对象
      */
    get:function() {
      return nm.host.loadHostFile();
    },
    /**
     * @name save
     * @function
     *
     * @description 将host集合对象写入到host文件中.
     * @param {Object} groups host集合对象
     * @param {Object} groupNames 分组名称集合
     * @returns {Object} host集合对象
     */
    save:function(groups,groupNames) {
      groups = nm.host.reGroupHost(groups);
      groups = nm.host.writeHostFile(groups, groupNames);
      return groups;
    },
    /**
     * @name remove
     * @function
     *
     * @description 从host集合中删除匹配(ip和host)的第一个host.
     * @param {Object} groups host集合对象
     * @returns {Object} host集合对象
     */
    remove:function(groups,host) {
      var group = groups[host.group];
      group.hosts = group.hosts.filter(function(item) {
        return item.ip != host.ip || item.address != host.address;
      });
      //if (!group.hosts.length) {
      //  delete groups[host.group];
      //}
      return groups;
    },
    getGroupNames:function() {
      return nm.host.loadGroupNames();
    },
    removeGroup: function (groups, group) {
      var groupForDel = groups[group.name],defaultGroup = groups["未分组"];
      groupForDel.hosts.forEach(function(host) {
        host.group = "未分组";
        defaultGroup.hosts.push(host);
      });
      groupForDel.hosts = [];
      delete groups[group.name];
      return groups;
    }
  };

  app.store.log = {
    /**
     * @name logs
     * @Array
     *
     * @description 包含所有日记的数组
     */
    logs: [],
    /**
     * @name get
     * @function
     *
     * @description 获取指定id的日记
     * @param {string} id 日记的id.
     * @returns {Object} 日记对象.
     */
    get:function(id) {
      for (var i = 0, len = app.store.log.logs.length; i < len; i++) {
        if (app.store.log.logs[i].id === id) return app.store.log.logs[i];
      }
    },
    /**
     * @name clear
     * @function
     *
     * @description 清空http日记
     * @returns undefined
     */
    clear: function () {
      nm.clearLog();
      app.store.log.logs.splice(0,app.store.log.logs.length);
    }
  };
  
  nm.on('log', function (data) {
    //if (!log.filter || ~data.url.toLowerCase().indexOf(log.filter)) {
    var scope = $('#logWrap').scope();
    app.store.log.logs.push(data);
    if (scope && !scope.$$phase && !scope.$root.$$phase) {
      scope.$digest();
    }
    //}
  });
  
  /**
   * @name listenFileDrag
   * @function
   *
   * @description 响应window的文件拖放事件,根据拖放的文件创建mock
   * @returns undefined
   */
  app.listenFileDrag = function () {
    window.ondragover = function (e) { e.preventDefault(); return false; };
    window.ondrop = function (e) { e.preventDefault(); return false; };
    //拖动文件
    document.ondrop = function (e) {
      e.preventDefault();
      var mock = app.store.mock.getCurrentMock(),  path, pathArr, filename, route = new app.model.Route(mock.id);
      if (!mock) return;
      if (!e.dataTransfer.files.length) return;
      //返回值
      path = e.dataTransfer.files[0].path;
      route.responseData = path;
      //根据后缀名判断默认contentType
      if (~path.indexOf('.js')) {
        route.contentType = 'application/x-javascript';
      }
      else if (~path.indexOf('.html') || ~path.indexOf('.shtml')) {
        route.contentType = 'text/html';
      }
      else if (~path.indexOf('.css')) {
        route.contentType = 'val', 'text/css';
      }
      else if (~path.indexOf('.jpg')) {
        route.contentType = 'image/jpeg';
      }
      else if (~path.indexOf('.png')) {
        route.contentType = 'image/png';
      }
      else if (~path.indexOf('.gif')) {
        route.contentType = 'image/gif';
      }
      else if (~path.indexOf('.bmp')) {
        route.contentType = 'image/bmp';
      }
      else {
        route.contentType = 'application/x-msdownload';
      }
      //route.path默认为文件名
      pathArr = path.split('\\');
      if (pathArr.length) {
        filename = pathArr[pathArr.length - 1];
        route.path = '/' + filename;
      }
      window.dragToAddRoute = route;
      window.location.href = '#/mocks/updateroute/' + mock.id + '/';
    };
  };

  /**
   * @name showMsg
   * @function
   *
   * @description 显示一条消息.
   * @param {string} txt 要显示的消息文本.
   * @param {string} title 要显示的消息标题,5个字以内
   * @param {string} type 消息的类型(app.showMsg.TYPES)
   * @param {string} 是否显示下一条消息按钮
   * @returns {undefined} .
   */
  app.showMsg = function (txt, title, type, btn) {
    var el = $('#showmsg'), titleEl = $('#showMsgTitle');
    el.find('span').text(txt);
    title = title || '提示!';
    type = type || app.showMsg.TYPES.tip;
    el.removeClass('alert-error').removeClass('alert-success').removeClass('alert-info').addClass(type);
    titleEl.text(title);
    if (!btn) {
      $('#nextHelp').hide();
    }
    el.show();
  };
  $('#showmsg .close').on('click', function () {
    $('#showmsg').hide();
  });
  app.showMsg.TYPES = {
    error: 'alert-error',
    tip: 'alert-success',
    info: 'alert-info'
  };
  nm.on('msg', function (data) {
    app.showMsg(data.msg);
  });
  nm.on('error', function (data) {
    app.showMsg(data.msg, '错误!', app.showMsg.TYPES.error);
  });


  //导航栏
  app.store.nav = {
    NAVLIST: {
      mocks: 'mocks',
      system: 'system',
      log: 'log',
      host:'host'
    },
    changeStatus: function (state) {
      var $navList = $('#navlist');
      $navList.find('li').removeClass('active');
      $navList.find('li.' + state).addClass('active');
    }
  };
})(window);

var httpmock = angular.module('httpmock', ['ui.state', 'httpmock.filters', 'httpmock.controllers', 'httpmock.directives']);
httpmock.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/mocks/");
  $stateProvider
    //mock列表
    .state('mocks', {
      url: "/mocks",
      templateUrl: "partials/mock/list.html",
      controller: 'Mocks',
      onEnter: function() {
        app.store.nav.changeStatus(app.store.nav.NAVLIST.mocks);
      }
    })
    //当前选中的mock
    .state('mocks.currentmock', {
      url: "/{id}",
      templateUrl: "partials/mock/detail.html",
      controller: 'CurrentMock'
    })
    //更新mock,如果没有指定id,则为新建
    .state('mocks.updatemock', {
      url: "/update/{id}",
      controller: 'UpdateMock',
      templateUrl: "partials/mock/update.html"
    })
    //更新路由,如果没有指定id,则为新建
    .state('mocks.updateroute', {
      url: "/updateroute/{mockid}/{id}",
      controller: 'UpdateRoute',
      templateUrl: "partials/mock/updateroute.html"
    })
    //系统设置
    .state('system', {
      url: '/system',
      templateUrl: 'partials/system.html',
      controller: 'System',
      onEnter: function() {
        app.store.nav.changeStatus(app.store.nav.NAVLIST.system);
      }
    })
    //日记模块
    .state('log', {
      url: '/log',
      templateUrl: 'partials/log.html',
      controller: 'Log',
      onEnter: function() {
        app.store.nav.changeStatus(app.store.nav.NAVLIST.log);
      }
    })
    .state('host', {      
      url: '/host',
      templateUrl: 'partials/host.html',
      controller: 'Host',
      onEnter:function() {
        app.store.nav.changeStatus(app.store.nav.NAVLIST.host);
      }
    });
});

//监听文件拖动
app.listenFileDrag();