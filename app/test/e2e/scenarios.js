'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

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
      input('mock.name').enter('www.httpmocktest.com');
      element('[type="submit"]').click();
      expect(repeater('.nav-list li').count()).toBe(1);
      expect(element('table:eq(0) td:eq(0)').text()).toEqual('www.httpmocktest.com');
    });
    it('xxx', function () {
      pause();
    });
  });
});
