'use strict';

angular.module('httpmock.controllers', [])
  //mock列表
  .controller('Mocks', function ($scope) {
    var nm = require('./netmock'),
      mocks = nm.mocks.getMocks();
    app.store.mocks = mocks;
    //列表
    $scope.mocks = mocks;
  })
  //当前mock详细页
  .controller('CurrentMock', function ($scope, $stateParams) {
    var nm = require('./netmock'), mocks = app.store.mocks || nm.mocks.getMocks() || {}, currentMock, routes;
    if ($stateParams.name) {
      currentMock = mocks[$stateParams.name];
    }
    else if (app.store.currentMock) {
      currentMock = app.store.currentMock
    }
    else {
      currentMock = mocks[Object.keys(mocks)[0]];
    }
    routes = currentMock ? nm.mocks.getRoutes(currentMock.name) : undefined;
    $scope.currentMock = currentMock;
    $scope.routes = routes;
    app.store.currentMock = currentMock;

    //标志当前选中项
    for (var key in app.store.mocks) {
      app.store.mocks[key].cls && (app.store.mocks[key].cls = undefined)
    }
    app.store.mocks[currentMock.name].cls = 'active';

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
  .controller('MockUpdate',function($scope){

  })
  .controller('System', function ($scope) {
    $scope.a = 1;
  });