import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './index.scss';

export default class Search extends Component {
    static propTypes = {
        className: PropTypes.string,
        readOnly: PropTypes.bool,
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
        readOnly: false,
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
            setTimeout(() => {
                this.props.onCancel();
            }, 0);
            // this.props.onCancel();
        }
    }

    onKeywordDivClick(){
        if(this.props.onFocus){
            this.props.onFocus();
        }
    }

    onKeywordInputFocus(e){
        // if(this.props.readOnly){
        //     // e.preventDefault();
        //     this.keywordInput.blur();
        // }
        if(this.props.onFocus){
            this.props.onFocus();
        }
    }

    onKeywordInputBlur(){
    }

    isFocused(){
        return !!(this.keywordInput && this.keywordInput === document.activeElement);
    }

    onKeywordInputPress(e){
        if(e.key === "Enter"){
            if(this.props.onSearch && this.keywordInput && this.keywordInput.value){
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
                    {
                        this.props.readOnly ? (
                            <div ref={(input)=>{this.keywordDiv=input}} className={styles.keyword} onClick={() => this.onKeywordDivClick()}>{this.props.placeholder}</div>
                        ) : (
                            <input ref={(input)=>{this.keywordInput=input}} type="text" className={styles.keyword} readOnly={this.props.readOnly} placeholder={this.props.placeholder} onFocus={(e) => this.onKeywordInputFocus(e)} onBlur={() => this.onKeywordInputBlur()} onKeyPress={(e)=>{this.onKeywordInputPress(e)}} />
                        )
                    }
                </div>
                {
                    this.props.showCancel && <div className={styles["right-action"]} onClick={()=>this.onRightAction()}>取消</div>
                }
            </div>
        );
    }
};