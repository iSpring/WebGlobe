import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {hashHistory} from 'react-router';
import loading from 'webapp/common/loading';
import styles from './index.scss';

let currentLocation = null;
let previousLocation = null;

hashHistory.listen((location) => {
    //action: REPLACE or PUSH => init new route component => componentDidMount() =>  async POP
    //router.goBack() => POP
    if(location.action === "POP"){
        previousLocation = currentLocation;
        currentLocation = location;
    }
});

export default class RouteComponent extends Component {
    static contextTypes = {
        router: PropTypes.object
    };

    goBack(){
        this.context.router.goBack();
    }

    getPreviousLocation(){
        const realLocation = this.context.router.getCurrentLocation();
        if(realLocation && realLocation.action === 'POP' && realLocation.pathname !== currentLocation.pathname){
            // In this case, location is changed, but hashHistory doesn't emit event now because it emit event async.
            // Don't change previousLocation and currentLocation here because we can do it in next hashHistory event.
            // previousLocation = currentLocation;
            // currentLocation = realLocation;
            return currentLocation;
        }
        return previousLocation;
    }

    componentDidMount(){
        this._isMounted = true;
        const domNode = ReactDOM.findDOMNode(this);
        const className = styles["route-component"];
        if(!domNode.classList.contains(className)){
            domNode.classList.add(className);
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    hasBeenMounted(){
        return this._isMounted;
    }

    wrapPromise(promise, disableLoading){
        if(!disableLoading){
            loading.show();
        }
        this.setState({
            loading: true
        });
        const p = new Promise((resolve, reject) => {
            promise.then((response) => {
                if(!disableLoading){
                    loading.hide();
                }
                if(this.hasBeenMounted()){
                    this.setState({
                        loading: false
                    });
                    resolve(response);
                }
            }, (err) => {
                if(!disableLoading){
                    loading.hide();
                }
                if(this.hasBeenMounted()){
                    this.setState({
                        loading: false
                    });
                    reject(err);
                }
            });
        });
        return p;
    }
};