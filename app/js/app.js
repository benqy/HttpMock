'use strict';
(function (global) {
  var nm = require('./netmock'), mocks = nm.mocks.getMocks(), app;
  app = global.app = {
    store: {},
    model: {
      Mock: function (option) {
        option = option || {};
        this.name = option.name;
        this.port = option.port || 80;
        this.desc = option.desc;
        this.mockType = option.mockType || 1;
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
      result = nm.mocks.addMock(mock);
      //更新model
      if (result.success) {
        if (oldMock) {
          for (var key in mock) {
            console.log(key)
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
      id = id || Object.keys(mocks)[0];
      return mocks[id];
    }
  };
})(this);

$(function () {
  $('.navbar .nav li').on('click', function () {
    $('.navbar .nav li').removeClass('active');
    $(this).addClass('active');
  });
});

//angular.module('httpmock', ['httpmock.filters', 'httpmock.services', 'httpmock.directives', 'httpmock.controllers'])
//  .config(['$routeProvider', function ($routeProvider) {
//    $routeProvider.when('/mock/list', { templateUrl: 'partials/mock/list.html', view: 'subsection', controller: 'Mocks' });
//    $routeProvider.when('/mock/update', { templateUrl: 'partials/mock/update.html', controller: 'MockUpdate' });
//    $routeProvider.when('/system', { templateUrl: 'partials/system.html', controller: 'System' });
//    $routeProvider.otherwise({ redirectTo: '/mock/list' });
//  }]);
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


