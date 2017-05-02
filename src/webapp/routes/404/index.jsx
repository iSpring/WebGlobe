import React, {Component} from 'react';
import styles from './index.scss';

export default class App extends Component{

    constructor(props){
        super(props);
        this.state = {};
    }

    render(){
        return(
            <div className={styles.root}>
                <div className={styles["status-404"]}>404</div>
            </div>
        );
    }
};