'use strict';

this.app = {
  current: {}
};

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

  // For any unmatched url, send to /route1
  //$urlRouterProvider.otherwise("/route1")

  $stateProvider
    .state('mocks', {
      url: "/mocks",
      templateUrl: "partials/mock/list.html",
      controller: 'Mocks'
    })
    .state('mocks.currentmock', {
      url: "/{name}",
      templateUrl: "partials/mock/detail.html",
      controller: 'CurrentMock'
    })
});