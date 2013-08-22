'use strict';

var fs = require('fs'),
  config = {
    //测试数据文件夹
    dataPath: 'E:\\github\\HttpMock\\app\\test\\testData'
  },
  files = fs.readdirSync(config.dataPath);

var mock = {

};

files.forEach(function (file) {
  fs.unlinkSync(config.dataPath + '\\' + file);
});
describe('HttpMock', function () {
  describe('index', function () {
    beforeEach(function () {
      browser().navigateTo('index.html');
    });
    it('默认加载mock列表页', function () {
      expect(element('.nav-list').count()).toBe(1);
      expect(browser().location().url()).toBe('/mocks');
    });
    it('没有数据时,列表为空', function () {
      expect(repeater('.nav-list li').count()).toBe(0);
    });
    it('创建mock', function () {
      browser().navigateTo('#/mocks/update/');
      input('mock.name').enter('www.httpmock1.com');
      element('[type="submit"]').click();
      expect(repeater('.nav-list li').count()).toBe(1);
      expect(element('table:eq(0) td:eq(0)').text()).toEqual('www.httpmock1.com');
    });
    it('编辑mock', function () {
      browser().navigateTo('#/mocks/');
      element('.nav-list li:eq(0)').click();
      element('[markfortest="mockedit"]').click();
      input('mock.name').enter('www.httpmock2.com');
      element('[type="submit"]').click();
      expect(element('table:eq(0) td:eq(0)').text()).toEqual('www.httpmock2.com');
    });
    it('创建route', function() {
      browser().navigateTo('#/mocks/');
      element('.nav-list li:eq(0)').click();
      element('[markfortest="routeadd"]').click();
      input('route.path').enter('/test');
      input('route.responseData').enter('{"test":true}');
      select('route.statusCode').option(500);
      element('[type="submit"]').click();
      expect(element('[markfortest="routelist"] tbody tr').count()).toBe(1);
    });
    it('xxx', function () {
      pause();
    });
  });
});
