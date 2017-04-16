import React, { Component, PropTypes } from 'react';
import loading from 'webapp/common/loading';

export default class RouteComponent extends Component {
    static contextTypes = {
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