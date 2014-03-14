
TopApp.Collection = Backbone.Collection.extend({
	parse: function(response) {
		if (response.results != null) {
			this.count = response.count;
			this.previous = response.previous;
			this.next = response.next;
			return response.results;
		} else {
			return response;
		}
	},
	smartSet: function(models, options) {
		this[this.isEmpty() ? 'reset' : 'set'](models, options);
	},
	fetchNext: function(options) {
		var options = options || {};
		if (this.next) {
			options.url = this.next;
			this.fetch(options);
		}
	},
	fetchPrev: function(options) {
		var options = options || {};
		if (this.previous) {
			options.url = this.previous;
			this.fetch(options);
		}
	},
	fetch: function(options) {
		options = options || {};
		options.reset = options.reset || this.isEmpty();
		if (options.delay) {
		    var self = this;
		    setTimeout(function() {
		       Backbone.Collection.prototype.fetch.call(self, options); 
		    }, options.delay);
		} else {
		    return Backbone.Collection.prototype.fetch.call(this, options);
		}
	},
});

TopApp.Model = Backbone.Model.extend({
	fetch: function(options) {
		options = options || {};
		if (options.delay) {
		    var self = this;
		    setTimeout(function() {
		        Backbone.Model.prototype.fetch.call(self, options);
		    }, options.delay);
		} else {
		    return Backbone.Model.prototype.fetch.call(this, options);
		}
	},
	url: function() {
		if (this.attributes.url) {
			return this.attributes.url;
		} else {
			var origUrl = Backbone.Model.prototype.url.call(this);
			return origUrl + (origUrl.charAt(origUrl.length - 1) == '/' ? '' : '/');
		}
	}
});
