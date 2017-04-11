import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Link, Redirect, hashHistory} from 'react-router';

import IndexIndex from './routes/index/Index';
import IndexMap from './routes/index/Map';
import IndexNav from './routes/index/Nav';

import NearbySearch from './routes/nearby/Search';
import NearbyResult from './routes/nearby/Result';

import NotFound from './routes/404';

import './common.scss';
import './fonts/font-awesome.scss';

const rootDiv = document.getElementById("root");

ReactDOM.render((
    <Router history={hashHistory}>
        <Redirect from="/" to="/index/index" />
        <Route path="/">
            <Route path="index">
                <Route path="index" component={IndexIndex}></Route>
                <Route path="map" component={IndexMap}></Route>
                <Route path="nav" component={IndexNav}></Route>
            </Route>
            <Route path="nearby">
                <Route path="search" component={NearbySearch}></Route>
                <Route path="result" component={NearbyResult}></Route>
            </Route>
        </Route>
        <Route path="*" component={NotFound} />
    </Router>
), rootDiv);