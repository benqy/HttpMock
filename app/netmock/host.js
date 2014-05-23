var util = require('../helpers/util'), fs = require('fs'),
    //匹配一行host配置(包括被注释的)
    hostReg = /^(#*)\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s{1,}([\w\.\-_]{1,})/,
    hostRegRepeat = /^(#*)\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s{1,}([\w\.\-_]{1,})/igm,
    //匹配一行分组注释
    groupReg = /^#{1,}httpmockgroup\[(.*)\]/,
    groupNames = { "未分组": { name: "未分组", value: "未分组" } };

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

function loadGroupNames() {
  var hostTxt = readHost(), matchs = /#httpmockgroups\[(.*)\]/igm.exec(hostTxt);
  if (matchs && matchs[1]) {
    matchs[1].split(',').forEach(function (item) {
      if (item) {
        groupNames[item] = {
          name: item,
          value: item
        };
      }
    });
  }
  return groupNames;
}

function writeGroupNameToHostTxt(data, hostTxt) {
  var groupNamesArr = [];
  groupNames = data;
  hostTxt = hostTxt || readHost();
  hostTxt = hostTxt.replace(/^[\r\n]*#httpmockgroups\[(.*)\]$/igm, '');
  hostTxt = hostTxt.replace(/[\r\n]*$/g, '');
  for (var key in groupNames) {
    groupNamesArr.push(key);
  }
  hostTxt += '\r\n#httpmockgroups[' + groupNamesArr.join(',') + ']';
  return hostTxt;
}

/**
 * @name loadHostFile
 * @function
 *
 * @description 读取host文件,并解析为分组后的集合对象
 * @returns {Object} host集合对象
 */
function loadHostFile() {
  var index = 1,
      groups = { "未分组": { name: '未分组', hosts: [], index: index } },
      //每行为一项的host文件数组
      hostFileLines = readHost().split('\n'), currentGroup;
  index++;
  groupNames = [];
  loadGroupNames();
  for (var key in groupNames) {
    if (!groups[key]) {
      groups[key] = { name: key, hosts: [], index: index };
      index++;
    }
  }
  hostFileLines.forEach(function (line) {
    var matchs = hostReg.exec(line), host = {}, groupMatch = groupReg.exec(line);
    //读取分组名
    if (groupMatch) {
      currentGroup = groupMatch[1];
      groupNames[currentGroup] = groupNames[currentGroup] || {
        name: currentGroup,
        value: currentGroup
      };
    }
    //这一行是正确的host配置
    if (matchs && !/127\.0\.0\.1\s*localhost/.test(line)) {
      host.effective = !matchs[1];
      host.ip = matchs[2];
      host.address = matchs[3];
      //判断分组
      if (currentGroup) {
        host.group = currentGroup;
        currentGroup = undefined;
      } else {
        host.group = '未分组';
      }
      if (!groups[host.group]) {
        groups[host.group] = { name: host.group, hosts: [], index: index };
        index++;
      }
      groups[host.group].hosts.push(host);
    }
  });
  return groups;
}

/**
 * @name reGroupHost
 * @function
 *
 * @param {Object} groups host分组集合对象
 * @description 对分组重新整理,以纠正那些错误的分组
 * @returns {Object} host集合对象
 */
function reGroupHost(groups) {
  var toGroup = {}, group;
  for (var groupName in groups) {
    group = groups[groupName];
    group.hosts.forEach(function (host) {
      toGroup[host.group] = toGroup[host.group] || { name: host.group, hosts: [] };
      toGroup[host.group].hosts.push(host);
    });
  }
  return toGroup;
};

/**
 * @name writeHostFile
 * @function
 *
 * @param {Object} groups 将host集合对象写入到host文件中
 * @description 对分组重新整理,以纠正那些错误的分组
 * @returns {Object} host集合对象
 */
function writeHostFile(groups, scopeGroupNames) {
  // /#httpmockgroup\[abc\]\r\n#*\s*10\.5\.17\.20\s*svn2\.17173\.com/
  // new RegExp('#httpmockgroup\\[abc\\]\\r\\n#*\\s*10\\.5\\.17\\.20\\s*svn2\\.17173\\.com')
  var txt = readHost(), group;
  txt = txt.replace(/[\r\n]*$/g, '');
  txt = txt.replace(hostRegRepeat, '');
  txt = txt.replace(/#httpmockgroup\[.*\]/igm, '');
  txt = writeGroupNameToHostTxt(scopeGroupNames, txt);
  txt = txt.replace(/[\r\n]*$/g, '');
  //添加本行host
  for (var groupName in groups) {
    group = groups[groupName];
    group.hosts.forEach(function (host) {
      txt += '\r\n#httpmockgroup[' + host.group + ']\r\n'
        + (host.effective ? '' : '#')
        + host.ip
        + ' '
        + host.address;
    });
  }
  util.writeFileSync('C:\\Windows\\System32\\drivers\\etc\\hosts', txt);
  return groups;
};


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
  try {
    var txt = readHost(), addrArr = addrs.split(','), newHost = '';
    addrArr.forEach(function (addr) {
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
exports.globaProxyOn = false;
exports.readHost = readHost;
exports.loadHostFile = loadHostFile;
exports.loadGroupNames = loadGroupNames;
exports.reGroupHost = reGroupHost;
exports.writeHostFile = writeHostFile;
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
  //exec('REGEDIT /S ./netmock/proxy.reg');
  exec(__dirname + '\\runproxy.exe');
  exports.globaProxyOn = true;
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
  //exec('REGEDIT /S ./netmock/disproxy.reg');
  exec(__dirname + '\\stopproxy.exe');
  exports.globaProxyOn = false;
};


//删除已有的host
//for (var groupName in groups) {
//  group = groups[groupName];
//  group.hosts.forEach(function (host) {
//    var regStr, reg;
//    regStr = '^[#httpmockgroup\\['
//      + host.group
//      + '\\]\\r\\n]*#*\\s*'
//      + host.ip.replace(/\./ig, '\\.')
//      + '\\s*'
//      + host.address.replace(/\./ig, '\\.');
//    reg = new RegExp(regStr, 'igm');
//    txt = txt.replace(reg, '');
//  });
//}