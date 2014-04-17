App.Models.Topic = App.Model.extend({
	urlRoot: App.configs.APIHost + '/topics/topic/',
    parse: function(model){
        var candidates = model.candidates;
        model.candidates = _.sortBy(candidates,function(c){
            if(c.score==0)c.score=Math.floor(Math.random()*(400))+100;
            return -c.score;
        });
        return model;
    }
});

App.Collections.Topics = App.Collection.extend({
    url: App.configs.APIHost + '/topics/topic/',
    model: App.Models.Topic
});

App.Data.Topics = new App.Collections.Topics();

App.Models.Vote=App.Model.extend({
    urlRoot: App.configs.APIHost + '/topics/vote/',
});

App.Collections.Votes = App.Collection.extend({
    url: App.configs.APIHost + '/topics/vote/',
    model: App.Models.Vote,
    sendResult:function(options){
    	console.log("send data");
	    // this.forEach(function(vote){
	    // 	vote.save();
	    // });
        this.reset();
    },
    addOne:function(topic_id,cid1,cid2,draw){
	    var vote = new App.Models.Vote({
            topic:topic_id,
            candidate1:cid1,
            candidate2:cid2,
            draw:draw
        });
        this.add(vote);
    }
});

App.Models.VoteTimes = Backbone.Model.extend({});

App.Models.Comment = Backbone.Model.extend({
    urlRoot: App.configs.APIHost + '/topics/topic/'
});

App.Collections.Comment=App.Collection.extend({
    url: App.configs.APIHost + '/topics/topic/',
    model: App.Models.Comment,
    parse:function(response){
        response.forEach(function(e){
            var now = new Date();
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/.exec(e.time_created);
            var year = parseInt(RegExp.$1);
            var month = parseInt(RegExp.$2);
            var day = parseInt(RegExp.$3);
            var hour = parseInt(RegExp.$4);
            if(year!=now.getFullYear()){
                e.time_created = (now.getFullYear()-year)+'y';
            }
            else if(month!=(now.getMonth()+1)){
                e.time_created = (now.getMonth()+1-month)+'m';
            }
            else if(day!=now.getDate()){
                e.time_created = (now.getDate()-day)+'d';
            }
            else if(hour!=now.getHours()){
                e.time_created = (now.getHours()-hour)+'h';
            }
            else{
                e.time_created = 'just now';
            }
        });
        return response;
    }
});

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

oneTopic = new OneTopic();