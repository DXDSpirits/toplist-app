document.addEventListener("deviceready", TopApp.start, false);
document.addEventListener("backbutton", function( e ) {
	if(TopApp.history.active != TopApp.Pages.Home){
		e.preventDefault();
        if (TopApp.history.active && TopApp.history.active.onClickLeftBtn) {
            TopApp.history.active.onClickLeftBtn();
        }
	}
}, false);
document.addEventListener('WeixinJSBridgeReady', function() {
    WeixinJSBridge.call('hideToolbar');
});

});
