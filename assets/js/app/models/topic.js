
TopApp.Models.Topic = TopApp.Model.extend({
	urlRoot: TopApp.configs.APIHost + '/topics/topic/'
});

TopApp.Collections.Topics = TopApp.Collection.extend({
    url: TopApp.configs.APIHost + '/topics/topic/',
    model: TopApp.Models.Topic
});

var candidates_example = [
    {id: 1, image: 'assets/img/candidates/1.jpg', description: '没什么可以说的'},
    {id: 2, image: 'assets/img/candidates/2.jpg', description: '没什么可以说的'},
    {id: 3, image: 'assets/img/candidates/3.jpg', description: '没什么可以说的'},
    {id: 4, image: 'assets/img/candidates/4.jpg', description: '没什么可以说的'},
    {id: 5, image: 'assets/img/candidates/5.jpg', description: '没什么可以说的'},
    {id: 6, image: 'assets/img/candidates/6.jpg', description: '没什么可以说的'},
    {id: 7, image: 'assets/img/candidates/7.jpg', description: '没什么可以说的'},
    {id: 8, image: 'assets/img/candidates/8.jpg', description: '没什么可以说的'},
    {id: 9, image: 'assets/img/candidates/9.jpg', description: '没什么可以说的'},
    {id: 10, image: 'assets/img/candidates/10.jpg', description: '没什么可以说的'},
];
TopApp.Data.Topics = new TopApp.Collections.Topics();
TopApp.Data.Topics.set([
    {
        id: 1,
        title: '十大最好喝的咖啡馆',
        description: '十大最好喝的咖啡馆',
        candidates: _.clone(candidates_example)
    }, {
        id: 2,
        title: '十大最难喝的咖啡馆',
        description: '十大最难喝的咖啡馆',
        candidates: _.clone(candidates_example)
    }, {
        id: 3,
        title: '十大最好看的咖啡馆',
        description: '十大最好看的咖啡馆',
        candidates: _.clone(candidates_example)
    }
]);
