import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import styles from './index.scss';

export default class Search extends Component {
    static propTypes = {
        className: PropTypes.string,
        placeholder: PropTypes.string,
        showVoice: PropTypes.bool,
        showMapList: PropTypes.bool,
        showCancel: PropTypes.bool,
        onMap: PropTypes.func,
        onList: PropTypes.func,
        onCancel: PropTypes.func,
        onFocus: PropTypes.func,
        onSearch: PropTypes.func
    };

    static defaultProps = {
        placeholder: "",
        showVoice: false,
        showMapList: false,
        showCancel: false
    };

    constructor(props) {
        super(props);
        this.state = {
            keyword: "",
            showMap: true
        };
    }

    onLeftAction(){
        if(this.state.showMap && this.props.onMap){
            this.props.onMap();
        }else if(!this.state.showMap && this.props.onList){
            this.props.onList();
        }
        this.setState((prevState, props) => ({
            showMap: !prevState.showMap
        }));
    }

    onRightAction(){
        if(this.props.onCancel){
            this.props.onCancel();
        }
    }

    onFocus(){
        if(this.props.onFocus){
            this.props.onFocus();
        }
    }

    onKeyPress(e){
        if(e.key === "Enter"){
            if(this.props.onSearch){
                this.props.onSearch(this.keywordInput.value);
            }
        }
    }

    render() {
        const a = classNames(styles["search-section"], this.props.className, {
            [styles["hide-left-action"]]: !this.props.showMapList,
            [styles["hide-right-action"]]: !this.props.showCancel
        });

        return (
            <div className={a}>
                {
                    this.props.showMapList ? <div className={styles["left-action"]} onClick={()=>this.onLeftAction()}>{this.state.showMap ? "地图" : "列表"}</div> : false
                }
                <div className={styles["input-container"]}>
                    <input className={styles.keyword} placeholder={this.props.placeholder} onFocus={()=>this.onFocus()} onKeyPress={(e)=>{this.onKeyPress(e)}} ref={(input)=>{this.keywordInput=input;}} />
                    {
                        this.props.showVoice && <i className="fa fa-microphone" aria-hidden="true"></i>
                    }
                    <i className="fa fa-times hidden" aria-hidden="true"></i>
                </div>
                {
                    this.props.showCancel && <div className={styles["right-action"]} onClick={()=>this.onRightAction()}>取消</div>
                }
            </div>
        );
    }
};