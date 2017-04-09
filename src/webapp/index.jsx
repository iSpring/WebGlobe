import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Link, Redirect, hashHistory} from 'react-router';
import IndexIndex from './routes/index/Index';
import IndexMap from './routes/index/Map';
import IndexNav from './routes/index/Nav';
import NearbySearch from './routes/nearby/Search';
import './fonts/font-awesome';

const rootDiv = document.getElementById("root");

ReactDOM.render((
    <Router history={hashHistory}>
        <Redirect from="/" to="/index/index" />
        <Route path="/index/index" component={IndexIndex} />
        <Route path="/index/map" component={IndexMap} />
        <Route path="/index/nav" component={IndexNav} />
        <Route path="/nearby/search" component={NearbySearch} />
    </Router>
), rootDiv);