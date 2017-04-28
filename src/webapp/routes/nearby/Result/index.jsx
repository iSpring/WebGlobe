import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import styles from './index.scss';
import fontStyles from 'webapp/fonts/font-awesome.scss';
import RouteComponent from 'webapp/components/RouteComponent';
import Search from 'webapp/components/Search';
import Map, { globe } from 'webapp/components/Map';
import MathUtils from 'world/math/Utils';

export default class Result extends RouteComponent {

    constructor(props) {
        super(props);
        this.pageCapacity = 10;
        this.distance = 3000;
        this.nameClassNames = classNames(styles.name, "ellipsis");
        this.addressClassNames = classNames(styles.address, "ellipsis");
        this.roadIcon = classNames(fontStyles.fa, fontStyles["fa-road"]);
        this.leftIcon = classNames(fontStyles.fa, fontStyles["fa-angle-left"]);
        this.rightIcon = classNames(fontStyles.fa, fontStyles["fa-angle-right"]);
        this.state = {
            loading: false,
            total: 0,
            pageIndex: 0,
            location: null,
            pois: [],
            list: true
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.domNode.style.opacity = 1;
        this.search(0);
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
            const fromMapBase = this.isFromMapBaseRoute();
            // console.log(`fromMapBase: ${fromMapBase}`);
            const promise = fromMapBase ? globe.searchByCurrentCity(keyword, this.pageCapacity, pageIndex) : globe.searchNearby(keyword, distance, this.pageCapacity, pageIndex);
            this.wrapPromise(promise).then((response) => {
                if (response) {
                    this.setState({
                        total: response.info.total,
                        pageIndex: pageIndex,
                        location: response.location,
                        pois: response.detail.pois
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
            pois
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
                <Search readOnly={true} placeholder={keyword} showMapList={true} showCancel={true} onMap={() => this.onMap()} onList={() => this.onList()} onCancel={() => this.onCancel()} onFocus={() => this.onFocus()} />
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
                                            this.state.pois.map((poi, index) => {
                                                let distanceLabel = false;

                                                if(location && location.length === 2){
                                                    const [lon, lat] = location;
                                                    let distance = MathUtils.getRealArcDistanceBetweenLonLats(lon, lat, poi.pointx, poi.pointy);
                                                    distanceLabel = distance > 1000 ? `${(distance/1000).toFixed(1)}公里` : `${Math.floor(distance)}米`;
                                                }
                                                
                                                return (
                                                    <div className={styles.poi} key={poi.uid}>
                                                        <div className={styles.index}>{index + 1}</div>
                                                        <div className={styles.info}>
                                                            <div className={this.nameClassNames}>{poi.name}</div>
                                                            <div className={this.addressClassNames}>{poi.addr}</div>
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
                            </div>
                        )
                }
            </div>
        );
    }
};