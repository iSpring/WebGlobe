import React from 'react';
import RouteComponent from 'webapp/routes/RouteComponent';
import MapComponent from 'webapp/components/Map';

export default class Paths extends RouteComponent{
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