$(function() {
    var TopicsView = App.ModelView.extend({
        template: TPL['topic-ranking'],
        events:{
            'webkitAnimationEnd .wellbox': 'flipEnd',
            'click .like-btn':'likeIt'
        },
        flipEnd: function(e) {
            if (e.originalEvent.animationName == "flip") {
                this.$('.wellbox').removeClass('animate');
            }
        },
        likeIt:function(e){
            var like_times;
            var topic_id=this.model.get('id');
            var thumb_icon = $(e.currentTarget).find('.fa-thumbs-up').removeClass('like');
            
            var times_array=JSON.parse(window.localStorage.getItem('like_times'));
            if(times_array[topic_id]){
                like_times=parseInt(times_array[topic_id]||0);
            }
            else{
                times_array[topic_id]=0;
                like_times=0;
            }
            if(like_times<3){
                var id = thumb_icon.attr('data-id');
                var scoreP=$(e.currentTarget).siblings('.score');
                scoreP.text(parseInt(scoreP.text())+1);
                new (Backbone.Model.extend({urlRoot: App.configs.APIHost + '/topics/candidate/'+id+'/like/'}))().save();
                var times_array=JSON.parse(window.localStorage.getItem('like_times'));
                times_array[topic_id]=like_times+1;
                $('.header-btn-left .btn-text b').text(2-like_times);
                window.localStorage.setItem('like_times',JSON.stringify(times_array));
                setTimeout(function(){
                    thumb_icon.addClass('like');
                },0);
            }
            else{
                App.showAlertDialog('每天最多只能投3次');
            }
            e.preventDefault();
        },
        render:function(){
            App.ModelView.prototype.render.call(this);
            this.$('.wellbox').addClass('animate');
        }
    });
    
    App.Pages.Ranking = new (App.PageView.extend({
        events: {
            //'click .header-btn-left': 'onClickLeftBtn',
            'click .header-btn-right': 'onClickRightBtn',
            'click .avatar': 'viewImage'
        },
        checkDate:function(d,old){
            if(d.getDate()-old.getDate()==1){
                return true;
            }
            else if(d.getMonth()-old.getMonth()>1){
                return true;
            }
            else if(d.getMonth()==0&&old.getMonth()==11){
                return true;
            }
            else{
                return false;
            }
        },
        clearLikeTimes:function(){
            var timestamp = window.localStorage.getItem('like_timestamp');
            var d  =new Date();
            var old= new Date();
            old.setTime(timestamp);
            if(d.getTime() - timestamp >24*3600*1000||this.checkDate(d,old)){
                window.localStorage.removeItem('like_times');
                window.localStorage.removeItem('like_timestamp');
            }
        },
        getWxMessage: function() {
            var message = {
                img_url : App.makeUrl('/assets/img/pk-icon.png'),
                img_width : "640",
                img_height : "640",
                link : App.makeUrl('#ranking/topic' + this.topic.id),
                desc : this.topic.get('title') + ' ' + this.topic.get('description'),
                title : "锐榜Top10/PK时间到"
            };
            return message;
        },
        initLikeTimes:function(topic_id){
            var like_times;
            if(window.localStorage.getItem('like_times')==null){
                window.localStorage.setItem('like_times','{"'+topic_id+'":0}');
                like_times=0;
                window.localStorage.setItem('like_timestamp',new Date().getTime());
            }
            else{
                var times_array=JSON.parse(window.localStorage.getItem('like_times'));
                like_times=parseInt(times_array[topic_id]||0);
            }
            this.$('.header-btn-left .btn-text b').text(3-like_times);
        },
        initPage: function() {
            _.bindAll(this, 'renderTopic');
            this.clearLikeTimes();
            this.topic = new App.Models.Topic();
            this.views = {
                topic: new TopicsView({
                    el: this.$('.wrapper'),
                    model: this.topic
                })
            };
        },
        onClickLeftBtn:function(){
            App.goTo('Home', {topic: this.topicAttrs});
        },
        onClickRightBtn: function() {
            this.renderTopic();
        },
        renderTopic: function(attrs){
            if (attrs) {
                var topicView = this.views.topic;
                this.topicAttrs = topicView.attrs = attrs;
                this.topic.set(attrs);
                this.initLikeTimes(attrs.id);
            } else {
                oneTopic.pick(this.renderTopic);
            }
        },
        viewImage: function(e) {
            var $avatar = $(e.currentTarget);
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
                //去除动画
                this.topic.clear();
                this.topic.set({id: this.options.topicId});
                this.topic.fetch();
                this.initLikeTimes(this.options.topicId||this.options.topic.id);
            } else if (this.options.topic) {
                //去除动画
                var topicView = this.views.topic;
                this.topicAttrs = topicView.attrs = this.options.topic;
                this.topic.set(this.options.topic);
                this.initLikeTimes(this.options.topicId||this.options.topic.id);
            }
            else{
                this.renderTopic();
            }
        }
    }))({el: $("#view-ranking")});
});
