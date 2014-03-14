
TopApp.View = Backbone.View.extend({
    initialize: function() {
        this.fastButtons = [];
        this.delegateFastButtons();
        if (this.initView) this.initView();
    },
    remove: function() {
        this.$el.remove();
        this.stopListening();
        this.removeFastButtons();
        return this;
    },
    displayError: function($el, text) {
        try {
            var error = JSON.parse(text);
            for (var k in error) { $el.html(error[k]);  break; };
        } catch (e) {
            $el.text(text || 'Error');
        }
    },
    bindFastButton: function(el, handler) {
        var btn = new MBP.fastButton(el.length && el.length == 1 ? el[0] : el, handler);
        this.fastButtons.push(btn);
    },
    delegateFastButtons: function() {
        var EVENT_NAME = 'fastclick';
        var events = (_.isFunction(this.events) ? this.events() : this.events) || {};
        var that = this;
        function byEventName(key) {
            return key.substr(0, EVENT_NAME.length + 1) === EVENT_NAME + ' ' || key === EVENT_NAME;
        }
        function toJustSelectors(key) {
            return key.substr(EVENT_NAME.length + 1);
        }
        function toMatchingElements(selector) {
            return selector === "" ? [that.el] : that.$(selector).toArray();
        }
        function registerTrigger(element) {
            //new MBP.fastButton(element, function() {
            that.bindFastButton(element, function() {
                $(element).trigger(EVENT_NAME);
            });
        }
        _.chain(events).keys().filter(byEventName).map(toJustSelectors).map(toMatchingElements).flatten().each(registerTrigger);
    },
    removeFastButtons: function() {
        var btns = this.fastButtons;
        for (var i=0; i<btns.length; i++) {
            btns[i].destroy();
        }
        this.fastButtons.length = 0;
    },
    template: Mustache.compile(""),
    renderTemplate: function(attrs) {
        this.removeFastButtons();
        this.$el.html(this.template(attrs || {}));
        this.delegateFastButtons();
        TopApp.initLang(this.$el);
        return this;
    }
});

TopApp.ModelView = TopApp.View.extend({
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

TopApp.CollectionView = TopApp.View.extend({
    ModelView: TopApp.ModelView,
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

TopApp.PageView = TopApp.View.extend({
    events: {
        'fastclick .header-btn-left': 'onClickLeftBtn',
        'fastclick .header-btn-right': 'onClickRightBtn'
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
            if (e.originalEvent.animationName == "slideouttoleft") {
            	$el.trigger('pageClose');
            } else if (e.originalEvent.animationName == "slideinfromright") {
            	$el.trigger('pageOpen');
            }
        });
        if (this.initPage) this.initPage();
    },
    onClickLeftBtn: function() { TopApp.goBack(); },
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
    showPage: function() {
        if (this.$el && this.$el.hasClass('view-hidden')) {
            var $curPage = $('.view:not(".view-hidden")');
            var curPageCloseTimeout;
            var closeCurPage = function() {
                clearTimeout(curPageCloseTimeout);
                $curPage.removeClass('view-prev');
                $curPage.find('input').blur();
            };
            $curPage.addClass('view-hidden');
            $curPage.addClass('view-prev');
            curPageCloseTimeout = setTimeout(closeCurPage, 1000);
            $curPage.one('pageClose', closeCurPage);
            
            var $nextPage = this.$el;
            var nextPageOpenTimeout;
            var openNextPage = function() {
                clearTimeout(nextPageOpenTimeout);
                $nextPage.removeClass('view-next');
                $nextPage.find('input').blur();
                TopApp.sendGaPageView($nextPage.attr('id')); // Google Analytics
                window.scrollTo(0, 0);
            };
            $nextPage.removeClass('view-hidden');
            $nextPage.addClass('view-next');
            nextPageOpenTimeout = setTimeout(openNextPage, 1000);
            $nextPage.one('pageOpen', openNextPage);
        }
    }
});
