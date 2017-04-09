import React, {Component} from 'react';
import {Link} from 'react-router';
import Search from '../Search';
import styles from './index.scss';

export default class App extends Component{

    constructor(props){
        super(props);
        this.state = {
            page: "app",//search,map,nearby,nav
            loading: false
        };
    }

    render(){
        const placeholder = "搜索地点、公交、城市";
        return <div>
            <Search placeholder={placeholder} />
            <Link to="/index/map" className={styles.active} activeClassName={styles.active}>地图</Link>
            <Link to="/nearby/search" className={styles.active} activeClassName={styles.active}>附近</Link>
            <Link to="/index/nav" className={styles.active} activeClassName={styles.active}>路线</Link>
        </div>;
    }
};