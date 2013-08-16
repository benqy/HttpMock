'use strict';
(function (global) {
  var nm = require('./netmock'), mocks = nm.mocks.getMocks(), app, currentMock;
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
    //根据id取mock,如果省略参数,则取所有mock;
    getMock: function (id) {
      return id ? mocks[id] : mocks;
    },
    updateMock: function (mock) {
      var oldMock = mocks[mock.id], result;
      delete mock.cls;
      delete mock.$$hashKey;
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
    getCurrentMock: function (id) {
      if (id) {
        currentMock = mocks[id];
      }
      else if (!currentMock) {
        for (var key in mocks) {
          currentMock = mocks[key];
          break;
        }
      }
      return currentMock;;
    },
    delMock: function (id) {
      var result = nm.mocks.delMock(id);
      result.success && delete mocks[id];
      return result;
    }
  };

  app.store.route = {
    getRoute: function (mockId, routeId) {
      var routes = nm.mocks.getRoutes(mockId);
      if (routeId) {
        return routes ? routes[routeId] : {};
      }
      return routes;
    },
    updateRoute: function (route) {
      delete route.$$hashKey;
      return nm.mocks.updateRoute(route);
    },
    delRoute: function (mockId, id) {
      return nm.mocks.delRoute(mockId, id);
    }
  };;

  app.store.systemSetting = {
    getSystemSetting: function () {
      return nm.getSystemSetting();
    },
    update: function (ss) {
      return nm.saveSystemSetting(ss)
    }
  };

  /**
 * @name onFileDrag
 * @function
 *
 * @description 响应window的文件拖放事件,根据拖放的文件创建mock
 * @returns undefined
 */
  app.onFileDrag = function () {
    //拖动文件
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
      //根据后缀名判断类型
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
      //路由名
      pathArr = path.split('\\');
      if (pathArr.length) {
        filename = pathArr[pathArr.length - 1];
        route.path = '/' + filename;
      }
      console.log(route);
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
      .state('mocks.updateroute', {
        url: "/updateroute/{mockid}/{id}",
        controller: 'UpdateRoute',
        templateUrl: "partials/mock/updateroute.html"
      });
  });

app.onFileDrag();