import React, {Component} from 'react';
import classNames from "classnames";
import styles from './index.scss';
import fontStyles from 'webapp/fonts/font-awesome.scss';
import Service from 'world/Service';
import MathUtils from 'world/math/Utils';

export default class Result extends Component{
    constructor(props){
        super(props);
        this.lon = 0;
        this.lat = 0;
        this.nameClassNames = classNames(styles.name, "ellipsis");
        this.addressClassNames = classNames(styles.address, "ellipsis");
        this.roadIcon = classNames(fontStyles.fa, fontStyles["fa-road"])
        this.state = {
            pois: []
        };
    }

    componentDidMount(){
        const {
            keyword
        } = this.props.location.query;
        Service.location().then((location) => {
            if(location){
                this.lon = location.lon;
                this.lat = location.lat;
                return Service.searchNearby(keyword, location.lon, location.lat, 1000, 10);
            }else{
                return null;
            }
        }).then((response) => {
            if(response){
                this.setState({
                    pois: response.detail.pois
                });
            }
        });
    }

    render(){
        return (
            <div>
                <div className={styles.pois}>
                    {
                        this.state.pois.map((poi, index) => {
                            var distance = MathUtils.getRealArcDistanceBetweenLonLats(this.lon, this.lat, poi.pointx, poi.pointy);
                            distance = Math.floor(distance);
                            return (
                                <div className={styles.poi} key={poi.uid}>
                                    <div className={styles.index}>{index+1}</div>
                                    <div className={styles.info}>
                                        <div className={this.nameClassNames}>{poi.name}</div>
                                        <div className={this.addressClassNames}>{poi.addr}</div>
                                    </div>
                                    <div className={styles.distance}>
                                        <i className={this.roadIcon}></i>
                                        <div>{distance}米</div>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
};