const route = {
    path: 'nearby',
    childRoutes: [
        require('./Result/route'),
        require('./Search/route')
    ]
};

export default route;