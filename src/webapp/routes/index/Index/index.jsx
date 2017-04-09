import React, {Component} from 'react';
import {Link} from 'react-router';
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
        return <div>
            <Link to="/index/map" className={styles.active} activeClassName={styles.active}>地图页面</Link>
            <Link to="/nearby/search" className={styles.active} activeClassName={styles.active}>附近页面</Link>
            <Link to="/index/nav" className={styles.active} activeClassName={styles.active}>路线页面</Link>
            <Link to="/nearby/result" className={styles.active} activeClassName={styles.active}>附近搜索结果页面</Link>
        </div>;
    }
};