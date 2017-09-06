import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import styles from './index.scss';
import RouteComponent from 'webapp/components/RouteComponent';
import Search from 'webapp/components/Search';
import Map, { globe } from 'webapp/components/Map';
import Kernel from 'world/Kernel';
import MathUtils from 'world/math/Utils';

export default class Result extends RouteComponent {

    constructor(props) {
        super(props);
        this.pageCapacity = 10;
        this.distance = Kernel.REAL_EARTH_RADIUS;
        this.nameClassNames = classNames(styles.name, "ellipsis");
        this.addressClassNames = classNames(styles.address, "ellipsis");
        this.roadIcon = "icon-road";
        this.leftIcon = "icon-angle-left";
        this.rightIcon = "icon-angle-right";
        this.state = {
            loading: false,
            total: 0,
            pageIndex: 0,
            location: null,
            // pois: [],
            graphics: [],
            highlightPoi: null,
            list: true
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.domNode.style.opacity = 1;
        this.search(0);
        globe.poiLayer.setHighlightListener((graphic) => {
            this.setState({
                highlightPoi: graphic
            });
        });
        globe.poiLayer.setUnHighlightListener(() => {
            this.setState({
                highlightPoi: null
            });
        });
    }

    componentWillUnmount(){
        super.componentWillUnmount();
        globe.poiLayer.setHighlightListener(null);
        globe.poiLayer.setUnHighlightListener(null);
    }

    onMap() {
        this.setState({
            list: false
        });
    }

    onList() {
        this.setState({
            list: true
        });
    }

    onClickPoi(graphic, index){
        // const graphic = globe.poiLayer.children[index];
        if(graphic){
            globe.poiLayer.highlightPoi(graphic);
        }
        if(typeof graphic.attributes.pointx === 'number' && typeof graphic.attributes.pointy === 'number'){
            globe.centerTo(graphic.attributes.pointx, graphic.attributes.pointy);
        }
        // this.setState({
        //     list: false
        // });
        this.searchComponent.onLeftAction();
    }

    onFocus(){
        this.onCancel();
    }

    onCancel() {
        // normal code
        // globe.poiLayer.clear();
        // this.goBack();

        //fix for Xiaomi browser
        this.domNode.style.opacity = 0;
        // console.log(this.domNode.clientWidth);
        setTimeout(() => {
            globe.poiLayer.clear();
            this.goBack();
        }, 50);
    }

    onPrevPage() {
        this.search(this.state.pageIndex - 1);
    }

    onNextPage() {
        this.search(this.state.pageIndex + 1);
    }

    isFromMapBaseRoute(){
        let fromMapBase = false;
        const prevLocation = this.getPreviousLocation();
        if(prevLocation && prevLocation.pathname === "/map/base"){
            fromMapBase = true;
        }
        return fromMapBase;
    }

    search(pageIndex) {
        const distance = this.distance;
        const {
            query: {
                keyword
            }
        } = this.props.location;
        if (this.hasBeenMounted() && keyword) {
            // const fromMapBase = this.isFromMapBaseRoute();
            // console.log(`fromMapBase: ${fromMapBase}`);
            // const promise = fromMapBase ? globe.poiLayer.searchByCurrentCity(keyword, 'Auto', this.pageCapacity, pageIndex) : globe.poiLayer.searchNearby(keyword, distance, 'Auto', this.pageCapacity, pageIndex);
            const promise = globe.poiLayer.searchNearby(keyword, distance, 'Auto', this.pageCapacity, pageIndex);
            this.wrapPromise(promise).then((response) => {
                if (response) {
                    this.setState({
                        total: response.info.total,
                        pageIndex: pageIndex,
                        location: response.location,
                        // pois: response.detail.pois
                        graphics: response.detail.graphics
                    });
                }
            });
        }
    }

    render() {
        const {
            loading,
            total,
            pageIndex,
            location,
            // pois
            graphics,
            highlightPoi
        } = this.state;

        let {
            query: {
                keyword
            }
        } = this.props.location;
        keyword = keyword || "";

        const totalPageCount = Math.ceil(total / this.pageCapacity);
        const showPrevPage = pageIndex > 0;
        const showNextPage = pageIndex < totalPageCount - 1;

        return (
            <div ref={input => this.domNode = input}>
                <Search ref={input => this.searchComponent = input}
                    readOnly={true} 
                    placeholder={keyword} 
                    showMapList={true} 
                    showCancel={true} 
                    onMap={() => this.onMap()} 
                    onList={() => this.onList()} 
                    onCancel={() => this.onCancel()} 
                    onFocus={() => this.onFocus()} />
                {
                    this.state.list ? (
                        <div className={styles.list}>
                            {
                                !loading && total === 0 && (
                                    <div className={styles["not-found"]}>{keyword ? `未在附近找到与${keyword}相关的地点` : `请输入要搜索的兴趣点`}</div>
                                )
                            }
                            {
                                total > 0 && (
                                    <div className={styles.pois}>
                                        {
                                            graphics.map((poi, index) => {
                                                let distanceLabel = false;

                                                if(location && location.length === 2){
                                                    const [lon, lat] = location;
                                                    let distance = MathUtils.getRealArcDistanceBetweenLonLats(lon, lat, poi.attributes.pointx, poi.attributes.pointy);
                                                    distanceLabel = distance > 1000 ? `${(distance/1000).toFixed(1)}公里` : `${Math.floor(distance)}米`;
                                                }
                                                
                                                return (
                                                    <div className={styles.poi} key={poi.attributes.uid} onClick={() => this.onClickPoi(poi, index)}>
                                                        <div className={styles.index}>{index + 1}</div>
                                                        <div className={styles.info}>
                                                            <div className={this.nameClassNames}>{poi.attributes.name}</div>
                                                            <div className={this.addressClassNames}>{poi.attributes.addr}</div>
                                                        </div>
                                                        {
                                                            distanceLabel && (
                                                                <div className={styles.distance}>
                                                                    <i className={this.roadIcon}></i>
                                                                    <div>{distanceLabel}</div>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                )
                            }
                            {
                                total > 0 && (
                                    <div className={styles.footer}>
                                        {
                                            showPrevPage && (
                                                <div className={styles["prev-page"]} onClick={() => this.onPrevPage()}>
                                                    <i className={this.leftIcon}></i>
                                                    <span>上一页</span>
                                                </div>
                                            )
                                        }
                                        <div className={styles["current-page"]}>
                                            {pageIndex + 1} / {totalPageCount}
                                        </div>
                                        {
                                            showNextPage && (
                                                <div className={styles["next-page"]} onClick={() => this.onNextPage()}>
                                                    <span>下一页</span>
                                                    <i className={this.rightIcon}></i>
                                                </div>
                                            )
                                        }
                                    </div>
                                )
                            }
                        </div>
                    ) : (
                            <div className={styles.map}>
                                <Map />
                                {
                                    highlightPoi && (
                                        <div className={styles.infowindow}>
                                            <div className={this.nameClassNames}>{highlightPoi.attributes.name}</div>
                                            <div className={this.addressClassNames}>{highlightPoi.attributes.addr}</div>
                                        </div>
                                    )
                                }
                            </div>
                        )
                }
            </div>
        );
    }
};