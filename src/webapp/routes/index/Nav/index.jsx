import React from 'react';
import RouteComponent from 'webapp/routes/RouteComponent';
import classNames from 'classnames';
import styles from './index.scss';
import fontStyles from 'webapp/fonts/font-awesome.scss';
import Service from 'world/Service';

export default class Nav extends RouteComponent{

    constructor(props){
        super(props);
        this.pageCapacity = 10;
        this.state = {
            type: 'bus',//drive,walk
            pois: [],
            routes: []
        };
    }

    onCancel(){
        this.goBack();
    }

    onDepartureKeyPress(e){
        const departure = e.target.value;
        if(e.key === "Enter"){
            if(departure){
                Service.searchByCurrentCity(departure, this.pageCapacity).then((response) => {
                    console.log(response);
                    let pois = [];
                    if(response.detail){
                        pois = response.detail.pois;
                    }
                    this.setState({
                        pois: response.detail.pois
                    });
                });
            }
        }
    }

    onDestinationKeyPress(e){

    }

    onClickPoi(poi){
        console.log(poi);
    }

    render(){
        const busClassName = classNames(fontStyles.fa, fontStyles["fa-bus"], styles["traffic-type"], {
            selected: this.state.type !== 'drive' && this.state.type !== 'walk'
        });
        const driveClassName = classNames(fontStyles.fa, fontStyles["fa-car"], styles["traffic-type"], {
            selected: this.state.type === 'drive'
        });
        const walkClassName = classNames(fontStyles.fa, fontStyles["fa-male"], styles["traffic-type"], {
            selected: this.state.type === 'walk'
        });
        const fromClassName = classNames(fontStyles.fa, fontStyles["fa-map-marker"], styles["from-icon"]);
        const toClassName = classNames(fontStyles.fa, fontStyles["fa-circle-o"], styles["to-icon"]);
        const exchangeArrowClassName = classNames(fontStyles.fa, fontStyles["fa-arrows-v"]);
        const addressClassName = classNames(styles.address, "ellipsis");

        return (
            <div>
                <header>
                    <div className={styles["traffic-types"]}>
                        <i className={busClassName}></i>
                        <i className={driveClassName}></i>
                        <i className={walkClassName}></i>
                    </div>
                    <div className={styles.cancel} onClick={()=>{this.onCancel();}}>取消</div>
                </header>
                <div className={styles["search-section"]}>
                    <div className={styles["inputs-container"]}>
                        <div className={classNames(styles["input-container"], styles.departure)}>
                            <i className={fromClassName}></i>
                            <input type="text" placeholder="请输入出发地" onKeyPress={(e)=>this.onDepartureKeyPress(e)} />
                        </div>
                        <div className={styles["input-container"]}>
                            <i className={toClassName}></i>
                            <input type="text" placeholder="请输入目的地" onKeyPress={(e)=>this.onDestinationKeyPress(e)} />
                        </div>
                    </div>
                    <div className={styles.exchange}>
                        <i className={exchangeArrowClassName}></i>
                    </div>
                </div>
                <div className={styles.pois}>
                    {
                        this.state.pois.map((poi) => {
                            return (
                                <div className={styles.poi} key={poi.uid} onClick={()=>this.onClickPoi(poi)}>
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