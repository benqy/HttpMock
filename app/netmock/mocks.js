var util = require('../helpers/util'), fs = require('fs');
var DIR_BASE = './conf/sites/', mocks = util.readJsonSync(DIR_BASE + 'mocks.json') || {};


/**
 * @name getMocks
 * @function
 *
 * @description
 * 获取并返回所有的mock.
 *
 * @return {Object} 以id为key的mock集合对象{id1:mock1,id2:mock2}
 */
var getMocks = function () {
  return util.readJsonSync(DIR_BASE + 'mocks.json');
};

/**
 * @name updateMock
 * @function
 *
 * @description 保存传进来的mock,如果没id,则为新建.
 * @param {Object} data mock对象.
 * @returns {Object} 保存是否成功 {success:boolean,msg:string}.
 */
var updateMock = function (data) {
  if (!data || !data.name) return { success: false, msg: '请填写完整' };
  if (~data.name.indexOf('://')) {
    data.name = require('url').parse(data.name, true).host || data.name;
  }
  if (!/^[a-z1-9\.\-_]*$/.test(data.name)) return { success: false, msg: '域名格式错误' };
  if (isNaN(data.port)) return { success: false, msg: '必须指定正确的端口' };

  mocks = getMocks();
  if (!data.id) {
    data.id = util.generalId();
  }
  data.name = data.name.toLowerCase();
  if (data.secondaryName) {
    data.secondaryName = data.secondaryName.toLowerCase();
  }
  mocks[data.id] = data;
  util.writeFileSync(DIR_BASE + 'mocks.json', JSON.stringify(mocks));
  return { success: true, msg: 'success' };
};

/**
 * @name delMock
 * @function
 *
 * @description 删除mock.
 * @param {string} id 要删除的mock的id
 * @returns {Object} 删除是否成功 {success:boolean,msg:string}.
 */
var delMock = function (id) {
  mocks = getMocks();
  delete mocks[id];
  try{
    util.writeFileSync(DIR_BASE + 'mocks.json', JSON.stringify(mocks));
    util.unlinkSync(DIR_BASE + id + '.json');
  }
  catch (e) {
    return { success: false, msg: '异常' };
  }
  return { success: true, msg: 'success' };
};

/**
 * @name updateRoute
 * @function
 *
 * @description 保存传进来的route,如果没id,则为新建.
 * @param {Object} data 要保存的route
 * @returns {Object} 保存是否成功 {success:boolean,msg:string}.
 */
var updateRoute = function (data) {
  if (!data || !data.path || (data.delay && isNaN(parseInt(data.delay, 10))) || !data.mockId) {
    return { success: false, msg: '错误' };
  };
  var routes, fileName = DIR_BASE + data.mockId + '.json', customHeaders = [];
  if (fs.existsSync(fileName)) {
    routes = util.readJsonSync(fileName);
  }
  routes = routes || {};
  //如果不存在id,则为新建,需要判断path是否重复,并且生成一个id
  if (!data.id) {
    for (var key in routes) {
      if (routes[key].path === data.path) {
        return { success: false, msg: '同一mock的路径不可重复' };
      }
    }
    data.id = util.generalId();
  }
  //移除空的customheader
  if (data.customHeaders) {
    data.customHeaders.forEach(function (item) {
      if (item.name && item.value) customHeaders.push(item);
    });
  }
  data.customHeaders = customHeaders;
  data.path = data.path.toLowerCase();
  routes[data.id] = data;
  util.writeFileSync(fileName, JSON.stringify(routes));
  return { success: true, msg: 'success' };
};

/**
 * @name delRoute
 * @function
 *
 * @description 删除route.
 * @param {string} id 要删除的route的id
 * @returns {Object} 删除是否成功 {success:boolean,msg:string}.
 */
var delRoute = function (mockId,id) {
  var routes, fileName = DIR_BASE + mockId + '.json';
  if (fs.existsSync(fileName)) {
    routes = util.readJsonSync(fileName);
  }
  console.log(routes,id)
  if (!routes || !routes[id]) return { success: false, msg: '不存在' };
  delete routes[id];
  util.writeFileSync(fileName, JSON.stringify(routes));
  return { success: true, msg: 'success' };
};

/**
 * @name getRoutes
 * @function
 *
 * @description 取出指定mock的所有route.
 * @param {string} id mock的id
 * @returns {Object} 以id为key的route集合对象{id1:mock1,id2:mock2}
 */
var getRoutes = function (mockId) {
  var fileName = DIR_BASE + mockId + '.json', routes;
  if (fs.existsSync(fileName)) {
    routes = util.readJsonSync(fileName);
  }
  routes = routes || {};
  return routes;
};

exports.getMocks = getMocks;
exports.updateMock = updateMock;
exports.delMock = delMock;

exports.updateRoute = updateRoute;
exports.getRoutes = getRoutes;
exports.delRoute = delRoute;
exports.setDirBase = function (dir) {
  DIR_BASE = dir;
};
