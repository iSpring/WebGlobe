import React, {Component} from 'react';
import Globe from 'webapp/components/Globe';

export default class Map extends Component{
    constructor(props){
        super(props);
        this.state = {};
    }

    render(){
        return (
            <div>
                <Globe />
            </div>
        );
    }
};