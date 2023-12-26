import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Image, ImageBackground, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Api from '../Services/Api';
import { Colors, Images, Metrics } from '../Themes';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Share from 'react-native-share';


// Styles
import styles from './Styles/ShareScreenStyles';
import BaseComponent from '../Components/BaseComponent';

// Global Variables
const objSecureAPI = Api.createSecure();


export default class ShareScreen extends BaseComponent {

    static navigationOptions = ({ navigation }) => ({
        headerStyle: {
            backgroundColor: Colors.navHeaderLight,
            shadowOpacity: 0,
            shadowOffset: { height: 0, },
            elevation: 0,
            height: Metrics.navBarHeight,
            borderBottomWidth: 0,
        },
    });

    //constructor event
    constructor(props) {
        super(props)
        this.state = {
            showDropdown: false,
            isLoading: false
        }
    }

    //#region -> Component Methods
    componentDidMount() {
        super.componentDidMount()
        this.getChildDetail()
    }
    //#endregion

    //#region -> Class Methods
    getChildDetail = () => {
        AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
            if (child != '') {
                this.state.objSelectedChild = JSON.parse(child)
            }
        })
    }

    onPressShare = (shareType) => {
        const shareOptions = {
            title: Constants.APP_NAME,
            message: 'Please download the app',
            url: 'some share url',
        };
        Share.open(shareOptions)
            .then((res) => { console.log(res) })
            .catch((err) => { err && console.log(err); });
    }
    //#endregion

    //#region -> API Call

    //#endregion

    //#region -> View Render
    render() {
        return (
            <View style={styles.mainContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
                <ImageBackground source={Images.blueBackground} style={styles.backgroundImage}>
                    <View style={[styles.container]}>
                        <Image source={Images.alarmClock} style={[styles.alarmClock, { alignSelf: 'center' }]} />
                        <View style={[styles.center, { flex: 1 }]}>
                            <View style={styles.shareButtonSection}>
                                <TouchableOpacity style={styles.shareButton} onPress={() => this.onPressShare(Constants.KEY_FACEBOOK)}>
                                    <Image source={Images.facebook} style={styles.socialIcon} />
                                    <Text style={styles.buttonText}>{'SHARE VIA FACEBOOK'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.shareButtonSection}>
                                <TouchableOpacity style={styles.shareButton} onPress={() => this.onPressShare(Constants.KEY_TWITTER)}>
                                    <Image source={Images.twitter} style={styles.socialIcon} />
                                    <Text style={styles.buttonText}>{'SHARE VIA TWITTER'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.shareButtonSection}>
                                <TouchableOpacity style={styles.shareButton} onPress={() => this.onPressShare(Constants.KEY_EMAIL)}>
                                    <Image source={Images.email} style={styles.socialIcon} />
                                    <Text style={styles.buttonText}>{'SHARE VIA EMAIL'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        )
    }
    //#endregion
}
