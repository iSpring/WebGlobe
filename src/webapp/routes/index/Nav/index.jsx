import React, {Component} from 'react';
import classNames from 'classnames';
import styles from './index.scss';
import fontStyles from 'webapp/fonts/font-awesome.scss';

export default class Nav extends Component{

    constructor(props){
        super(props);
        this.state = {
            type: 'bus'//drive,walk
        };
    }

    onCancel(){
        ;
    }

    render(){
        const busClassName = classNames(fontStyles.fa, fontStyles["fa-bus"], {
            selected: this.state.type !== 'drive' && this.state.type !== 'walk'
        });
        const driveClassName = classNames(fontStyles.fa, fontStyles["fa-car"], {
            selected: this.state.type === 'drive'
        });
        const walkClassNames = classNames(fontStyles.fa, fontStyles["fa-male"], {
            selected: this.state.type === 'walk'
        });

        return (
            <div>
                <header>
                    <div>
                        <i className={busClassName}></i>
                        <i className={driveClassName}></i>
                        <i className={walkClassNames}></i>
                    </div>
                    <div onClick={()=>{this.onCancel();}}>取消</div>
                </header>
            </div>
        );
    }
};