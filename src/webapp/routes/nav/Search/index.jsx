import React from 'react';
import RouteComponent from 'webapp/components/RouteComponent';
import classNames from 'classnames';
import styles from './index.scss';
import fontStyles from 'webapp/fonts/font-awesome.scss';
import Service from 'world/Service';
import {globe} from 'webapp/components/Map';

export default class Nav extends RouteComponent{

    constructor(props){
        super(props);
        this.fromPoi = null;
        this.toPoi = null;
        this.pageCapacity = 10;
        this.isFromLastFocused = true;
        this.state = {
            type: 'bus',
            fromPois: [],
            toPois: [],
            routes: []
        };
    }

    onClickTrafficType(trafficType){
        this.setState({
            type: trafficType
        });
    }

    onCancel(){
        this.goBack();
    }

    onKeyPress(e){
        const isFrom = e.target === this.fromInput;
        const keyword = e.target.value;
        if(e.key === "Enter"){
            if(keyword){
                Service.searchByCurrentCity(keyword, this.pageCapacity).then((response) => {
                    console.log(response);
                    let pois = null;
                    if(response.detail){
                        pois = response.detail.pois;
                    }
                    if(!pois){
                        pois = [];
                    }
                    if(isFrom){
                        this.setState({
                            fromPois: pois
                        });
                    }else{
                        this.setState({
                            toPois: pois
                        });
                    }
                });
            }
        }
    }

    onFromFocus(){
        this.isFromLastFocused = true;
        this.setState({
            toPois: []
        });
    }

    onToFocus(){
        this.isFromLastFocused = false;
        this.setState({
            fromPois: []
        });
    }

    onClickPoi(poi, isFromPoi){
        if(isFromPoi){
            this.fromPoi = poi;
            this.fromInput.value = poi.name || "";
            this.setState({
                fromPois: []
            });
            if(this.toPoi){
                this.route(this.fromPoi, this.toPoi);
            }else{
                this.toInput.focus();
            }
        }else{
            this.toPoi = poi;
            this.toInput.value = poi.name || "";
            this.setState({
                toPois: []
            })
            if(this.fromPoi){
                this.route(this.fromPoi, this.toPoi);
            }else{
                this.fromInput.focus();
            }
        }
    }

    route(fromPoi, toPoi){
        console.log(fromPoi, toPoi);
        const promise = globe.routeLayer.routeByDriving(fromPoi.pointx, fromPoi.pointy, toPoi.pointx, toPoi.pointy, 10);
        promise.then((response) => {
            console.log(response);
            if(response.route){
                this.props.router.push({
                    pathname: '/nav/paths',
                    state: {
                        route: response.route
                    }
                });
            }
        });
    }

    render(){
        const busClassName = classNames(fontStyles.fa, fontStyles["fa-bus"], styles["traffic-type"], {
            selected: this.state.type !== 'snsnav' && this.state.type !== 'walk'
        });
        const driveClassName = classNames(fontStyles.fa, fontStyles["fa-car"], styles["traffic-type"], {
            selected: this.state.type === 'snsnav'
        });
        const walkClassName = classNames(fontStyles.fa, fontStyles["fa-male"], styles["traffic-type"], {
            selected: this.state.type === 'walk'
        });
        const fromClassName = classNames(fontStyles.fa, fontStyles["fa-map-marker"], styles["from-icon"]);
        const toClassName = classNames(fontStyles.fa, fontStyles["fa-circle-o"], styles["to-icon"]);
        const exchangeArrowClassName = classNames(fontStyles.fa, fontStyles["fa-arrows-v"]);
        const addressClassName = classNames(styles.address, "ellipsis");
        const pois = this.isFromLastFocused ? this.state.fromPois : this.state.toPois;

        return (
            <div>
                <header>
                    <div className={styles["traffic-types"]}>
                        <i className={busClassName} onClick={()=>this.onClickTrafficType('bus')}></i>
                        <i className={driveClassName} onClick={()=>this.onClickTrafficType('snsnav')}></i>
                        <i className={walkClassName} onClick={()=>this.onClickTrafficType('walk')}></i>
                    </div>
                    <div className={styles.cancel} onClick={()=>{this.onCancel();}}>取消</div>
                </header>
                <div className={styles["search-section"]}>
                    <div className={styles["inputs-container"]}>
                        <div className={classNames(styles["input-container"], styles.from)}>
                            <i className={fromClassName}></i>
                            <input type="text" placeholder="请输入出发地" ref={(input)=>{this.fromInput = input;}} onFocus={(e)=>this.onFromFocus(e)} onKeyPress={(e)=>this.onKeyPress(e)} />
                        </div>
                        <div className={styles["input-container"]}>
                            <i className={toClassName}></i>
                            <input type="text" placeholder="请输入目的地" ref={(input)=>{this.toInput = input;}} onFocus={(e)=>this.onToFocus(e)} onKeyPress={(e)=>this.onKeyPress(e)} />
                        </div>
                    </div>
                    <div className={styles.exchange}>
                        <i className={exchangeArrowClassName}></i>
                    </div>
                </div>
                <div className={styles.pois}>
                    {
                        pois.map((poi) => {
                            return (
                                <div className={styles.poi} key={poi.uid} onClick={(e)=>{this.onClickPoi(poi, this.isFromLastFocused);}}>
                                    <div className={styles.name}>{poi.name}</div>
                                    <div className={addressClassName}>{poi.addr}</div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
};