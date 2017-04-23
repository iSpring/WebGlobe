import React from 'react';
import classNames from 'classnames';
import RouteComponent from 'webapp/components/RouteComponent';
import MapComponent, {globe} from 'webapp/components/Map';
import styles from './index.scss';

export default class Paths extends RouteComponent {
    constructor(props) {
        super(props);
        this.state = {
            selectedPathIndex: 0
        };
    }

    getTimeDistanceSummary(path) {
        let {
            distance,
            duration
        } = path;
        distance = parseFloat(distance);
        duration = parseFloat(duration);
        let timeSummary = `${Math.round(duration / 60)}分钟`;
        let distanceSummary = distance >= 1000 ? `${(distance / 1000).toFixed(1)}公里` : `${distance}米`;
        return [timeSummary, distanceSummary];
    }

    onSelectPath(pathIndex) {
        globe.routeLayer.showPath(pathIndex);
        this.setState({
            selectedPathIndex: pathIndex
        });
    }

    genPathDetail(path, pathIndex, selected, showSummary, taxi_cost) {
        const pathDetailClassName = selected ? classNames(styles["path-detail"], styles.selected) : styles["path-detail"]
        
        return (
            <div className={pathDetailClassName} key={`path-${pathIndex}`}>
                {
                    (() => {
                        if(showSummary){
                            const [timeSummary, distanceSummary] = this.getTimeDistanceSummary(path);
                            return <div className={styles.summary}>{`${timeSummary} ${distanceSummary}`}</div>;
                        }else{
                            return false;
                        }
                    })()
                }
                <div className={classNames(styles.steps, "ellipsis")}>{path.steps.map((step) => step.road).filter((road) => !!road).join(" -> ")}</div>
                <div className={classNames(styles["traffic-lights"], "ellipsis")}>红绿灯{path.traffic_lights}个 {taxi_cost && `打车${parseFloat(taxi_cost).toFixed(1)}元` }</div>
            </div>
        );
    }

    render() {
        const route = this.props.location.state.route;

        if (route && route.paths && route.paths.length > 0) {
            if (route.paths.length === 1) {
                const path = route.paths[0];
                return (
                    <div className={styles["single-path"]}>
                        <div className={styles["map-container"]}>
                            <MapComponent />
                        </div>
                        <div className={styles.footer}>
                            <div className={styles["path-details"]}>{this.genPathDetail(path, 0, true, true, route.taxi_cost)}</div>
                        </div>
                    </div>
                );
            } else {
                let selectedPathIndex = this.state.selectedPathIndex;

                return (
                    <div className={styles["multiple-path"]}>
                        <div className={styles["map-container"]}>
                            <MapComponent />
                        </div>
                        <div className={styles.footer}>
                            <div className={styles.tabs}>
                                {
                                    route.paths.map((path, index) => {
                                        const [timeSummary, distanceSummary] = this.getTimeDistanceSummary(path);
                                        const tabClassName = selectedPathIndex === index ? classNames(styles.tab, styles.selected) : styles.tab;
                                        return (
                                            <div className={tabClassName} key={`path-${index}`} onClick={() => this.onSelectPath(index)}>
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
                                        return this.genPathDetail(path, index, index === selectedPathIndex, false, route.taxi_cost);
                                    })
                                }
                            </div>
                        </div>
                    </div>
                );
            }
        } else {
            return (
                <div className={styles["no-path"]}>
                    <div className={styles["map-container"]}>
                        <MapComponent />
                    </div>
                </div>
            );
        }
    }
};