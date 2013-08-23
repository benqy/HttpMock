//'use strict';

angular.module('httpmock.directives', [])
  .directive('logHeadContent', [function () {
    return function (scope, elem, attrs) {
      var index = attrs.logHeadContent;
      $(elem[0]).on('click', function () {
        var item = app.store.log.logs[index],html = '';
        html += '<p><strong>Request URL:</strong>' + item.url + '</p>';
        html += '<p><strong>Request Method:</strong>' + item.method + '</p>';
        html += '<p><strong>Status Code:</strong>' + item.statusCode + '</p>';
        html += '<h4>Request Header</h4>';
        Object.keys(item.reqHeader).forEach(function (key) {
          html += '<p><strong>' + key + ':</strong>' + item.reqHeader[key] + '</p>';
        });
        html += '<h4>Query String Parameters</h4>';
        Object.keys(item.queryObject).forEach(function (key) {
          html += '<p><strong>' + key + ':</strong>' + item.queryObject[key] + '</p>';
        });
        html += '<h4>Response Header</h4>';
        Object.keys(item.resHeader).forEach(function (key) {
          html += '<p><strong>' + key + ':</strong>' + item.resHeader[key] + '</p>';
        });
        $('#logContent').text('').append(html);
        $('#logContentWrap').show();
      });
    };
  }])
  .directive('logContent',[function() {
    return function (scope, elem, attrs) {
      var index = attrs.logContent;
      $(elem[0]).on('click', function() {
        var item = app.store.log.logs[index],
            dataType = item.resObj.dataType,
            content = '无法预览',
            contentStyle = 'xml',
            beautify = require('js-beautify');
        //根据dataType判断内容
        if (dataType == 'text' || dataType == 'javascript' || dataType == 'css') {
          content = item.content;
        }
        else if (dataType == 'image') {
          content = '<img src="' + item.url + (~item.url.indexOf('?') ? '&' : '?') + 'httpmocknolog=true" />';
        }
        //判断代码高亮类型,以及格式化内容
        if (dataType == 'javascript') {
          try {
            content = beautify.js_beautify(content, { indent_size: 2 });
          } catch(e) {}
          contentStyle = 'javascript';
        }
        else if (dataType == 'css') {
          try {
            content = beautify.css(content, { indent_size: 2 });
          } catch (e) { }
          contentStyle = "css";
        }
        else if (dataType == 'image') {
          contentStyle = "image";
        }
        
        
        if (contentStyle == 'image') {
          $('#logContent').text('').append(content);
        }
        else {
          $('#logContent').removeClass('javascript').removeClass('xml').removeClass('css').addClass(contentStyle).text(content);
          hljs.highlightBlock($("#logContent")[0]);
        }
        $('#logContentWrap').show();
      });
    };
  }])
  .directive('logCloseContent', [function () {
    return function (scope, elem, attrs, controller) {
      $(elem[0]).on('click', function () {
        $('#logContentWrap').hide();
      });
    };
  }]);
