
/********************************** Router **********************************/

TopApp.history = {
	active: TopApp.Pages.Home,
	stack: []
};

TopApp.Router = new (Backbone.Router.extend({
	initialize: function(){
		this.route('', 'index');
		this.route(/^home(?:\/topic(\d+))?$/, 'home');
		this.route(/^ranking(?:\/topic(\d+))?$/, 'ranking');
	},
	index: function() {
        TopApp.Pages.Home.go(); TopApp.history.active = TopApp.Pages.Home;
	},
	home: function(tid) { TopApp.Pages.Home.go({topicId: tid}); TopApp.history.active = TopApp.Pages.Home; },
	ranking: function(tid) { TopApp.Pages.Ranking.go({topicId: tid}); TopApp.history.active = TopApp.Pages.Ranking; },
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
		TopApp.history.active.showPage(true);
	} else if (TopApp.history.active != TopApp.Pages.Home) {
		TopApp.history.active = TopApp.Pages.Home;
		TopApp.Pages.Home.go();
	}
};
