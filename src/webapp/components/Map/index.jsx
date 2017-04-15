import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import styles from './index.scss';
import Globe from 'world/Globe';

export const globe = Globe.getInstance();

export default class Map extends Component{

    static defaultProps = {
    };

    constructor(props){
        super(props);
        this.state = {};
    }

    render(){
        return <div className={styles.globe}></div>;
    }

    componentDidMount(){
        const domNode = ReactDOM.findDOMNode(this);
        globe.placeAt(domNode);
        const width = domNode.clientWidth;
        const height = domNode.clientHeight;
        if(width > 0 && height > 0){
            globe.resize(width, height);
        }
    }

    componentWillUnmount(){
        const domNode = ReactDOM.findDOMNode(this);
        const canvas = globe && globe.canvas;
        if(canvas && canvas.parentNode === domNode){
            domNode.removeChild(canvas);
        }
    }
};