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
        events: { 'click .pk-item': 'pk' },
        template: TPL['one-topic-page'],
        initView: function() {
            _.bindAll(this, 'render');
            this.$el.on('webkitAnimationEnd', function(e) {
                if (e.originalEvent.animationName == "flip") {
                    $(this).removeClass('animate');
                }
            });
        },
        render: function(attrs) {
            this.$el.addClass('animate');
            var self = this;
            setTimeout(function() {
                attrs.image = attrs.candidates[0].image;
                _shuffle = _.shuffle(attrs.candidates);
                attrs.avatar = _shuffle[0];
                attrs.pk1 = _shuffle[1];
                attrs.pk2 = _shuffle[2];
                self.renderTemplate(attrs);
            }, 250);
            return this;
        },
        pk: function(e) {
            var $pkItem = $(e.currentTarget);
            $pkItem.removeClass('fail').addClass('win')
                   .siblings().removeClass('win').addClass('fail');
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
            oneTopic.pick(this.views.topic.render);
        },
        render: function() {
            this.renderTopic();
        }
    }))({el: $("#view-home")});
});
