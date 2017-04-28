import React from 'react';
import ReactDOM from 'react-dom';
import Search from 'webapp/components/Search';
import MapComponent, {globe} from 'webapp/components/Map';
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
        // basiclly fix flash issue for Xiaomi browser
        this.mapContainer.style.display = 'none';
        setTimeout(() => {
            const path = '/index/index';
            this.context.router.push(path);
        }, 50);

        // this.mapContainer.style.display = 'none';
        
        // const searchDom = ReactDOM.findDOMNode(this.search);
        // if(searchDom){
        //     searchDom.style.display = 'none';
        // }
        // globe.pauseRendering();
        // setTimeout(() => {
        //     const path = '/index/index';
        //     this.context.router.push(path);
        // }, 50);
    }

    render(){
        return (
            <div>
                <Search ref={input => this.search = input} placeholder="搜索地点、公交、城市" showCancel={true} onSearch={(keyword) => this.onSearch(keyword)} onCancel={() => this.onCancel()} />
                <div ref={input => this.mapContainer = input} className={styles["map-container"]}>
                    <MapComponent />
                </div>
            </div>
        );
    }
};