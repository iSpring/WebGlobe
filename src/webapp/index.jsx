import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Link, Redirect, hashHistory} from 'react-router';
import './css/common.scss';
import './fonts/font-awesome.scss';

/*import IndexIndex from './routes/index/Index';
import MapBase from './routes/map/Base';
import NearbySearch from './routes/nearby/Search';
import NearbyResult from './routes/nearby/Result';
import NavSearch from './routes/nav/Search';
import NavPaths from './routes/nav/Paths';
import NotFound from './routes/404';

const rootDiv = document.getElementById("root");

ReactDOM.render((
    <Router history={hashHistory}>
        <Redirect from="/" to="/index/index" />
        <Route path="/">
            <Route path="index">
                <Route path="index" component={IndexIndex}></Route>
            </Route>
            <Route path="map">
                <Route path="base" component={MapBase}></Route>
            </Route>
            <Route path="nearby">
                <Route path="search" component={NearbySearch}></Route>
                <Route path="result" component={NearbyResult}></Route>
            </Route>
            <Route path="nav">
                <Route path="search" component={NavSearch}></Route>
                <Route path="paths" component={NavPaths}></Route>
            </Route>
            <Route path="*" component={NotFound} />
        </Route>
    </Router>
), rootDiv);*/

import rootRoute from './routes/route';

const rootDiv = document.getElementById("root");

ReactDOM.render((
    <Router history={hashHistory} routes={rootRoute}>
    </Router>
), rootDiv);