
/********************************** Router **********************************/

TopApp.history = {
	active: TopApp.Pages.Home,
	stack: []
};

TopApp.Router = new (Backbone.Router.extend({
	initialize: function(){
		this.route('', 'index');
		this.route(/^home(?:\/l(\d+))?$/, 'home');
	},
	index: function() {
	    if (localStorage.getItem('first-time')) {
	        TopApp.Pages.Home.go(); TopApp.history.active = TopApp.Pages.Home;
	    } else {
	        TopApp.Pages.GetStarted.go(); TopApp.history.active = TopApp.Pages.GetStarted;
	    }
	},
	home: function(lid) { TopApp.Pages.Home.go({listId: lid}); TopApp.history.active = TopApp.Pages.Home; },
}));

TopApp.goToPath = function(path) {
	TopApp.Router.navigate(path, {trigger: true});
};

TopApp.goTo = function(pageName, options) {
	var next = TopApp.Pages[pageName];
	(options || (options = {})).caller = options.caller || TopApp.history.active;
	if (next != TopApp.history.active) {
	    TopApp.abortAllAjax();
		TopApp.history.stack.push(TopApp.history.active);
		TopApp.history.active = next;
		TopApp.history.active.go(options);
	}
	if (pageName == 'Home') TopApp.history.stack.length = 0;
};

TopApp.refreshActivePage = function() {
	TopApp.history.active.refresh();
};

TopApp.goBack = function() {
    TopApp.abortAllAjax();
	if (TopApp.history.stack.length > 0) {
		var prev = TopApp.history.stack.pop();
		TopApp.history.active = prev;
		TopApp.history.active.showPage();
	} else if (TopApp.history.active != TopApp.Pages.Home) {
		TopApp.history.active = TopApp.Pages.Home;
		TopApp.Pages.Home.go();
	}
};
