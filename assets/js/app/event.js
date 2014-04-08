document.addEventListener('WeixinJSBridgeReady', function() {
    WeixinJSBridge.call('hideToolbar');
});

document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
    var host = 'http://' + window.location.host;
    var message = {
        "img_url" : host + '/assets/img/pk-icon.png',
        "img_width" : "640",
        "img_height" : "640",
        "link" : host,
        "desc" : "PK时间到！谁能胜出！？",
        "title" : "锐榜Top10"
    };
    WeixinJSBridge.on('menu:share:appmessage', function(argv) {
        var activeMessage = App.history.active.getWxMessage && App.history.active.getWxMessage();
        WeixinJSBridge.invoke('sendAppMessage', activeMessage || message);
    });
    WeixinJSBridge.on('menu:share:timeline', function(argv) {
        var activeMessage = App.history.active.getWxMessage && App.history.active.getWxMessage();
        WeixinJSBridge.invoke('shareTimeline', activeMessage || message);
    });
}, false);
