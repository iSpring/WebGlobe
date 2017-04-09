import React, {Component} from 'react';
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
        return <div>
            <Search placeholder="搜索地点、公交、城市" />
        </div>;
    }
};