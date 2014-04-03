$(function() {
    var TopicsView = TopApp.CollectionView.extend({
        ModelView: TopApp.ModelView.extend({
            events: { 'click .pk-item': 'pk' },
            template: TPL['one-topic-page'],
            className: 'one-topic',
            render: function() {
                var attrs = this.model ? this.model.toJSON() : {};
                attrs.image = attrs.candidates[0].image;
                _shuffle = _.shuffle(attrs.candidates);
                attrs.avatar = _shuffle[0];
                attrs.pk1 = _shuffle[1];
                attrs.pk2 = _shuffle[2];
                return this.renderTemplate(attrs);
            },
            pk: function(e) {
                var $pkItem = $(e.currentTarget);
                $pkItem.removeClass('fail').addClass('win')
                       .siblings().removeClass('win').addClass('fail');
            }
        })
    });
    
    TopApp.Pages.Home = new (TopApp.PageView.extend({
        events: {},
        initPage: function() {
            this.views = {
                topics: new TopicsView({
                    collection: TopApp.Data.Topics,
                    el: this.$('.carousel-inner')
                })
            };
        },
        fixTopicWidth: function() {
            var screenWidth = this.$('.wrapper').innerWidth();
            this.$('.carousel-inner').css('width', screenWidth * TopApp.Data.Topics.length);
            this.$('.one-topic').css('width', screenWidth);
        },
        initScroller: function() {
            if (!this.scroller) {
                this.scroller = new IScroll(this.$('.carousel').selector, {
                    scrollX: true,
                    scrollY: false,
                    disableMouse: false,
                    snap: true,
                    momentum: false,
                    eventPassthrough: true
                });
            } else {
                this.scroller.refresh();
            }
        },
        render: function() {
            var self = this;
            TopApp.Data.Topics.fetch({
                reset: true,
                success: function() {
                    self.fixTopicWidth();
                    self.initScroller();
                }
            });
            
        }
    }))({el: $("#view-home")});
});
