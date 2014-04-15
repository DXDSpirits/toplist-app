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