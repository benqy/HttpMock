var util = require('../helpers/util'), fs = require('fs');
var DIR_BASE = './conf/sites/', mocks = util.readJsonSync(DIR_BASE + 'mocks.json') || {};


var getMocks = function () {
  return util.readJsonSync(DIR_BASE + 'mocks.json');
};

var addMock = function (data, oldModal) {
  if (!data || !data.name) return { status: 'error', msg: '请填写完整' };
  if (~data.name.indexOf('://')) {
    data.name = require('url').parse(data.name, true).host || data.name;
  }
  if (!/^[a-z1-9\.]*$/.test(data.name)) return { status: 'error', msg: '域名格式错误' };
  if (isNaN(data.port)) return { status: 'error', msg: '必须指定正确的端口' };
  mocks = getMocks();
  if (oldModal && oldModal.name != data.name) {
    delete mocks[oldModal.name];
  }
  mocks[data.name] = data;
  util.writeFileSync(DIR_BASE + 'mocks.json', JSON.stringify(mocks));
  if (oldModal && oldModal.name != data.name) {
    var routes = getRoutes(oldModal.name);
    Object.keys(routes).forEach(function (key) {
      routes[key].mockName = data.name;
    });
    util.writeFileSync(DIR_BASE + oldModal.name + '.json', JSON.stringify(routes));
    util.renameSync(DIR_BASE + oldModal.name + '.json', DIR_BASE + data.name + '.json');
  }
  return { status: 'success', msg: 'success' };
};

var delMock = function (mock) {
  mocks = getMocks();
  delete mocks[mock.name];
  util.writeFileSync(DIR_BASE + 'mocks.json', JSON.stringify(mocks));
  util.unlinkSync(DIR_BASE + mock.name + '.json');
};

var openMock = function (name, fn) {
  util.readJson(DIR_BASE + name + '.json', fn);
};


var addRoute = function (data, oldData) {
  if (!data || !data.path || (data.delay && isNaN(parseInt(data.delay, 10))) || !data.mockName) return;
  var routes, fileName = DIR_BASE + data.mockName + '.json';
  if (fs.existsSync(fileName)) {
    routes = util.readJsonSync(DIR_BASE + data.mockName + '.json');
    oldData && delete routes[oldData.path];
  }
  routes = routes || {};
  routes[data.path] = data;
  util.writeFileSync(fileName, JSON.stringify(routes));
  return routes;
};

var delRoute = function (data) {
  var routes, fileName = DIR_BASE + data.mockName + '.json';
  if (fs.existsSync(fileName)) {
    routes = util.readJsonSync(DIR_BASE + data.mockName + '.json');
  }
  if (!routes || !routes[data.path]) return;
  delete routes[data.path];
  util.writeFileSync(fileName, JSON.stringify(routes));
  return routes;
};

var getRoutes = function (mockName) {
  var fileName = DIR_BASE + mockName + '.json', routes;
  if (fs.existsSync(fileName)) {
    routes = util.readJsonSync(DIR_BASE + mockName + '.json');
  }
  routes = routes || {};
  return routes;
};

exports.getMocks = getMocks;
exports.addMock = addMock;
exports.delMock = delMock;
exports.openMock = openMock;

exports.addRoute = addRoute;
exports.getRoutes = getRoutes;
exports.delRoute = delRoute;
exports.setDirBase = function (dir) {
  DIR_BASE = dir;
};
