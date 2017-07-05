import React from 'react';
import {Link} from 'react-router';
import classNames from 'classnames';
import styles from './index.scss';
import RouteComponent from 'webapp/components/RouteComponent';
import Search from 'webapp/components/Search';
// import {handleStyles} from 'webapp/common/Utils';
// handleStyles(styles);

export default class App extends RouteComponent{

    constructor(props){
        debugger;
        super(props);
        this.state = {};
    }

    onSearchFocus(){
        const path = `/map/base`;
        this.context.router.push(path);
    }

    render(){
        const faMapTo = "icon-map-o";
        const faMapMarker = "icon-location";
        const faRoad = "icon-road";
        const faCutlery = "icon-food";
        const faBed = "icon-bed";
        const faBus = "icon-bus";
        const faSubway = "icon-subway";
        
        return(
            <div className={styles.root}>
                <div className={styles.title}>WebGlobe</div>
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