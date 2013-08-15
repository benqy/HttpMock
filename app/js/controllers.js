'use strict';

angular.module('httpmock.controllers', [])
  .controller('Mocks', function ($scope) {
    $scope.mocks = app.store.mock.getMock();
  })
  .controller('CurrentMock', function ($scope, $stateParams) {
    var  currentMock = app.store.mock.getCurrentMock($stateParams.id), routes;
    routes = currentMock ? nm.mocks.getRoutes(currentMock.id) : undefined;
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
  })
  .controller('UpdateMock', function ($scope, $stateParams, $state) {
    var mock = new app.model.Mock();
    $scope.title = $stateParams.id ? '编辑Mock' : '添加Mock';
    if ($stateParams.id) {
      mock = app.store.mock.getCurrentMock($stateParams.id);
      mock.cls = 'active';
    }
    $scope.mock = angular.copy(mock);
    $scope.update = function (formMock) {
      var result = app.store.mock.updateMock(formMock);
      $state.transitionTo('mocks.currentmock', formMock.id);
    };
  })
  .controller('UpdateRoute', function ($scope, $stateParams, $state) {
    var currentMock = app.store.mock.getCurrentMock($stateParams.mockid), route = new app.model.Route($stateParams.mockid);
    currentMock.cls = 'active';
    $scope.statusCodes = app.STATUS_CODE;
    $scope.contentTypes = app.CONTENT_TYPE;
    $stateParams.id && (route = app.store.route.getRoute(currentMock.id, $stateParams.id));
    $scope.route = angular.copy(route);
    $scope.update = function (formRoute) {
      formRoute.mockId = currentMock.id;
      var result = app.store.route.updateRoute(formRoute);
      console.log(result);
      $state.transitionTo('mocks.currentmock', currentMock.id);
    };
  })
  .controller('System', function ($scope) {
    $scope.a = 1;
  });