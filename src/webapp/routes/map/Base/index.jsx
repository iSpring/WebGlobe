import React from 'react';
import Search from 'webapp/components/Search';
import MapComponent from 'webapp/components/Map';
import RouteComponent from 'webapp/components/RouteComponent';
import styles from './index.scss';

export default class MapBase extends RouteComponent{
    constructor(props){
        super(props);
        this.state = {};
    }

    onSearch(keyword){
        const path = `/nearby/result?keyword=${keyword}`;
        this.context.router.push(path);
    }

    onCancel(){
        // this.goBack();
        const path = '/index/index';
        this.context.router.push(path);
    }

    render(){
        return (
            <div>
                <Search placeholder="搜索地点、公交、城市" showCancel={true} onSearch={(keyword) => this.onSearch(keyword)} onCancel={() => this.onCancel()} />
                <div className={styles["map-container"]}>
                    <MapComponent />
                </div>
            </div>
        );
    }
};