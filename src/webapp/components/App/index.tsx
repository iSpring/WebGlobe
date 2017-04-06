import * as React from 'react';

interface IProps{
    description: string;
};

interface IState{

}

export default class App extends React.Component<IProps, IState>{
    constructor(props:IProps){
        super(props);
    }

    render(){
        return <div>{this.props.description}</div>;
    }
};