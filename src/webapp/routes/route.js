const route = {
    childRoutes: [{
        path: '/',
        indexRoute: { onEnter: (nextState, replace) => replace('/index/index') },
        childRoutes: [
            require('./index/route'),
            require('./map/route'),
            require('./nav/route'),
            require('./nearby/route'),
            require('./404/route')
        ]
        // getChildRoutes(partialNextState, callback){
        //     require.ensure([], function(){
        //         callback(null, [
        //             require('./index/route'),
        //             require('./map/route'),
        //             require('./nav/route'),
        //             require('./nearby/route'),
        //             require('./404/route')
        //         ])
        //     }, 'root-childroutes')
        // }
    }]
};

export default route;