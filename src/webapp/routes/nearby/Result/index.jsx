import React, {Component} from 'react';
import styles from './index.scss';
import Service from '../../../../core/world/Service';

export default class Result extends Component{
    constructor(props){
        super(props);
        this.state = {
            pois: []
        };
    }

    componentDidMount(){
        const {
            keyword
        } = this.props.location.query;
        Service.location().then((location) => {
            return Service.searchNearby(keyword, location.lon, location.lat, 1000, 10);
        }).then((response) => {
            console.log(response);
            this.setState({
                pois: response.detail.pois
            });
        });
    }

    render(){
        return (
            <div className={styles.pois}>
                {
                    this.state.pois.map((poi) => {
                        return (
                            <div className={styles.poi}>
                                <div className={styles.index}></div>
                                <div className={styles.info}>
                                    <div className={styles.name}>{poi.name}</div>
                                    <div className={styles.address}>{poi.addr}</div>
                                </div>
                                <div className={styles.distance}></div>
                            </div>
                        );
                    })
                }
            </div>
        );
    }
};