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
            'click .skip-pk': 'skip',
            'webkitAnimationEnd': 'flipEnd'
        },
        template: TPL['one-topic-page'],
        templatePkItem: TPL['pk-item'],
        initView: function() {
            //_.bindAll(this, 'get_vote_times');
            this.vote_times = new App.Models.VoteTimes();
            this.pk_group_list = null;
        },
        flipEnd: function(e) {
            if (e.originalEvent.animationName == "flip") {
                this.$el.removeClass('animate');
            }
        },
        makeList:function(list){
            var self=this;
            if(_.isEmpty(list)){
                self.pk_group_list = this.generateRandomList(this.attrs.candidates);
            }
            else{
                self.pk_group_list = this.generateSortedList(this.attrs.candidates,list);
            }
        },
        get_vote_times:function(c,sortList){
            var id1 = c[0].id,id2 = c[1].id;
            var index = _.find(sortList, function(e){
                return (e.condidate1 == id1&&e.condidate2 == id2)||(e.condidate1 == id2&&e.condidate2 == id1);
            });
            return 'undefined'==typeof(index)?0:index['times'];
        },
        generateSortedList:function(list,sortList){
            var self = this;
            if(!_.isArray(list)||list.length<2)return [];
            var dyadic_list = [];
            for(var i in list){
                for(var index=parseInt(i)+1;index<list.length;index++){
                    dyadic_list.push([
                        list[i],list[index]
                    ]);
                }
            }
            dyadic_list = _.shuffle(dyadic_list);
            return _.sortBy(dyadic_list,function(c){
                return self.get_vote_times(c,sortList);
            });
        },
        generateRandomList:function(list){
            var self = this;
            if(!_.isArray(list)||list.length<2)return [];
            var dyadic_list = [];
            for(var i in list){
                for(var index=parseInt(i)+1;index<list.length;index++){
                    dyadic_list.push([
                        list[i],list[index]
                    ]);
                }
            }
            return _.shuffle(dyadic_list);
        },
        render: function() {
            var self = this;
            self.attrs.avatar = _.sample(this.attrs.candidates, 1)[0].picture;
            var vote_times = self.vote_times;
            vote_times.fetch({
                url: App.configs.APIHost+'/topics/topic/'+self.attrs.id+'/vote_times/',
                success: function(){
                    self.makeList(vote_times.toJSON());
                }
            });
            self.pk_group_id=0;
            setTimeout(function() {
                self.renderTemplate(self.attrs);
                self.renderPk();
            }, 250);
            this.$el.addClass('animate');
            return this;
        },
        skip:function(){
            var topic_id = this.attrs.id;
            var cid1 = $('.pk-item:eq(0)').attr('data-item');
            var cid2 = $('.pk-item:eq(1)').attr('data-item');
            //App.voteResult.addOne(topic_id,cid1,cid2,1);
            (new App.Models.Vote({
                topic:topic_id,
                candidate1:cid1,
                candidate2:cid2,
                draw:1
            })).save();
            this.renderPk();
        },
        renderPk: function() {
            var pk_group = this.pk_group_list[this.pk_group_id];
            if(!_.isArray(pk_group)||pk_group.length==0)return;
            this.pk_group_id++;
            if(this.pk_group_id==this.pk_group_list.length)this.pk_group_id=0;
            var pk1 = this.templatePkItem(pk_group[0]),
                pk2 = this.templatePkItem(pk_group[1]);
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

            var topic_id = this.attrs.id;
            var cid1 = $pkItem.attr('data-item');
            var cid2 = $($pkItem.siblings().get(0)).attr('data-item');
            (new App.Models.Vote({
                topic:topic_id,
                candidate1:cid1,
                candidate2:cid2,
                draw:0
            })).save();
        }
    });
    
    App.Pages.Home = new (App.PageView.extend({
        events: {
            'click .header-btn-left': 'onClickLeftBtn',
            'click .header-btn-right': 'onClickRightBtn',
            'click .pk-item': 'viewImage'
        },
        initPage: function() {
            _.bindAll(this, 'renderTopic');
            this.topicAttrs = {};
            this.views = {
                topic: new TopicsView({ el: this.$('.one-topic') })
            };
            //App.voteResult = this.voteResult = new App.Collections.Votes();
        },
        onClickLeftBtn: function() {
            App.goTo('Ranking', {topic: this.topicAttrs});
        },
        onClickRightBtn: function() {
            //this.submitVotes();
            this.renderTopic();
        },
        // submitVotes:function(){
        //     var voteResult=this.voteResult;
        //     if (!voteResult.isEmpty()) {
        //         voteResult.sendResult();
        //     }
        // },
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
