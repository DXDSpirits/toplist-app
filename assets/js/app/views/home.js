$(function() {
    
    var OneTopic = function() {
        this.topics = new TopApp.Collections.Topics();
        this.i = 0;
        this.topics_json = null;
    };
    
    OneTopic.prototype.pick = function(callback) {
        if (this.topics_json && this.i < this.topics_json.length) {
            callback && callback(this.topics_json[(this.i++)]);
        } else {
            var self = this;
            var method = this.topics_json ? 'fetchNext' : 'fetch';
            this.topics[method]({
                reset: true,
                success: function(collection) {
                    self.topics_json = _.shuffle(collection.toJSON());
                    self.i = 0;
                    self.pick(callback);
                }
            });
        }
    };
    
    var oneTopic = new OneTopic();
    
    var TopicsView = TopApp.View.extend({
        events: {
            'click .pk-item': 'pk',
            'webkitAnimationEnd': 'flipEnd'
        },
        template: TPL['one-topic-page'],
        templatePkItem: TPL['pk-item'],
        initView: function() {},
        flipEnd: function(e) {
            if (e.originalEvent.animationName == "flip") {
                this.$el.removeClass('animate');
            }
        },
        render: function() {
            this.attrs.avatar = _.sample(this.attrs.candidates, 1)[0].picture;
            var self = this;
            setTimeout(function() {
                self.renderTemplate(self.attrs);
                self.renderPk();
            }, 250);
            this.$el.addClass('animate');
            return this;
        },
        renderPk: function() {
            var _shuffle = _.shuffle(this.attrs.candidates);
            var pk1 = this.templatePkItem(_shuffle[0]),
                pk2 = this.templatePkItem(_shuffle[1]);
            var $pkBox = this.$('.pk-box');
            $pkBox.children().animate({
                opacity: 0
            }, 500, function() {
                $pkBox.css({opacity: 1});
                $pkBox.html([pk1, pk2]);
            });
        },
        pk: function(e) {
            var $pkItem = $(e.currentTarget);
            $pkItem.removeClass('fail').addClass('win')
            $pkItem.siblings().removeClass('win').addClass('fail');
            var self = this;
            setTimeout(function() {
                self.renderPk();
            }, 500);
        }
    });
    
    TopApp.Pages.Home = new (TopApp.PageView.extend({
        events: {
            'click .header-btn-right': 'renderTopic'
        },
        initPage: function() {
            this.views = {
                topic: new TopicsView({ el: this.$('.one-topic') })
            };
        },
        renderTopic: function() {
            var self = this;
            oneTopic.pick(function(attrs) {
                var topicView = self.views.topic;
                topicView.attrs = attrs;
                topicView.render();
            });
        },
        render: function() {
            this.renderTopic();
        }
    }))({el: $("#view-home")});
});
