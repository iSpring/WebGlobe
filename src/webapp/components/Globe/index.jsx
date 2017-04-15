import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import styles from './index.scss';
import Globe from 'world/Globe';

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
        this.globe = Globe.getInstance();
        const domNode = ReactDOM.findDOMNode(this);
        this.globe.placeAt(domNode);
    }

    componentWillUnmount(){
        const domNode = ReactDOM.findDOMNode(this);
        const canvas = this.globe && this.globe.canvas;
        if(canvas && canvas.parentNode === domNode){
            domNode.removeChild(canvas);
        }
    }
};