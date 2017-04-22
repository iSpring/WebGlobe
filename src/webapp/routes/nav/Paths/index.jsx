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
        const path = route.paths[0];
        return (
            <div>
                <div className={styles["map-container"]}>
                    <MapComponent />
                </div>
                <div className={styles.footer}>
                    <div className={classNames(styles.steps, "ellipsis")}>
                        {
                            path.steps.map((step) => step.road).filter((road) => !!road).join(" -> ")
                        }
                    </div>
                    <div className={classNames(styles["traffic-lights"], "ellipsis")}>红绿灯{path.traffic_lights}个 打车{route.taxi_cost}元</div>
                </div>
            </div>
        );
    }
};