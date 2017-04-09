import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Link, Redirect, hashHistory} from 'react-router';
import App from './components/App';
import Map from './components/Map';
import Nav from './components/Nav';
import Nearby from './components/Nearby';
import './fonts/font-awesome';

const rootDiv = document.getElementById("root");

ReactDOM.render((
    <Router history={hashHistory}>
        <Redirect from="/" to="/index/index" />
        <Route path="/index/index" component={App} />
        <Route path="/index/map" component={Map} />
        <Route path="/nearby/search" component={Nearby} />
        <Route path="/index/nav" component={Nav} />
    </Router>
), rootDiv);
