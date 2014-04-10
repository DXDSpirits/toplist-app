
App.Models.Topic = App.Model.extend({
	urlRoot: App.configs.APIHost + '/topics/topic/'
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

App.Models.VoteTime = App.Model.extend({});
App.Collections.VoteTimes = Backbone.Collection.extend({
    url: App.configs.APIHost + '/topics/topic/',
    model: App.Models.VoteTime
});