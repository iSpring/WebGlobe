import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './index.scss';

export default class TrafficTypes extends Component {

    static propTypes = {
        type: PropTypes.string,
        onTrafficTypeChange: PropTypes.func,
        onCancel: PropTypes.func
    }

    static defaultProps = {
        type: 'driving'//bus,walking
    }

    constructor(props) {
        super(props);
        this.lastType = this.props.type;
    }

    onClickTrafficType(trafficType) {
        if (trafficType !== this.lastType) {
            if (this.props.onTrafficTypeChange) {
                this.props.onTrafficTypeChange(trafficType);
            }
        }
        this.lastType = trafficType;
    }

    getTrafficType() {
        return this.state.type;
    }

    onCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    render() {
        const busClassName = classNames("icon-bus", styles["traffic-type"], {
            selected: this.props.type === 'bus'
        });
        const driveClassName = classNames("icon-cab", styles["traffic-type"], {
            selected: this.props.type === 'driving'
        });
        const walkClassName = classNames("icon-male", styles["traffic-type"], {
            selected: this.props.type === 'walking'
        });

        return (
            <div>
                <header>
                    <div className={styles["traffic-types"]}>
                        <i className={busClassName} onClick={() => this.onClickTrafficType('bus')}></i>
                        <i className={driveClassName} onClick={() => this.onClickTrafficType('driving')}></i>
                        <i className={walkClassName} onClick={() => this.onClickTrafficType('walking')}></i>
                    </div>
                    <div className={styles.cancel} onClick={() => { this.onCancel(); }}>取消</div>
                </header>
            </div>
        );
    }
};