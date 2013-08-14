'use strict';

/* Controllers */

angular.module('httpmock.controllers', [])
  .controller('Mocks', function ($scope) {
    var nm = require('./netmock'),
      mocks = nm.mocks.getMocks();
    $scope.mocks = mocks;
  })
  .controller('MockDetail', function ($scope, $routeParams) {
    var nm = require('./netmock'),
       mocks = nm.mocks.getMocks(),
       mock = mocks[$routeParams.name],
       routes = nm.mocks.getRoutes(mock.name);
    $scope.mock = mock;
    $scope.routes = routes;
    $scope.startMock = function (mock) {
      console.log(mock);
    };
  })
  .controller('System', function () {
    console.log(2)
  });