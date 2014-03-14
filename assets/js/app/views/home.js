$(function() {
    var TopicsView = TopApp.CollectionView.extend({
        ModelView: TopApp.ModelView.extend({
            template: TPL['one-topic-page'],
            className: 'one-topic',
            render: function() {
                var attrs = this.model ? this.model.toJSON() : {};
                attrs.image = attrs.candidates[0].image;
                attrs.pk1 = _.sample(attrs.candidates);
                attrs.pk2 = _.sample(attrs.candidates);
                return this.renderTemplate(attrs);
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
            this.views.topics.render();
            this.fixTopicWidth();
            this.initScroller();
        }
    }))({el: $("#view-home")});
});
