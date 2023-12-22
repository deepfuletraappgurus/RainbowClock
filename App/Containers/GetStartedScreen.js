import React, { Component } from 'react'
import { ScrollView, Text, Image, View, ImageBackground, TextInput, TouchableOpacity } from 'react-native'
import { Images } from '../Themes'

// Styles
import styles from './Styles/GetStartedScreenStyles'
import * as Helper from '../Lib/Helper'
import BaseComponent from '../Components/BaseComponent';
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from '../Components/Constants'

export default class GetStartedScreen extends BaseComponent {

    //constructor event
    constructor(props) {
        super(props)
        this.state = {
            imageBg: Images.BgDay,
        }
    }

    //#region -> Component Methods
    componentDidMount(){
        this.getImageBg()
    }
    //#endregion

    //#region -> Class Methods
    getImageBg = () => {
        // Helper.getBackgroudImage((image, navHeaderColor) => {
        //     this.props.navigation.setParams({ navHeaderColor });
        //     this.setState({ imageBg: image })
        // })
        AsyncStorage.getItem(Constants.BACKGROUND_IMAGE, (err, result) => {
            if (result) {
              this.setState({ imageBg: result });
            }
          })
          AsyncStorage.getItem(Constants.NAV_COLOR, (err, result) => {
            if (result) {
              this.props.navigation.setParams({ navHeaderColor : result });
            }
          })
    }

    onPressAddChild() {
        this.props.navigation.navigate('AddUserScreen')
    }
    //#endregion

    //#region -> View Render
    render() {
        return (
            <View style={styles.mainContainer}>
                <ImageBackground source={this.state.imageBg} style={styles.backgroundImage}>
                    <ScrollView contentContainerStyle={styles.ScrollView}>
                        <View style={[styles.container, styles.justifySpaceBetween]}>
                            <View style={styles.topHeader}>
                                <Text style={[styles.h1, styles.textCenter]}>CONGRATULATIONS! {'\n'} TIME TO GET STARTED</Text>
                            </View>
                            <View style={styles.justifyBody}>
                                <Image source={Images.logo} style={[styles.logo, { marginBottom: 30 }]} />
                                <Text style={[styles.title, styles.textCenter]}>CREATE YOUR FIRST {'\n'} USER BELOW</Text>
                            </View>
                            <View style={styles.justifyFooter}>
                                <TouchableOpacity style={styles.button} onPress={() => this.onPressAddChild()}>
                                    <Text style={styles.buttonText}>{'Add a New Child'.toUpperCase()}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </ImageBackground>
            </View>
        )
    }
    //#endregion
}