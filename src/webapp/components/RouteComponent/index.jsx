import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import loading from 'webapp/common/loading';
import styles from './index.scss';

export default class RouteComponent extends Component {
    static contextTypes = {
        router: PropTypes.object
    };

    goBack(){
        this.context.router.goBack();
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

    wrapPromise(promise){
        loading.show();
        this.setState({
            loading: true
        });
        const p = new Promise((resolve, reject) => {
            promise.then((response) => {
                loading.hide();
                if(this.hasBeenMounted()){
                    this.setState({
                        loading: false
                    });
                    resolve(response);
                }
            }, (err) => {
                loading.hide();
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