import React from 'react';
import classNames from 'classnames';
import TrafficTypes from 'webapp/components/TrafficTypes';
import RouteComponent from 'webapp/components/RouteComponent';
import MapComponent, { globe } from 'webapp/components/Map';
import styles from './index.scss';

export default class Paths extends RouteComponent {
    constructor(props) {
        super(props);
        this.state = {
            type: 'driving',
            route: null,
            selectedPathIndex: 0
        };
        if (this.props.location.state) {
            if (this.props.location.state.type) {
                this.state.type = this.props.location.state.type;
            }
        }
    }

    onSelectPath(pathIndex) {
        globe.routeLayer.showPath(pathIndex);
        this.setState({
            selectedPathIndex: pathIndex
        });
    }

    onCancel(){
        globe.routeLayer.clear();
        this.goBack();
    }

    route(type) {
        if (!type) {
            return;
        }
        const state = this.props.location.state || {};
        const fromPoi = state.fromPoi;
        const toPoi = state.toPoi;
        
        if (fromPoi && toPoi) {
            const fromLon = fromPoi.pointx;
            const fromLat = fromPoi.pointy;
            const toLon = toPoi.pointx;
            const toLat = toPoi.pointy;

            let promise = null;

            if (type === 'driving') {
                promise = globe.routeLayer.routeByDriving(fromLon, fromLat, toLon, toLat, 10);
            } else if (type === 'bus') {
                const startCity = fromPoi.POI_PATH[0].cname;
                const endCity = toPoi.POI_PATH[0].cname;
                promise = globe.routeLayer.routeByBus(fromLon, fromLat, toLon, toLat, startCity, endCity, 0);
            } else if (type === 'walking') {
                promise = globe.routeLayer.routeByWalking(fromLon, fromLat, toLon, toLat);
            }

            if (promise) {
                this.wrapPromise(promise).then((response) => {
                    console.log(response);
                    if (response.route) {
                        this.setState({
                            type: type,
                            route: response.route,
                            selectedPathIndex: 0
                        }, () => {
                            this.mapComponent.resizeGlobe();
                        });
                    }
                }, (err) => console.error(err));
            }
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.route(this.state.type);
    }

    onTrafficTypeChange(trafficType) {
        this.setState({
            type: trafficType,
            route: null,
            selectedPathIndex: 0
        }, () => {
            this.route(trafficType);
        });
    }

    render() {
        const route = this.state.route;
        if (route) {
            let selectedPathIndex = this.state.selectedPathIndex;
            if (route.type === 'driving') {
                return this.renderDriving(route, selectedPathIndex);
            } else if (route.type === 'bus') {
                return this.renderBus(route, selectedPathIndex);
            } else if (route.type === 'walking') {
                return this.renderWalking(route, selectedPathIndex);
            }
        }
        return this.renderNoRoute();
    }

    renderDriving(route, selectedPathIndex) {
        if (route && route.paths && route.paths.length > 0) {
            if (route.paths.length === 1) {
                const path = route.paths[0];
                return (
                    <div className={styles["single-path"]}>
                        {this.renderHeaderMap()}
                        <div className={styles.footer}>
                            <div className={styles["path-details"]}>{this.getPathDetail(route, path, 0, true, true)}</div>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className={styles["multiple-path"]}>
                        {this.renderHeaderMap()}
                        <div className={styles.footer}>
                            <div className={styles.tabs}>
                                {
                                    route.paths.map((path, index) => {
                                        const [timeSummary, distanceSummary] = this.getTimeDistanceSummary(path);
                                        const tabClassName = selectedPathIndex === index ? classNames(styles.tab, styles.selected) : styles.tab;
                                        return (
                                            <div className={tabClassName} key={`${route.type}-path-${index}`} onClick={() => this.onSelectPath(index)}>
                                                <div className={classNames(styles.time, "ellipsis")}>{timeSummary}</div>
                                                <div className={classNames(styles.distance, "ellipsis")}>{distanceSummary}</div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                            <div className={styles["path-details"]}>
                                {
                                    route.paths.map((path, index) => {
                                        return this.getPathDetail(route, path, index, index === selectedPathIndex, false);
                                    })
                                }
                            </div>
                        </div>
                    </div>
                );
            }
        } else {
            return this.renderNoRoute();
        }
    }

    renderBus(route, selectedPathIndex) {
        if (route && route.transits && route.transits.length > 0) {
            return (
                <div className={styles["multiple-path"]}>
                    {this.renderHeaderMap()}
                    <div className={styles.footer}>
                        <div className={styles.tabs}>
                            {
                                route.transits.map((transit, index) => {
                                    const [timeSummary, distanceSummary] = this.getTimeDistanceSummary(transit);
                                    const tabClassName = selectedPathIndex === index ? classNames(styles.tab, styles.selected) : styles.tab;
                                    return (
                                        <div className={tabClassName} key={`bus-path-${index}`} onClick={() => this.onSelectPath(index)}>
                                            <div className={classNames(styles.time, "ellipsis")}>{timeSummary}</div>
                                            <div className={classNames(styles.distance, "ellipsis")}>{distanceSummary}</div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <div className={styles["path-details"]}>
                            {
                                route.transits.map((transit, index) => {
                                    return this.getPathDetail(route, transit, index, index === selectedPathIndex, false);
                                })
                            }
                        </div>
                    </div>
                </div>
            );
        } else {
            return this.renderNoRoute();
        }
    }

    renderWalking(route, selectedPathIndex) {
        if (route && route.paths && route.paths.length > 0) {
            const path = route.paths[0];
            return (
                <div className={styles["single-path"]}>
                    {this.renderHeaderMap()}
                    <div className={styles.footer}>
                        <div className={styles["path-details"]}>{this.getPathDetail(route, path, 0, true, false)}</div>
                    </div>
                </div>
            );
        } else {
            return this.renderNoRoute();
        }
    }

    renderNoRoute() {
        return (
            <div className={styles["no-path"]}>
                {this.renderHeaderMap()}
            </div>
        );
    }

    renderHeaderMap() {
        return [
            <TrafficTypes key="traffic-types" type={this.state.type} onTrafficTypeChange={e => this.onTrafficTypeChange(e)} onCancel={() => this.onCancel()} />,
            <div key={"map-container"} className={styles["map-container"]}>
                <MapComponent ref={input => this.mapComponent = input} />
            </div>
        ];
    }

    getPathDetail(route, path, pathIndex, selected, showSummary1) {
        const pathDetailClassName = selected ? classNames(styles["path-detail"], styles.selected) : styles["path-detail"]

        return (
            <div className={pathDetailClassName} key={`${route.type}-path-${pathIndex}`}>
                {
                    (() => {
                        if (route.type === 'driving') {
                            let drivingChildren = [];
                            if (showSummary1) {
                                const [timeSummary, distanceSummary] = this.getTimeDistanceSummary(path);
                                drivingChildren.push(<div className={styles.summary1}>{`${timeSummary} ${distanceSummary}`}</div>);
                            }
                            drivingChildren = drivingChildren.concat([
                                <div key="summary2" className={classNames(styles.summary2, "ellipsis")}>{path.steps.map((step) => step.road).filter((road) => !!road).join(" -> ")}</div>,
                                <div key="summary3" className={classNames(styles.summary3, "ellipsis")}>红绿灯{path.traffic_lights}个 {route.taxi_cost && `打车${parseFloat(route.taxi_cost).toFixed(1)}元`}</div>
                            ]);
                            return drivingChildren;
                        } else if (route.type === 'bus') {
                            const busNames = [];
                            const transit = path;
                            if (transit.segments && transit.segments.length > 0) {
                                transit.segments.forEach((segment) => {
                                    if(segment){
                                        if (segment.bus && segment.bus.buslines && segment.bus.buslines.length > 0) {
                                            segment.bus.buslines.forEach((busline) => {
                                                if (busline && busline.busName) {
                                                    if (busNames.indexOf(busline.busName) < 0) {
                                                        busNames.push(busline.busName);
                                                    }
                                                }
                                            });
                                        }
                                        if(segment.railway){
                                            let {
                                                departure_stop,
                                                arrival_stop
                                            } = segment.railway;
                                            if(departure_stop && departure_stop.name){
                                                if(departure_stop.name.slice(-1) === '站'){
                                                    busNames.push(departure_stop.name);
                                                }else{
                                                    busNames.push(`${departure_stop.name}站`);
                                                }
                                            }
                                            if(arrival_stop && arrival_stop.name){
                                                if(arrival_stop.name.slice(-1) === '站'){
                                                    busNames.push(arrival_stop.name);
                                                }else{
                                                    busNames.push(`${arrival_stop.name}站`);
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                            return [
                                <div key="summary2" className={classNames(styles.summary2, "ellipsis")}>{busNames.join(" -> ")}</div>,
                                <div key="summary3" className={classNames(styles.summary3, "ellipsis")}>花费{parseFloat(transit.cost).toFixed(1)}元  步行{this.getDistanceSummary(transit.walking_distance)}</div>
                            ];
                        } else if (route.type === 'walking') {
                            const [timeSummary, distanceSummary] = this.getTimeDistanceSummary(path);
                            return [
                                <div key="summary1" className={classNames(styles.summary1, "ellipsis")}>{`${timeSummary} ${distanceSummary}`}</div>,
                                <div key="summary2" className={classNames(styles.summary2, "ellipsis")}>{path.steps.map((step) => step.road).filter((road) => !!road).join(" -> ")}</div>,
                                <div key="summary3" className={classNames(styles.summary3, "ellipsis")}><span className={classNames(styles["detail-btn"])}>详情</span></div>
                            ];
                        }
                        return false;
                    })()
                }
            </div>
        );
    }

    getTimeDistanceSummary(path) {
        let {
            distance,
            duration
        } = path;

        return [this.getTimeSummary(duration), this.getDistanceSummary(distance)];
    }

    getTimeSummary(seconds) {
        seconds = parseFloat(seconds);
        let allMinutes = Math.round(seconds / 60);
        if(allMinutes < 60){
            return `${allMinutes}分钟`;
        }else{
            let hours = Math.floor(allMinutes / 60);
            let minutes = allMinutes - hours * 60;
            if(minutes > 0){
                return `${hours}小时${minutes}分钟`;
            }else{
                return `${hours}小时`;
            }
        }
    }

    getDistanceSummary(distance) {
        distance = parseFloat(distance);
        let distanceSummary = distance >= 1000 ? `${(distance / 1000).toFixed(1)}公里` : `${distance}米`;
        return distanceSummary;
    }
};