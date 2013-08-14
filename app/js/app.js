'use strict';


angular.module('httpmock', ['httpmock.filters', 'httpmock.services', 'httpmock.directives', 'httpmock.controllers'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/mock/list', { templateUrl: 'partials/mock/list.html', controller: 'Mocks' });
    $routeProvider.when('/system', { templateUrl: 'partials/system.html', controller: 'System' });
    $routeProvider.when('/mock/detail/:name', { templateUrl: 'partials/mock/detail.html', controller: 'MockDetail' });
    $routeProvider.otherwise({ redirectTo: '/mock/list' });
  }]);
