import React,{Component} from 'react';
import classNames from 'classnames';
import styles from './index.scss';
import fontStyles from 'webapp/fonts/font-awesome.scss';

export default class TrafficTypes extends Component{

    constructor(props){
        super(props);
        this.state = {
            type: 'driving'//bus,walking
        };
        if(this.props.type){
            this.state.type = this.props.type;
        }
    }

    onClickTrafficType(trafficType){
        if(trafficType !== this.state.trafficType){
            this.setState({
                type: trafficType
            });
            if(this.props.onChangeTrafficType){
                this.props.onChangeTrafficType(trafficType);
            }
        }
    }

    getTrafficType(){
        return this.state.type;
    }

    onCancel(){
        if(this.props.onCancel){
            this.props.onCancel();
        }
    }

    render(){
        const busClassName = classNames(fontStyles.fa, fontStyles["fa-bus"], styles["traffic-type"], {
            selected: this.state.type === 'bus'
        });
        const driveClassName = classNames(fontStyles.fa, fontStyles["fa-car"], styles["traffic-type"], {
            selected: this.state.type === 'driving'
        });
        const walkClassName = classNames(fontStyles.fa, fontStyles["fa-male"], styles["traffic-type"], {
            selected: this.state.type === 'walking'
        });

        return (
            <div>
                <header>
                    <div className={styles["traffic-types"]}>
                        <i className={busClassName} onClick={()=>this.onClickTrafficType('bus')}></i>
                        <i className={driveClassName} onClick={()=>this.onClickTrafficType('driving')}></i>
                        <i className={walkClassName} onClick={()=>this.onClickTrafficType('walking')}></i>
                    </div>
                    <div className={styles.cancel} onClick={()=>{this.onCancel();}}>取消</div>
                </header>
            </div>
        );
    }
};