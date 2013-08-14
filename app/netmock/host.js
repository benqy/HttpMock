var util = require('../helpers/util'),fs = require('fs');

function readHost() {
  return util.readFileSync('C:\\Windows\\System32\\drivers\\etc\\hosts');
}

function addHost(ip, address) {
  try{
    var txt = readHost();
    var newHost = '\r\n' + ip + ' ' + address;
    txt = txt.replace(new RegExp(newHost, 'g'), '');
    txt += newHost;
    util.writeFileSync('C:\\Windows\\System32\\drivers\\etc\\hosts', txt);
    return true;
  }
  catch (e) {
    return false;
  }
}

function removeHost(ip, address) {
  try {
    var txt = readHost();
    var newHost = '\r\n' + ip + ' ' + address;
    txt = txt.replace(new RegExp(newHost, 'g'), '');
    txt = txt.replace(new RegExp(ip + ' ' + address, 'g'), '');
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
exports.setProxy = function () {
  var exec = require("child_process").exec;
  exec('REGEDIT /S ./netmock/proxy.reg');
};
exports.disProxy = function () {
  var exec = require("child_process").exec;
  exec('REGEDIT /S ./netmock/disproxy.reg');
}