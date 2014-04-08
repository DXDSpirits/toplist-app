
App.View = Backbone.View.extend({
    initialize: function() {
        if (this.initView) this.initView();
    },
    displayError: function($el, text) {
        try {
            var error = JSON.parse(text);
            for (var k in error) { $el.html(error[k]);  break; };
        } catch (e) {
            $el.text(text || 'Error');
        }
    },
    template: Mustache.compile(""),
    renderTemplate: function(attrs) {
        this.$el.html(this.template(attrs || {}));
        return this;
    }
});

App.ModelView = App.View.extend({
    initView: function() {
        if (this.model) {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'hide', this.hide);
        }
        if (this.initModelView) this.initModelView();
    },
    hide: function() {
        var self = this;
        this.$el.animate({
            opacity: 0
        }, 1000, function() {
            self.remove();
        });
    },
    render: function() {
        var attrs = this.model ? this.model.toJSON() : {};
        return this.renderTemplate(attrs);
    }
});

App.CollectionView = App.View.extend({
    ModelView: App.ModelView,
    initView: function() {
        if (this.collection) {
            this.listenTo(this.collection, 'reset', this.addAll);
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'remove', this.removeOne);
        }
        if (this.initCollectionView) this.initCollectionView();
    },
    removeOne: function(item) {
        item.trigger('hide');
    },
    addOne: function(item) {
        var modelView = new this.ModelView({model: item});
        this.$el.append(modelView.render().el);
    },
    addAll: function(_collection, options) {
    	if (options && options.previousModels) {
	    	_.each(options.previousModels, function(model) {
	       		model.trigger('hide');
	    	});
	    }
        if (this.collection) {
            var $list = [];
            this.collection.forEach(function(item) {
                var modelView = new this.ModelView({model: item});
                $list.push(modelView.render().el);
            }, this);
            this.$el.html($list);
        }
    },
    render: function() {
        this.addAll();
        return this;
    }
});

App.PageView = App.View.extend({
    events: {
        'click .header-btn-left': 'onClickLeftBtn',
        'click .header-btn-right': 'onClickRightBtn'
    },
    disablePage: function() {
        this.undelegateEvents();
        this.go = this.refresh = this.showPage = function() {};
    },
    initView: function() {
        if (!this.el) {
            this.disablePage();
            return;
        }
        this.views = {};
        _.bindAll(this, 'showPage', 'go', 'refresh', 'render', 'reset', 
                        'onClickLeftBtn', 'onClickRightBtn');
        var $el = this.$el;
        this.$('.wrapper').on('webkitAnimationEnd', function(e) {
            var animationName = e.originalEvent.animationName;
            if (animationName == "slideouttoleft" || animationName == "slideouttoright") {
            	$el.trigger('pageClose');
            } else if (animationName == "slideinfromright" || animationName == "slideinfromleft") {
            	$el.trigger('pageOpen');
            }
        });
        if (this.initPage) this.initPage();
    },
    onClickLeftBtn: function() { App.goBack(); },
    onClickRightBtn: function() {},
    initPageNav: function(page, collection) {
        var fetching = false;
        page.resetNavigator = function() {
            fetching = false;
            page.$('.null-list-help').toggleClass('hidden', collection.length > 0);
            page.$('.page-nav').toggleClass('hidden', collection.next == null);
        };
        page.fetchMore = function() {
            if (fetching || !collection.next) return;
            fetching = true;
            collection.fetchNext({
                remove: false, success: page.resetNavigator, error: page.resetNavigator
            });
        };
        var viewportHeight = $(window).height() + 50;
        page.$('.wrapper').scroll(function() {
            if (page.$el.hasClass('view-hidden')) return;
            if (page.$('.page-nav').offset().top < viewportHeight) {
                page.fetchMore();
            }
        });
        page.listenTo(collection, 'reset', page.resetNavigator);
    },
    go: function(options) {
        this.options = options || {};
        this.reset();
        var timeout;
        var render = this.render, pageOpen = function() {
            clearTimeout(timeout);
            render();
        };
        timeout = setTimeout(pageOpen, 1000);
        this.$el.one('pageOpen', pageOpen);
        this.showPage();
    },
    refresh: function() {
        var timeout;
        var render = this.render, pageOpen = function() {
            clearTimeout(timeout);
            render();
        };
        timeout = setTimeout(pageOpen, 1000);
        this.$el.one('pageOpen', pageOpen);
        this.showPage();
    },
    reset: function() {},
    showPage: function(back) {
        if (this.$el && this.$el.hasClass('view-hidden')) {
            var $curPage = $('.view:not(".view-hidden")');
            var curPageCloseTimeout;
            var closeCurPage = function() {
                clearTimeout(curPageCloseTimeout);
                $curPage.removeClass('view-prev').removeClass('view-prev-back');
                $curPage.find('input').blur();
            };
            $curPage.addClass('view-hidden');
            $curPage.addClass('view-prev');
            if (back) $curPage.addClass('view-prev-back');
            curPageCloseTimeout = setTimeout(closeCurPage, 1000);
            $curPage.one('pageClose', closeCurPage);
            
            var $nextPage = this.$el;
            var nextPageOpenTimeout;
            var openNextPage = function() {
                clearTimeout(nextPageOpenTimeout);
                $nextPage.removeClass('view-next').removeClass('view-next-back');
                $nextPage.find('input').blur();
                App.sendGaPageView($nextPage.attr('id')); // Google Analytics
                window.scrollTo(0, 0);
            };
            $nextPage.removeClass('view-hidden');
            $nextPage.addClass('view-next');
            if (back) $nextPage.addClass('view-next-back');
            nextPageOpenTimeout = setTimeout(openNextPage, 1000);
            $nextPage.one('pageOpen', openNextPage);
        }
    }
});
