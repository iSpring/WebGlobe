import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Link, Redirect, hashHistory} from 'react-router';

import IndexIndex from './routes/index/Index';
import IndexMap from './routes/index/Map';

import NearbySearch from './routes/nearby/Search';
import NearbyResult from './routes/nearby/Result';

import NavSearch from './routes/nav/Search';

import NotFound from './routes/404';

import './css/common.scss';
import './fonts/font-awesome.scss';

const rootDiv = document.getElementById("root");

ReactDOM.render((
    <Router history={hashHistory}>
        <Redirect from="/" to="/index/index" />
        <Route path="/">
            <Route path="index">
                <Route path="index" component={IndexIndex}></Route>
                <Route path="map" component={IndexMap}></Route>
            </Route>
            <Route path="nearby">
                <Route path="search" component={NearbySearch}></Route>
                <Route path="result" component={NearbyResult}></Route>
            </Route>
            <Route path="nav">
                <Route path="search" component={NavSearch}></Route>
            </Route>
        </Route>
        <Route path="*" component={NotFound} />
    </Router>
), rootDiv);