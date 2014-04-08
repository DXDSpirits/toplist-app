$(function() {
    var TopicsView = TopApp.ModelView.extend({
        template: TPL['topic-ranking']
    });
    
    TopApp.Pages.Ranking = new (TopApp.PageView.extend({
        initPage: function() {
            this.topic = new TopApp.Models.Topic();
            this.views = {
                topic: new TopicsView({
                    el: this.$('.wrapper'),
                    model: this.topic
                })
            };
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
