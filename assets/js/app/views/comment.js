$(function() {
    App.Pages.Comment = new (App.PageView.extend({
        events: {
            'click .header-btn-left': 'onClickLeftBtn',
            'click .header-btn-right': 'onClickRightBtn',
            'click .dialog-comment': 'focusTextarea'
        },
        initPage: function(){

        },
        onClickLeftBtn:function(){
            this.postArticle();
        },
        onClickRightBtn: function(){
            App.goBack();
        },
        postArticle:function(){
            var id = this.options.topicId;
            var comment = this.$('#comment-box').val();
            if(/^\s*$/.test(comment)){
                this.$('#comment-box').val('');
                App.showAlertDialog('内容为空');
                return;
            }
            var post = new (Backbone.Model.extend({
                urlRoot: App.configs.APIHost + '/topics/topic/'+id+'/comment/'
            }))();
            post.set({content:comment}).save({},{
                success:function(){
                    this.$('#comment-box').val('');
                    App.goBack();
                },
                error:function(){
                    //稍后重试
                    App.showAlertDialog('提交失败,稍后重试');
                }
            });
        },
        render:function(){
            setTimeout(function(){
                //this.$('#comment-box').click();
                this.$('.dialog-comment').trigger('click');
            },100);
        },
        focusTextarea: function(e){
            this.$('#comment-box').focus();
        }
    }))({el: $("#view-comment")});
});
