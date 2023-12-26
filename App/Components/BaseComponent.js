import React, { Component } from 'react'
import { BackHandler } from 'react-native'
import * as Helper from '../Lib/Helper';
import Constants from '../Components/Constants';
import EventEmitter from '../Lib/EventEmitter';


export default class BaseComponent extends Component {

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.goBack();
            return true
        })
        EventEmitter.on(Constants.EVENT_REWARD_COIN_UPDATE, () => {
            Helper.setNavigationRewardCoins(this.props.navigation)
        })
        // Helper.getChildRewardPoints(this.props.navigation)
        // EventEmitter.on('focus', () => {
        //     Helper.getChildRewardPoints(this.props.navigation)
        // })
        // Helper.getChildRewardPoints(this.props.navigation)
    }

    componentWillUnmount() {
        if (this.backHandler) {
            this.backHandler.remove()
        }
    }
}