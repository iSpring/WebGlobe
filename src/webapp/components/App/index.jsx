import * as React from 'react';
import * as styles from './index.scss';

console.log(styles);

export default class App extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return <div>
            <div className={styles["search-section"]}>
                <div className={styles["input-container"]}>
                    <input className={styles.keyword} placeholder="搜索地点、公交、城市" />
                    <i className="fa fa-microphone" aria-hidden="true"></i>
                </div>
                <div className={styles.cancel}>取消</div>
            </div>
        </div>;
    }
};