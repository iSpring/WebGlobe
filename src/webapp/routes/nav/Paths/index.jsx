import React from 'react';
import classNames from 'classnames';
import RouteComponent from 'webapp/components/RouteComponent';
import MapComponent from 'webapp/components/Map';
import styles from './index.scss';

export default class Paths extends RouteComponent{
    constructor(props){
        super(props);
        this.state = {};
    }

    render(){
        const route = this.props.location.state.route;
        let {
            distance,
            duration,
            steps,
            traffic_lights
        } = route.paths[0];
        distance = parseFloat(distance);
        duration = parseFloat(duration);
        let summary = `${Math.round(duration / 60)}分钟 `;
        if(distance >= 1000){
            summary += `${(distance/1000).toFixed(1)}公里`;
        }else{
            summary += `${distance}米`;
        }
        return (
            <div>
                <div className={styles["map-container"]}>
                    <MapComponent />
                </div>
                <div className={styles.footer}>
                    <div className={styles["path-detail"]}>
                        <div className={styles.summary}>{summary}</div>
                        <div className={classNames(styles.steps, "ellipsis")}>{steps.map((step) => step.road).filter((road) => !!road).join(" -> ")}</div>
                        <div className={classNames(styles["traffic-lights"], "ellipsis")}>红绿灯{traffic_lights}个 打车{route.taxi_cost}元</div>
                    </div>
                </div>
            </div>
        );
    }
};