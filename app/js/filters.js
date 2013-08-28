'use strict';

angular.module('httpmock.filters', [])
  .filter('mockType', function () {
    return function (input) {
      return input == 1 ? 'Host' : '代理';
    };
  })
  .filter('toArray', function () {
    return function (listObject) {
      var list = [];
      for (var key in listObject) {
        list.push(listObject[key]);
      }
      return list;
    };
  });