'use strict';

angular.module('httpmock.controllers', [])
  .controller('Mocks', function ($scope) {
    $scope.mocks = app.store.mock.getMock();
    $scope.serverStatus = app.store.mock.getServerStatus();
  })
  .controller('CurrentMock', function ($scope, $stateParams, $state) {
    var currentMock = app.store.mock.getCurrentMock($stateParams.id), routes;
    routes = currentMock ? nm.mocks.getRoutes(currentMock.id) : undefined;
    //没有任何mock就跳转到mock列表
    if (!currentMock || !currentMock.id) {
      $state.transitionTo('mocks');
      return;
    }
    $scope.currentMock = currentMock;
    $scope.routes = routes;
    //显示鼠标鼠标指向的route的自定义header
    $scope.showCustomHeaders = function (e) {
      var $target = $(e.target);
      if (0 !== parseInt($target.text())) {
        $target.next('div').show();
      }
    };
    $scope.hideCustomHeaders = function (e) {
      $(e.target).next('div').hide();
    };

    $scope.openRoute = function (route) {
      gui.Shell.openExternal('http://' + currentMock.name + (currentMock.port == 80 ? '' : ':' + currentMock.port) + route.path);
    };
    $scope.delRoute = function (route) {
      if (confirm('确认删除路径  ' + route.path)) {
        if (app.store.route.delRoute(route.mockId, route.id).success) {
          delete $scope.routes[route.id];
        }
      }
    };
    $scope.delMock = function (mock) {
      if (confirm('确认删除Mock : ' + mock.name)) {
        if (app.store.mock.delMock(mock.id).success) {
          $state.transitionTo('mocks.currentmock', {});
        }
      }
    };
    //服务器操作
    $scope.serverStatus = app.store.mock.getServerStatus();
    $scope.runServer = function (mock) {
      app.store.mock.run(mock.id);
    };
    $scope.stopServer = function () {
      app.store.mock.stop();
    };
  })
  .controller('UpdateMock', function ($scope, $stateParams, $state) {
    var mock = new app.model.Mock();
    if ($stateParams.id) {
      mock = app.store.mock.getCurrentMock($stateParams.id);
    }
    $scope.title = $stateParams.id ? '编辑Mock:' + mock.name : '新建Mock';
    $scope.mock = angular.copy(mock);
    $scope.errorMsg = '';
    $scope.update = function (formMock) {
      var result = app.store.mock.updateMock(formMock);
      if (result.success) {
        $state.transitionTo('mocks.currentmock', { id: formMock.id });
      }
      else {
        $scope.errorMsg = result.msg;
      }
    };
  })
  .controller('UpdateRoute', function ($scope, $stateParams, $state) {
    var currentMock = app.store.mock.getCurrentMock($stateParams.mockid), route = new app.model.Route($stateParams.mockid);
    //如果是拖动文件触发的updateroute,则使用文件对应的route对象作为默认值
    if (window.dragToAddRoute) {
      route = window.dragToAddRoute;
      window.dragToAddRoute = undefined;
    }


    //http状态码和contentType选择列表
    $scope.statusCodes = app.STATUS_CODE;
    $scope.contentTypes = app.CONTENT_TYPE;

    //如果有指定id,则用指定的route替换掉默认值
    $stateParams.id && (route = app.store.route.getRoute(currentMock.id, $stateParams.id));
    $scope.title = $stateParams.id ? '编辑Route:' + route.name : '新建Route';

    //使用clone的副本与表单绑定,只有保存成功才会实际更新
    $scope.route = angular.copy(route);

    //如果没有customHeader,则默认创建一个空的.
    $scope.route.customHeaders = $scope.route.customHeaders || [];
    if (!$scope.route.customHeaders[0]) {
      $scope.route.customHeaders.push({ name: '', value: '' });
    }

    $scope.update = function (formRoute) {
      formRoute.mockId = currentMock.id;
      var result = app.store.route.updateRoute(formRoute);
      if (result.success) {
        $state.transitionTo('mocks.currentmock', { id: currentMock.id });
      }
      else {
        $scope.errorMsg = result.msg;
      }
    };

    $scope.addCustomHeader = function () {
      $scope.route.customHeaders = $scope.route.customHeaders || [];
      $scope.route.customHeaders.push({ name: '', value: '' });
    };

    //切换responseData提示的显示和隐藏.
    $scope.showHelp = function (e) {
      var $target = $(e.target);
      if (0 !== parseInt($target.text())) {
        $target.next('div').show();
      }
    };
    $scope.hideHelp = function (e) {
      $(e.target).next('div').hide();
    };
  })
  .controller('System', function ($scope) {
    $scope.systemSetting = app.store.systemSetting.getSystemSetting();
    $scope.addGlobalHeader = function () {
      $scope.systemSetting.globalHeaders = $scope.systemSetting.globalHeaders || [];
      $scope.systemSetting.globalHeaders.push({ name: '', value: '' });
    };
    $scope.update = function (systemSetting) {
      //如果没有指定保存的路径,则使用用户文件夹作为默认值
      if (!systemSetting.storeDir) {
        systemSetting.storeDir = require('nw.gui').App.dataPath[0];
      }
      var result = app.store.systemSetting.update(systemSetting);
      if (result.success) {
        alert('保存成功');
      }
      else {
        $scope.errorMsg = result.msg;
      }
    };
  })
  .controller('Log', function ($scope) {
    $scope.logs = app.store.log.logs;
    $scope.query = '';
    $scope.order = 'date';
    $scope.clear = function() {
      app.store.log.clear();
    };
  });