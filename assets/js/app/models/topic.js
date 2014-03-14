
TopApp.Models.ClientError = TopApp.Model.extend({
	urlRoot: TopApp.configs.APIHost + '/clients/error/'
});

TopApp.Models.App = TopApp.Model.extend({
    urlRoot: TopApp.configs.APIHost + '/clients/app/'
});

TopApp.Models.Ad = TopApp.Model.extend({
    urlRoot: TopApp.configs.APIHost + '/clients/ad/'
});

TopApp.Models.Hero = TopApp.Model.extend({
    urlRoot: TopApp.configs.APIHost + '/clients/hero/'
});

TopApp.Collections.Heros = TopApp.Collection.extend({
    url: TopApp.configs.APIHost + '/clients/hero/',
    model: TopApp.Models.Hero
});
