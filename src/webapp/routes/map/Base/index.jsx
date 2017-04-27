import React from 'react';
import RouteComponent from 'webapp/components/RouteComponent';
import MapComponent from 'webapp/components/Map';

export default class Map extends RouteComponent{
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