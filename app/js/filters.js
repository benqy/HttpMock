'use strict';

/* Filters */

angular.module('httpmock.filters', [])
 .filter('mockType', function () {
   return function (input) {
     return input == 1 ? 'Host' : '´úÀí';
   };
 })
  //.filter('headerStr', function () {
  //  return function (customHeaders) {
  //    var headers = '<div>';
  //    if (customHeaders) {
  //      customHeaders.forEach(function (header) {
  //        headers += '<p>' + header.name + ':' + header.value + '</p>';
  //      });
  //    }
  //    headers += '</div>';
  //    return headers;
  //  };
  //});
