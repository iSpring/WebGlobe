import React from 'react';
import {Link} from 'react-router';
import classNames from 'classnames';
import styles from './index.scss';
import fontStyles from 'webapp/fonts/font-awesome.scss';
import RouteComponent from 'webapp/components/RouteComponent';
import Search from 'webapp/components/Search';

export default class App extends RouteComponent{

    constructor(props){
        super(props);
        this.state = {};
    }

    onSearchFocus(){
        const path = `/map/base`;
        this.context.router.push(path);
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
            <div className={styles.root}>
                <div className={styles.title}>WebGlobe移动版</div>
                <Search readOnly={true} className={styles.search} onFocus={() => this.onSearchFocus()} placeholder="搜索地点、公交、城市" />
                <div className={styles["link1-container"]}>
                    <Link to="/map/base" className={styles.link1}>
                        <i className={faMapTo}></i>
                        <span>地图</span>
                    </Link>
                    <Link to="/nearby/search" className={styles.link1}>
                        <i className={faMapMarker}></i>
                        <span>附近</span>
                    </Link>
                    <Link to="/nav/search" className={styles.link1}>
                        <i className={faRoad}></i>
                        <span>路线</span>
                    </Link>
                </div>
                <div className={styles["link2-container"]}>
                    <Link to="/nearby/result?keyword=美食" className={styles.link2}>
                        <div className={styles.food}>
                            <i className={faCutlery}></i>
                        </div>
                        <span>美食</span>
                    </Link>
                    <Link to="/nearby/result?keyword=酒店" className={styles.link2}>
                        <div className={styles.hotel}>
                            <i className={faBed}></i>
                        </div>
                        <span>酒店</span>
                    </Link>
                    <Link to="/nearby/result?keyword=公交" className={styles.link2}>
                        <div className={styles.traffic}>
                            <i className={faBus}></i>
                        </div>
                        <span>公交</span>
                    </Link>
                    <Link to="/nearby/result?keyword=地铁" className={styles.link2}>
                        <div className={styles.subway}>
                            <i className={faSubway}></i>
                        </div>
                        <span>地铁</span>
                    </Link>
                </div>
            </div>
        );
    }
};