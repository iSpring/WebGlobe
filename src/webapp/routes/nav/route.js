const route = {
    path: 'nav',
    childRoutes: [
        require('./Paths/route'),
        require('./Search/route')
    ]
};

export default route;