
/********************************** Router **********************************/

App.history = {
	active: App.Pages.Home,
	stack: []
};

App.Router = new (Backbone.Router.extend({
	initialize: function(){
		this.route('', 'index');
		this.route(/^home(?:\/topic(\d+))?$/, 'home');
		this.route(/^ranking(?:\/topic(\d+))?$/, 'ranking');
	},
	index: function() {
        App.Pages.Home.go(); App.history.active = App.Pages.Home;
	},
	home: function(tid) { App.Pages.Home.go({topicId: tid}); App.history.active = App.Pages.Home; },
	ranking: function(tid) { App.Pages.Ranking.go({topicId: tid}); App.history.active = App.Pages.Ranking; },
}));

App.goToPath = function(path) {
	App.Router.navigate(path, {trigger: true});
};

App.goTo = function(pageName, options) {
	var next = App.Pages[pageName];
	(options || (options = {})).caller = options.caller || App.history.active;
	if (next != App.history.active) {
	    App.abortAllAjax();
		App.history.stack.push(App.history.active);
		App.history.active = next;
		App.history.active.go(options);
	}
	if (pageName == 'Home') App.history.stack.length = 0;
};

App.refreshActivePage = function() {
	App.history.active.refresh();
};

App.goBack = function() {
    App.abortAllAjax();
	if (App.history.stack.length > 0) {
		var prev = App.history.stack.pop();
		App.history.active = prev;
		App.history.active.showPage(true);
	} else if (App.history.active != App.Pages.Home) {
		App.history.active = App.Pages.Home;
		App.Pages.Home.go();
	}
};
