import React from 'react';
import TrafficTypes from 'webapp/components/TrafficTypes';
import RouteComponent from 'webapp/components/RouteComponent';
import classNames from 'classnames';
import styles from './index.scss';
import Kernel from 'world/Kernel';
import Service from 'world/Service';
import { globe } from 'webapp/components/Map';

export default class Nav extends RouteComponent {

    constructor(props) {
        super(props);
        this.fromPoi = null;
        this.toPoi = null;
        this.pageCapacity = 10;
        this.searchDistance = Kernel.REAL_EARTH_RADIUS;
        this.isFromLastFocused = true;
        this.currentLocationText = '当前位置';
        this.tipPoisCache = {};//{keyword: tipPois}
        this.state = {
            type: 'driving',//bus,walking
            from: Service.location ? this.currentLocationText : '',
            to: '',
            tipPois: [],
            routes: []
        };
    }

    onCancel() {
        this.goBack();
    }

    onKeyPress(e) {
        const keyword = e.target.value;
        if (e.key === "Enter") {
            if(keyword){
                this.searchPois(keyword, this.isFromLastFocused, (pois) => {
                    if(e.target.value === keyword){
                        this.setState({
                            tipPois: pois
                        });
                    }
                });
            }
        }
    }

    onFromFocus() {
        this.isFromLastFocused = true;
        this.setState({
            tipPois: []
        });
    }

    onToFocus() {
        this.isFromLastFocused = false;
        this.setState({
            tipPois: []
        });
    }

    onFromChange(){
        this.setState({
            from: this.fromInput.value
        });
        this.onInputChange(this.fromInput);
    }

    onToChange(){
        this.setState({
            to: this.toInput.value
        });
        this.onInputChange(this.toInput);
    }

    onInputChange(input){
        const keyword = input.value.trim();
        if(keyword && keyword.indexOf(this.currentLocationText) < 0){
            this.searchPois(keyword, this.isFromLastFocused, (pois) => {
                if(input.value === keyword){
                    this.setState({
                        tipPois: pois
                    });
                }
            });
        }else{
            this.setState({
                tipPois: []
            });
        }
    }

    //isFromLastFocused maybe boolean or stirng 'ignored'
    searchPois(keyword, isFromLastFocused, cb) {
        let pois = this.tipPoisCache[keyword];
        if(pois){
            cb(pois);
            return;
        }
        const promise = Service.searchNearby(keyword, this.searchDistance, 'Auto', this.pageCapacity);
        this.wrapPromise(promise, true).then((response) => {
            if (response.detail) {
                pois = response.detail.pois;
            }
            if (!pois) {
                pois = [];
            }
            this.tipPoisCache[keyword] = pois;
            if(isFromLastFocused === 'ignored' || isFromLastFocused === this.isFromLastFocused){
                cb(pois);
            }
        });
    }

    onClickPoi(poi, isFromPoi) {
        if (isFromPoi) {
            this.fromPoi = poi;
            this.fromInput.value = poi.name || "";
            this.setState({
                tipPois: []
            });

            if (this.toPoi) {
                this.route(this.fromPoi, this.toPoi);
            } else {
                this.toInput.focus();
            }
        } else {
            this.toPoi = poi;
            this.toInput.value = poi.name || "";
            this.setState({
                tipPois: []
            });

            if (this.fromPoi) {
                this.route(this.fromPoi, this.toPoi);
            } else {
                this.fromInput.focus();
            }
        }
    }

    onClickSearchBtn(){
        if(this.fromPoi && this.toPoi){
            this.route(this.fromPoi, this.toPoi);
        }else{
            const from = this.fromInput.value.trim();
            const to = this.toInput.value.trim();
            if(from && to){
                const p1 = this.getMockPoiByKeyword(this.fromPoi, from);
                const p2 = this.getMockPoiByKeyword(this.toPoi, to);
                const p = Promise.all([p1, p2]);
                this.wrapPromise(p).then((results) => {
                    const fromPoi = results[0];
                    const toPoi = results[1];
                    if(fromPoi && toPoi){
                        this.route(fromPoi, toPoi);
                    }
                });
            }
        }
    }

    onTrafficTypeChange(trafficType) {
        this.setState({
            type: trafficType
        });
        if (this.fromPoi && this.toPoi) {
            this.route(this.fromPoi, this.toPoi);
        }
    }

    route(fromPoi, toPoi) {
        if (fromPoi && toPoi) {
            this.props.router.push({
                pathname: '/nav/paths',
                state: {
                    type: this.state.type,
                    fromPoi: fromPoi,
                    toPoi: toPoi
                }
            });
        }
    }

    getMockPoiByKeyword(poi, keyword){
        return new Promise((resolve, reject) => {
            if(poi){
                resolve(poi);
            }else{
                if(keyword === this.currentLocationText){
                    this.mockPoiByCurrentLocation().then((mockPoi) => resolve(mockPoi))
                    .catch((e) => {
                        console.error(e);
                        reject(e);
                    });
                }else{
                    this.searchPois(keyword, 'ignored', (pois) => {
                        resolve(pois[0]);
                    });
                }
            }
        });
    }

    mockPoiByCurrentLocation(){
        return Service.getCurrentPosition(false).then((location) => {
            return {
                pointx: location.lon,
                pointy: location.lat,
                POI_PATH: [{
                    cname: location.city
                }]
            };
        });
    }

    render() {
        const fromClassName = classNames("icon-location", styles["from-icon"]);
        const toClassName = classNames("icon-circle-empty", styles["to-icon"]);
        const addressClassName = classNames(styles.address, "ellipsis");
        const pois = this.state.tipPois;

        return (
            <div>
                <TrafficTypes type={this.state.type} 
                    ref={input => this.trafficTypes = input} 
                    onTrafficTypeChange={e => this.onTrafficTypeChange(e)} 
                    onCancel={() => this.onCancel()} />
                <div className={styles["search-section"]}>
                    <div className={styles["inputs-container"]}>
                        <div className={classNames(styles["input-container"], styles.from)}>
                            <i className={fromClassName}></i>
                            <input type="text" 
                                placeholder="请输入出发地"
                                value={this.state.from}
                                ref={(input) => { this.fromInput = input; }}
                                onFocus={(e) => this.onFromFocus(e)}
                                onKeyPress={(e) => this.onKeyPress(e)}
                                onChange={(e) => this.onFromChange(e)} />
                        </div>
                        <div className={styles["input-container"]}>
                            <i className={toClassName}></i>
                            <input type="text" 
                                placeholder="请输入目的地"
                                value={this.state.to}
                                ref={(input) => { this.toInput = input; }}
                                onFocus={(e) => this.onToFocus(e)}
                                onKeyPress={(e) => this.onKeyPress(e)}
                                onChange={(e) => this.onToChange(e)} />
                        </div>
                    </div>
                    <div className={styles['search-btn']} onClick={() => this.onClickSearchBtn()}>搜索</div>
                </div>
                <div className={styles.pois}>
                    {
                        pois.map((poi) => {
                            return (
                                <div className={styles.poi} key={poi.uid} onClick={(e) => { this.onClickPoi(poi, this.isFromLastFocused); }}>
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