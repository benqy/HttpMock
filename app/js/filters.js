'use strict';

angular.module('httpmock.filters', [])
 .filter('mockType', function () {
   return function (input) {
     return input == 1 ? 'Host' : '代理';
   };
 });