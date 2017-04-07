import * as React from 'react';
import * as styles from './index.scss';

export default class App extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return <div>
            <div className={styles["search-section"]}>
                <div>
                    <input placeholder="搜索地点、公交、城市" />
                    <span />
                </div>
                <div style={{display:'none'}}>取消</div>
            </div>
        </div>;
    }
};