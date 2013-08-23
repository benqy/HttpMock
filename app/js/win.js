var nm = require('./netmock'), gui = require('nw.gui');

//将保存路径切换到系统设置里的路径
var userAppPath = gui.App.dataPath;
nm.setSystemSettingFile(gui.App.dataPath + '/systemsetting.json');
var ss = nm.getSystemSetting(), userAppPath = ss.storeDir || gui.App.dataPath;
userAppPath = require('path').normalize(userAppPath + '/');
nm.mocks.setDirBase(userAppPath);
// Reference to window and tray
var win = gui.Window.get(), isMaximize = false;
if (win) {
  //win.maximize();
  //var tray;

  //win.on('minimize', function () {
  //  this.hide();
  //  tray = new gui.Tray({ icon: 'logo.png' });
  //  tray.on('click', function () {
  //    win.show();
  //    this.remove();
  //    tray = null;
  //  });
  //});
  win.on('maximize', function () {
    isMaximize = true;
    $('#maxWindow i').removeClass('icon-fullscreen').addClass('icon-resize-small');
  });
  win.on('unmaximize', function () {
    isMaximize = false;
    $('#maxWindow i').removeClass('icon-resize-small').addClass('icon-fullscreen');
  });
  win.on('close', function () {
    nm.host.disProxy();
    this.close(true);
  });
}
$('#minWindow').on('click', function () {
  var win = gui.Window.get();
  win.minimize();
});
$('#maxWindow').on('click', function () {
  var win = gui.Window.get();
  if (isMaximize) {
    win.unmaximize();
  }
  else {
    win.maximize();
  }
});
$('#closeWindow').on('click', function () {
  var win = gui.Window.get();
  nm.host.disProxy();
  win.close();
});

//$('#devTool').on('click', function () {
//  gui.Window.get().showDevTools();
//});

//$('#reload').on('click', function () {
//  gui.Window.get().reload();
//});

$('#needHelp').on('click', function () {
  gui.Shell.openExternal('https://github.com/benqy/HttpMock');
});
//process.on('uncaughtException', function (err) {
//  console.log(err);
//  alert('出现了奇怪的弹框,说明出异常了,如果有问题,请重启');
//});


