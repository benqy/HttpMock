'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('HttpMock', function () {
  describe('index', function () {
    beforeEach(function () {
      browser().navigateTo('index.html');
    });

    it('should be possible to control phone order via the drop down select box', function () {
      pause();
    });
  });
});
