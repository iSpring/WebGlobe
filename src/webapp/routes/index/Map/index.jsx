import React, {Component} from 'react';
import MapComponent from 'webapp/components/Map';

export default class Map extends Component{
    constructor(props){
        super(props);
        this.state = {};
    }

    render(){
        return (
            <div>
                <MapComponent />
            </div>
        );
    }
};