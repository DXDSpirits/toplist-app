$(function() {
    
    var OneTopic = function() {
        this.topics = new App.Collections.Topics();
        this.i = 0;
    };
    
    OneTopic.prototype.pick = function(callback) {
        if (this.topics_json && this.i < this.topics_json.length) {
            callback && callback(this.topics_json[(this.i++)]);
        } else {
            var self = this;
            this.topics.fetch({
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
    
    var TopicsView = App.View.extend({
        events: {
            'click .pk-item .fa': 'pk',
            'click .skip-pk': 'renderPk',
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
            var $refresh = this.$('.skip-pk .fa-refresh');
            $refresh.removeClass('invisible');
            setTimeout(function() { $refresh.addClass('invisible'); }, 1000);
            $pkBox.children().animate({
                opacity: 0
            }, 200, function() {
                $pkBox.css({opacity: 1});
                $pkBox.html([pk1, pk2]);
            });
        },
        pk: function(e) {
            if (e.stopPropagation) e.stopPropagation();
            var $pkItem = $(e.currentTarget).closest('.pk-item');
            $pkItem.removeClass('fail').addClass('win');
            $pkItem.siblings().removeClass('win').addClass('fail');
            var self = this;
            setTimeout(function() {
                self.renderPk();
            }, 1000);
        }
    });
    
    App.Pages.Home = new (App.PageView.extend({
        events: {
            'click .header-btn-left': 'viewRanking',
            'click .header-btn-right': 'renderTopic',
            'click .pk-item': 'viewImage'
        },
        initPage: function() {
            _.bindAll(this, 'renderTopic');
            this.topicAttrs = {};
            this.views = {
                topic: new TopicsView({ el: this.$('.one-topic') })
            };
        },
        viewRanking: function() {
            App.goTo('Ranking', {topic: this.topicAttrs});
        },
        getWxMessage: function() {
            var message = {
                img_url : App.makeUrl('/assets/img/pk-icon.png'),
                img_width : "640",
                img_height : "640",
                link : App.makeUrl('#home/topic' + this.topicAttrs.id),
                desc : this.topicAttrs.title + ' ' + this.topicAttrs.description,
                title : "锐榜Top10/PK时间到"
            };
            return message;
        },
        viewImage: function(e) {
            var $pkItem = $(e.currentTarget);
            var $fullscreen = this.$('.fullscreen');
            if ($fullscreen.hasClass('invisible')) {
                $fullscreen.css('background-image', $pkItem.css('background-image'));
                $fullscreen.removeClass('invisible');
                $fullscreen.one('click', function() {
                    $(this).addClass('invisible');
                });
            }
        },
        renderTopic: function(attrs) {
            if (attrs) {
                var topicView = this.views.topic;
                this.topicAttrs = topicView.attrs = attrs;
                topicView.render();
            } else {
                oneTopic.pick(this.renderTopic);
            }
        },
        render: function() {
            if (this.options.topicId) {
                var topic = new App.Models.Topic({id: this.options.topicId});
                var self = this;
                topic.fetch({success: function() {
                    self.renderTopic(topic.toJSON());
                }});
            } else {
                this.renderTopic();
            }
        }
    }))({el: $("#view-home")});
});
