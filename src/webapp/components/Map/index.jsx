import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import styles from './index.scss';
import Globe from 'world/Globe';

export const globe = Globe.getInstance({
    pauseRendering: true,
    satellite: false,
    lonlat: "auto",
    level: "auto",
    key: "db146b37ef8d9f34473828f12e1e85ad"
});

//延迟一秒加载globe中的切片
setTimeout(function(){
    globe.resumeRendering();
    let __mounted = false;
    const parent = globe.canvas.parentNode;
    if(parent){
        __mounted = !!parent.__mounted;
    }
    if(!__mounted){
        globe.pauseRendering();
    }
}, 1000);

window.globe = globe;

function safelyResizeByParent(){
    try{
        const parent = globe.canvas.parentNode;
        if(parent){
            const w = parent.clientWidth;
            const h = parent.clientHeight;
            if(w > 0 && h > 0){
                globe.resize(w, h);
            }
        }
    }catch(e){
        console.error(e);
    }
}

window.addEventListener("resize", safelyResizeByParent, false);

export default class Map extends Component{

    constructor(props){
        super(props);
        this.state = {};
    }

    render(){
        return <div className={styles.map}></div>;
    }

    resizeGlobe(){
        safelyResizeByParent();
    }

    componentDidMount(){
        const domNode = ReactDOM.findDOMNode(this);
        domNode.__mounted = true;
        globe.placeAt(domNode);
        this.resizeGlobe();
        globe.resumeRendering();
    }

    componentWillUnmount(){
        const domNode = ReactDOM.findDOMNode(this);
        domNode.__mounted = false;
        const canvas = globe && globe.canvas;
        if(canvas && canvas.parentNode === domNode){
            domNode.removeChild(canvas);
            globe.pauseRendering();
        }
    }
};