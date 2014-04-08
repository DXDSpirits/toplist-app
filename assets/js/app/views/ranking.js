$(function() {
    var TopicsView = TopApp.ModelView.extend({
        template: TPL['topic-ranking']
    });
    
    TopApp.Pages.Ranking = new (TopApp.PageView.extend({
        events: {
            'click .header-btn-left': 'onClickLeftBtn',
            'click .header-btn-right': 'onClickRightBtn',
            'click .candidate': 'viewImage'
        },
        initPage: function() {
            this.topic = new TopApp.Models.Topic();
            this.views = {
                topic: new TopicsView({
                    el: this.$('.wrapper'),
                    model: this.topic
                })
            };
        },
        viewImage: function(e) {
            var $avatar = $(e.currentTarget).find('.avatar');
            var $fullscreen = this.$('.fullscreen');
            if ($fullscreen.hasClass('invisible')) {
                $fullscreen.css('background-image', $avatar.css('background-image'));
                $fullscreen.removeClass('invisible');
                $fullscreen.one('click', function() {
                    $(this).addClass('invisible');
                });
            }
        },
        render: function() {
            if (this.options.topicId) {
                this.topic.clear();
                this.topic.set({id: this.options.topicId});
                this.topic.fetch();
            } else if (this.options.topic) {
                this.topic.set(this.options.topic);
            }
        }
    }))({el: $("#view-ranking")});
});
