import React, { Component, PropTypes } from 'react';
import loading from 'webapp/common/loading';

export default class RouteComponent extends Component {
    static contextProps = {
        router: PropTypes.object
    };

    goBack(){
        this.context.router.goBack();
    }

    componentDidMount(){
        this._isMounted = true;
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    hasBeenMounted(){
        return this._isMounted;
    }

    wrapPromise(promise){
        loading.show();
        const p = new Promise((resolve, reject) => {
            promise.then((response) => {
                loading.hide();
                if(this.hasBeenMounted()){
                    resolve(response);
                }
            }, (err) => {
                loading.hide();
                if(this.hasBeenMounted()){
                    reject(err);
                }
            });
        });
        return p;
    }
};