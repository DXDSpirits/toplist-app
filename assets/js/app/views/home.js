$(function() {
    var TopicsView = TopApp.CollectionView.extend({
        ModelView: TopApp.ModelView.extend({
            template: TPL['one-topic-page'],
            className: 'topic'
        })
    });
    TopApp.Pages.Home = new (TopApp.PageView.extend({
        events: {
            
        },
        initPage: function() {
            this.views = {
                topics: new TopicsView({
                    collection: TopApp.Data.Topics,
                    el: this.$('.carousel-inner')
                })
            };
        },
        fixTopicWidth: function() {
            var screenWidth = $(window).innerWidth();
            this.$('.carousel-inner').css('width', screenWidth * 3);
            this.$('.topic').css('width', screenWidth);
        },
        initScroller: function() {
            if (!this.scroller) {
                this.scroller = new IScroll(this.$('.carousel').selector, {
                    scrollX: true,
                    scrollY: false,
                    disableMouse: false,
                    snap: true,
                    momentum: false
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
