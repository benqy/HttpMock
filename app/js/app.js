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
    mock: null
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
      if (mockId) {
        currentMock = mocks[mockId];
      }
      else if (!currentMock) {
        for (var key in mocks) {
          currentMock = mocks[key];
          break;
        }
      }
      currentMock.cls = 'active';
      return currentMock;;
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

  //TODO 这里需要优化实现方式,现在丑爆了,等对angular再熟悉点再说.
  nm.on('serverStatusChange', function (data) {
    if (data.mock) {
      serverStatus.mock = mocks[data.mock.id];
    }
    serverStatus.status = data.status;
    //异步的,要手动执行数据检测,但是start方法可能是异步也可能是同步,如果是同步则报异常
    try{
      $('#startServer').scope().$digest();
      $('#operationServer').scope().$digest();
      $('#stopServer').scope().$digest();
      $('#mocklist').scope().$digest();
    }
    catch (e) {
      console.log(e);
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
      return nm.mocks.delRoute(mockId, id);
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
      return nm.saveSystemSetting(ss)
    }
  };

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
      var mock = app.store.mock.getCurrentMock(), ct, path, pathArr, filename, route = new app.model.Route(mock.id);
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
})(this);


$(function () {
  $('.navbar .nav li').on('click', function () {
    $('.navbar .nav li').removeClass('active');
    $(this).addClass('active');
  });
});

angular.module('httpmock', ['ui.state', 'httpmock.filters', 'httpmock.controllers'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/mocks/");
    $stateProvider
      //系统设置
      .state('system', {
        url: '/system',
        templateUrl: 'partials/system.html',
        controller: 'System'
      })
      //mock列表
      .state('mocks', {
        url: "/mocks",
        templateUrl: "partials/mock/list.html",
        controller: 'Mocks'
      })
      //当前选中的mock
      .state('mocks.currentmock', {
        url: "/{id}",
        templateUrl: "partials/mock/detail.html",
        controller: 'CurrentMock',
        onExit: function () {
          var mocks = app.store.mock.getMock();
          if (!mocks) return;
          //标志当前选中项
          for (var key in mocks) {
            mocks[key].cls && (mocks[key].cls = undefined)
          }
        }
      })
      //更新mock,如果没有指定id,则为新建
      .state('mocks.updatemock', {
        url: "/update/{id}",
        controller: 'UpdateMock',
        templateUrl: "partials/mock/update.html",
        onExit: function () {
          var mocks = app.store.mock.getMock();
          if (!mocks) return;
          //标志当前选中项
          for (var key in mocks) {
            mocks[key].cls && (mocks[key].cls = undefined)
          }
        }
      })
      //更新路由,如果没有指定id,则为新建
      .state('mocks.updateroute', {
        url: "/updateroute/{mockid}/{id}",
        controller: 'UpdateRoute',
        templateUrl: "partials/mock/updateroute.html"
      });
  });

//监听文件拖动
app.listenFileDrag();