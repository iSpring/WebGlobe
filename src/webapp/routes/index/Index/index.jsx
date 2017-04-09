import React, {Component} from 'react';
import {Link} from 'react-router';
import classNames from 'classnames';

import Search from '../../../components/Search';

import styles from './index.scss';
import fontStyles from '../../../fonts/font-awesome.scss';

export default class App extends Component{

    constructor(props){
        super(props);
        this.state = {
            page: "app",//search,map,nearby,nav
            loading: false
        };
    }

    render(){
        const faMapTo = classNames(fontStyles.fa, fontStyles["fa-map-o"]);
        const faMapMarker = classNames(fontStyles.fa, fontStyles["fa-map-marker"]);
        const faRoad = classNames(fontStyles.fa, fontStyles["fa-road"]);

        return(
            <div>
                <div className={styles.title}>WebGlobe</div>
                <Search placeholder="搜索地点、公交、城市" />
                <div className={styles.container}>
                    <Link to="/index/map" className={styles.link} activeClassName={styles.active}>
                        <i className={faMapTo}></i>
                        <span>地图</span>
                    </Link>
                    <Link to="/nearby/search" className={styles.link} activeClassName={styles.active}>
                        <i className={faMapMarker}></i>
                        <span>附近</span>
                    </Link>
                    <Link to="/index/nav" className={styles.link} activeClassName={styles.active}>
                        <i className={faRoad}></i>
                        <span>路线</span>
                    </Link>
                </div>
                
                <Link to="/nearby/result" className={styles.active} activeClassName={styles.active}>附近搜索结果页面</Link>
            </div>
        );
    }
};