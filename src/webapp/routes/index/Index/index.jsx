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

        const faCutlery = classNames(fontStyles.fa, fontStyles["fa-cutlery"]);
        const faBed = classNames(fontStyles.fa, fontStyles["fa-bed"]);
        const faBus = classNames(fontStyles.fa, fontStyles["fa-bus"]);
        const faSubway = classNames(fontStyles.fa, fontStyles["fa-subway"]);

        return(
            <div>
                <div className={styles.title}>WebGlobe</div>
                <Search placeholder="搜索地点、公交、城市" />
                <div className={styles["link1-container"]}>
                    <Link to="/index/map" className={styles.link1}>
                        <i className={faMapTo}></i>
                        <span>地图</span>
                    </Link>
                    <Link to="/nearby/search" className={styles.link1}>
                        <i className={faMapMarker}></i>
                        <span>附近</span>
                    </Link>
                    <Link to="/index/nav" className={styles.link1}>
                        <i className={faRoad}></i>
                        <span>路线</span>
                    </Link>
                </div>
                <div className={styles["link2-container"]}>
                    <Link to="/nearby/result" className={styles.link2}>
                        <div>
                            <i className={faCutlery}></i>
                        </div>
                        <span>美食</span>
                    </Link>
                    <Link to="/nearby/result" className={styles.link2}>
                        <div>
                            <i className={faBed}></i>
                        </div>
                        <span>酒店</span>
                    </Link>
                    <Link to="/nearby/result" className={styles.link2}>
                        <div>
                            <i className={faBus}></i>
                        </div>
                        <span>公交</span>
                    </Link>
                    <Link to="/nearby/result" className={styles.link2}>
                        <div>
                            <i className={faSubway}></i>
                        </div>
                        <span>地铁</span>
                    </Link>
                </div>
            </div>
        );
    }
};