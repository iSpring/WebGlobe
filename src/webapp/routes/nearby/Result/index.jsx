import React, {Component} from 'react';
import classNames from "classnames";
import styles from './index.scss';
import fontStyles from 'webapp/fonts/font-awesome.scss';
import Search from 'webapp/components/Search';
import makeCancelable from 'webapp/common/makeCancelable';
import Service from 'world/Service';
import MathUtils from 'world/math/Utils';

export default class Result extends Component{
    static contextTypes = {
        router: React.PropTypes.object
    };

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
        this._isMounted = true;
        var promise = Service.location().then((location) => {
            if(location){
                this.lon = location.lon;
                this.lat = location.lat;
                var keyword = this.props.location.query.keyword;
                return Service.searchNearby(keyword, location.lon, location.lat, 1000, 10);
            }else{
                return null;
            }
        }).then((response) => {
            if(!this._isMounted){
                console.log("unmounted");
                return;
            }
            if(response){
                this.setState({
                    pois: response.detail.pois
                });
            }
        });
        this.promiseWrapper = makeCancelable(promise);
    }

    componentWillUnmount(){
        // if(this.promiseWrapper){
        //     this.promiseWrapper.cancel();
        // }
        this._isMounted = false;
    }

    onMap(){
        console.log("onMap");
    }

    onList(){
        console.log("onList");
    }

    onCancel(){
        console.log("onCancel");
        this.context.router.goBack();
    }

    render(){
        return (
            <div>
                <Search placeholder={this.props.location.query.keyword || ""} showMapList={true} showCancel={true} onMap={() => this.onMap()} onList={( )=> this.onList()} onCancel={() => this.onCancel()} onFocus={() => this.onCancel()} />
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