$(function() {
    var CommentList = App.CollectionView.extend({
        ModelView: App.ModelView.extend({
            template: TPL['comment-item'],
            className:'comment-list-item',
            render:function(){
                return App.ModelView.prototype.render.call(this);
            }
        })
    });

    App.Pages.List = new (App.PageView.extend({
        events: {
            'click .header-btn-left': 'onClickLeftBtn',
        },
        initPage: function(){
            this.comment_list = new App.Collections.Comment();
            this.views = {
                list: new CommentList({ collection: this.comment_list, el: this.$('.comment-list-content') })
            };
        },
        onClickLeftBtn:function(){
            App.goBack();
        },
        render: function(){
            var id = this.options.topicId;
            var self=this;
            self.comment_list.fetch({
                url: App.configs.APIHost + '/topics/topic/'+id+'/comment/',
                success:function(collection){
                    if(collection.length==0){
                        self.$('.comment-list-content').html('<div class="comment-list-item"><div class="comment-item">暂时无评论</div></div>');
                    }
                }
            });
        }
    }))({el: $("#view-list")});
});
