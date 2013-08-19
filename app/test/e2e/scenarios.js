'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('HttpMock', function () {
  describe('index', function () {
    beforeEach(function () {
      browser().navigateTo('index.html');
    });

    it('列表正常显示', function () {
      expect(repeater('.nav-list li').count()).toBe(3)
    });
  });
});
