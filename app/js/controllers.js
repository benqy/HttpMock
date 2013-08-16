'use strict';

angular.module('httpmock.controllers', [])
  .controller('Mocks', function ($scope) {
    $scope.mocks = app.store.mock.getMock();
  })
  .controller('CurrentMock', function ($scope, $stateParams, $state) {
    var  currentMock = app.store.mock.getCurrentMock($stateParams.id), routes;
    routes = currentMock ? nm.mocks.getRoutes(currentMock.id) : undefined;
    if (!currentMock || !currentMock.id) {
      $state.transitionTo('mocks');
      return;
    }
    $scope.currentMock = currentMock;
    $scope.routes = routes;
    currentMock.cls = 'active';
    //显示鼠标鼠标指向的route的自定义header
    $scope.showCustomHeaders = function (e) {
      var $target = $(e.target);
      if(0 !== parseInt($target.text())){
        $target.next('div').show();
      }
    };
    $scope.hideCustomHeaders = function (e) {
      $(e.target).next('div').hide();
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
  })
  .controller('UpdateMock', function ($scope, $stateParams, $state) {
    var mock = new app.model.Mock();
    if ($stateParams.id) {
      mock = app.store.mock.getCurrentMock($stateParams.id);
      mock.cls = 'active';
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
    if (window.dragToAddRoute) {
      route = window.dragToAddRoute;
      window.dragToAddRoute = undefined;
    }
    currentMock.cls = 'active';
    $scope.statusCodes = app.STATUS_CODE;
    $scope.contentTypes = app.CONTENT_TYPE;
    $stateParams.id && (route = app.store.route.getRoute(currentMock.id, $stateParams.id));
    $scope.route = angular.copy(route);
    
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
    $scope.addCustomType = function () {
      $scope.route.customHeaders = $scope.route.customHeaders || [];
      $scope.route.customHeaders.push({ name: '', value: '' });
    };
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
  });