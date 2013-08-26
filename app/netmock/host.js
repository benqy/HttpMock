var util = require('../helpers/util'),fs = require('fs');

/**
 * @name readHost
 * @function
 *
 * @description 读取windows系统的host文件(暂时只考虑c盘的)
 * @returns {string} host文件的文本内容
 */
function readHost() {
  return util.readFileSync('C:\\Windows\\System32\\drivers\\etc\\hosts');
}

/**
 *TODO 正确的获取host路径
 * @name addHost
 * @function
 *
 * @description 向windows系统的host文件中添加host配置
 * @param {string} ip IP
 * @param {string} addrs 域名,多个可用逗号分隔
 * @returns {Boolean} 成功或者失败
 */
function addHost(ip, addrs) {
  if (!addrs) return false;
  try{
    var txt = readHost(), addrArr = addrs.split(','), newHost = '';
    addrArr.forEach(function(addr) {
      if (addr) {
        //移除已经有的此域名配置
        txt = txt.replace(new RegExp(ip + ' ' + addr, 'g'), '');
        //移除多余的换行
        txt = txt.replace(/[\r\n]*$/g, '');
        newHost += '\r\n' + ip + ' ' + addr;
      }
    });
    txt += newHost;
    txt = txt.replace(/[\r\n]*$/g, '');
    util.writeFileSync('C:\\Windows\\System32\\drivers\\etc\\hosts', txt);
    return true;
  }
  catch (e) {
    console.dir(e);
    return false;
  }
}

/**
 * @name removeHost
 * @function
 *
 * @description 删除匹配的host配置(windows).
 * @param {string} ip IP
 * @param {string} address 域名
 * @returns {Boolean} 成功或者失败
 */
function removeHost(ip, addrs) {
  try {
    var txt = readHost(), addrArr = addrs.split(',');
    addrArr.forEach(function (addr) {
      if (addr) {
        txt = txt.replace(new RegExp('\r\n' + ip + ' ' + addr, 'g'), '');
        txt = txt.replace(new RegExp(ip + ' ' + addr, 'g'), '');
      }
    });
    txt = txt.replace(/[\r\n]*$/g, '');
    util.writeFileSync('C:\\Windows\\System32\\drivers\\etc\\hosts', txt);
    return true;
  }
  catch (e) {
    return false;
  }
}

exports.readHost = readHost;
exports.addHost = addHost;
exports.removeHost = removeHost;

/**
 * @name setProxy
 * @function
 *
 * @description 设置ie浏览器的代理设置为 http 127.0.0.1:17173
 * @returns {undefined}
 */
exports.setProxy = function () {
  var exec = require("child_process").exec;
  exec('REGEDIT /S ./netmock/proxy.reg');
};

/**
 * @name disProxy
 * @function
 *
 * @description 取消ie浏览器的代理设置
 * @returns {undefined}
 */
exports.disProxy = function () {
  var exec = require("child_process").exec;
  exec('REGEDIT /S ./netmock/disproxy.reg');
}