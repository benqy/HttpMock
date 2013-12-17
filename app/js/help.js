(function () {
  var helps = [
    '试着拖动一个文件(文件夹)到软件中看看',
    '目前还不支持https和websocket',
    '意见、反馈和bug截图: hmjlr123@gmail.com',
    '数据默认存放在C:\\Users\\用户\\AppData\\Local\\HttpMock,你可以改成存在同步盘,这样就可以同步了',
    'firefox和chrome,请将代理设置为使用系统代理',
    '理论上是支持mac版的.但是,没条件编译mac版啊',
    '通用的header,可以在系统设置中设置,这样所有mock都可以共享了',
    '路由设置里勾选请求原始地址,则该路由会直接返回原始地址的结果,不会返回路由配置里的response',
    '其实现在还是0.0000000001版,遇到bug,麻烦把截图发给我,帮助我完善工具.反馈邮箱:hmjlr123@gmail.com',
    '停止服务器前,请先关闭打开的页面,因为是keep-alive,服务器实际上会等到没有活动的请求时,才会关闭',
    '路由如果指向的是一个文件夹,则这个文件夹下的所有文件都可以访问(即拖动一个文件夹到软件中)',
    '需要根据请求参数来处理一些逻辑?在路由的返回值里,勾选自定义函数',
    '如果请求带callback参数,则请求的返回值会自动按jsonp格式包裹',
    'winXP和win8系统还没未经过测试,不保证能使用'
  ];
  var index = Math.floor(Math.random() * helps.length); 
  var msg = helps[index];
  app.showMsg(msg, '各种心得!', app.showMsg.TYPES.info, true);
  $('#nextHelp').on('click', function () {
    index++;
    if (index >= helps.length) index = 0;
    app.showMsg(helps[index], '各种心得!', app.showMsg.TYPES.info, true);
  });
})();