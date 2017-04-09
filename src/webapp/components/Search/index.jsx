import React, {Component, PropTypes} from 'react';
import classNames from 'classNames';
import styles from './index.scss';

export default class Search extends Component{
    // static propTypes = {
    //     placeholder: PropTypes.string,
    //     showVoice: PropTypes.bool,
    //     showCancel: PropTypes.bool
    // };

    // static defaultProps = {
    //     placeholder: "",
    //     showVoice: false,
    //     showCancel: false
    // };

    constructor(props){
        super(props);
        this.state = {
            keyword: ""
        };
    }

    render(){
        // const cancel = classNames({
        //     [styles.cancel]: true
        // });

        return <div>
            <div className={styles["search-section"]}>
                <div className={styles["input-container"]}>
                    <input className={styles.keyword} placeholder={this.props.placeholder} />
                    {
                        this.props.showVoice && <i className="fa fa-microphone" aria-hidden="true"></i>
                    }
                    <i className="fa fa-times hidden" aria-hidden="true"></i>
                </div>
                {
                    this.props.showCancel && <div className={styles.cancel}>取消</div>
                }
            </div>
        </div>;
    }
};