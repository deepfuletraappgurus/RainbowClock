import React, { Component } from 'react'
import {
    ScrollView, Text, Image, View, ImageBackground, TextInput, TouchableOpacity, Keyboard, Platform,
    KeyboardAvoidingView
} from 'react-native'
import { Images, Colors, Metrics } from '../Themes'
import Spinner from '../Components/Spinner';
import EventEmitter from '../Lib/EventEmitter'
import * as Helper from '../Lib/Helper'
import Constants from '../Components/Constants';
import Api from '../Services/Api'

// Styles
import styles from './Styles/PinScreenStyles'
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseComponent from '../Components/BaseComponent';

// Global Variables
const objSecureAPI = Api.createSecure();

export default class ParentsPortalPinScreen extends BaseComponent {

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
            pin1: '',
            pin2: '',
            pin3: '',
            pin4: '',
            isLoading: false,
        }
    }

    //#region -> Component LifeCycle Events
    componentDidMount() {
        super.componentDidMount()
    }
    //#endregion

    //#region -> Class Methods
    manageNextField(position, text) {
        var sholdMoveForword = (text != '')
        switch (position) {
            case 1:
                this.state.pin1 = text
                this.setState({ pin1: text })
                if (sholdMoveForword) {
                    this.refs.pin2.focus()
                }
                break;
            case 2:
                this.state.pin2 = text
                this.setState({ pin2: text })
                if (sholdMoveForword) {
                    this.refs.pin3.focus()
                }
                else {
                    this.refs.pin1.focus()
                }
                break;
            case 3:
                this.state.pin3 = text
                this.setState({ pin3: text })
                if (sholdMoveForword) {
                    this.refs.pin4.focus()
                }
                else {
                    this.refs.pin2.focus()
                }
                break;
            case 4:
                if (!sholdMoveForword) {
                    this.refs.pin3.focus();
                }
                else if (sholdMoveForword) {
                    Keyboard.dismiss();
                }
                this.setState({ pin4: text })
                break;
        }
    }

    manageAllInputs(text) {
        if (parseInt(text)) {
            this.setState(
                { pin1: text[0] ? text[0] : '' },
                { pin2: text[1] ? text[1] : '' },
                { pin3: text[2] ? text[2] : '' },
                { pin4: text[3] ? text[3] : '' },
            )
        }
    }

    btnSubmit = () => {
        Keyboard.dismiss();
        if (this.isValidate()) {
            this.callAPI_VerifyPIN()
        }
    }

    btnGoBack = () => {
        Keyboard.dismiss();
        this.props.navigation.goBack();
    }

    isValidate = () => {
        var strPin = this.state.pin1 + this.state.pin2 + this.state.pin3 + this.state.pin4
        if (strPin.length < 4) {
            Helper.showErrorMessage(Constants.MESSAGE_ONLY_PIN_LENGTH);
            return false
        }
        return true
    }
    //#endregion

    //#region -> API Calls
    callAPI_VerifyPIN = async () => {
        this.setState({ isLoading: true })
        var strPin = this.state.pin1 + this.state.pin2 + this.state.pin3 + this.state.pin4
        const res = objSecureAPI.doVerifyPin(strPin).then((resJSON) => {
            if (resJSON.ok && resJSON.status == 200) {
                this.setState({ isLoading: false })
                if (resJSON.data.success) {
                    try {
                        AsyncStorage.setItem(Constants.KEY_ACCESS_AS_PARENTS, '1')
                        EventEmitter.emit(Constants.EVENT_DRAWER_UPDATE)
                        this.props.navigation.navigate('ParentsSelectChildScreen')
                    } catch (error) {
                    }
                }
                else {
                    Helper.showErrorMessage(resJSON.data.message);
                }
            }
            else if (resJSON.status == 500) {
                this.setState({ isLoading: false })
                Helper.showErrorMessage(resJSON.data.message);
            }
            else {
                this.setState({ isLoading: false })
                Helper.showErrorMessage(Constants.SERVER_ERROR);
            }
        })
    }

    callForgotPin = async () => {
        this.setState({ isLoading: true })
        const res = objSecureAPI.doForgotPin().then((resJSON) => {
            if (resJSON.ok && resJSON.status == 200) {
                this.setState({ isLoading: false })
                if (resJSON.data.success) {
                    Helper.showErrorMessage(resJSON.data.message);
                }
                else {
                    Helper.showErrorMessage(resJSON.data.message);
                }
            }
            else if (resJSON.status == 500) {
                this.setState({ isLoading: false })
                Helper.showErrorMessage(resJSON.data.message);
            }
            else {
                this.setState({ isLoading: false })
                Helper.showErrorMessage(Constants.SERVER_ERROR);
            }
        })
    }
    //#endregion

    //#region -> View Render
    render() {
        return (
            <KeyboardAvoidingView style={styles.mainContainer} behavior={Helper.isIPhoneX() ? "padding" : null}>
                <ImageBackground source={Images.blueBackground} style={styles.backgroundImage}>
                    <ScrollView contentContainerStyle={styles.ScrollView}>
                        <View style={styles.container}>
                            <Image source={Images.logo} style={styles.logo} />
                            <View style={styles.form}>
                                <Text style={[styles.title, styles.textCenter]}>
                                    WELCOME TO THE {'\n'} ADMIN PORTAL
                                </Text>
                                <View style={styles.pinFormParentsPortal}>
                                    <View style={styles.pinRow}>
                                        <Text style={[styles.label, styles.textCenter]}>
                                            {'Enter your pin'.toUpperCase()}
                                        </Text>
                                        <View style={styles.pinFrm} >
                                            <View style={styles.pinBox}>
                                                <TextInput style={[styles.input, styles.textCenter, styles.paddingNull]}
                                                    ref="pin1"
                                                    maxLength={1}
                                                    keyboardType={"number-pad"}
                                                    // onKeyPress={this.onKeyPress}
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key == "Backspace") {
                                                            this.manageNextField(1, '')
                                                        }
                                                        else { this.manageNextField(1, e.nativeEvent.key) }
                                                    }}
                                                    onChangeText={(e) => {
                                                        if (Platform.OS != 'ios') {
                                                            this.manageNextField(1, e)
                                                        }
                                                        else if (e.length == 4) {
                                                            this.manageAllInputs(e)
                                                        }
                                                    }} />
                                            </View>
                                            <View style={styles.pinBox} >
                                                <TextInput style={[styles.input, styles.textCenter, styles.paddingNull]}
                                                    ref="pin2"
                                                    keyboardType={"number-pad"}
                                                    maxLength={1}
                                                    // onKeyPress={this.onKeyPress}
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key == "Backspace") {
                                                            this.manageNextField(2, '')
                                                        }
                                                        else { this.manageNextField(2, e.nativeEvent.key) }
                                                    }}
                                                    onChangeText={(e) => {
                                                        if (Platform.OS != 'ios') {
                                                            this.manageNextField(2, e)
                                                        }
                                                        else if (e.length == 4) {
                                                            this.manageAllInputs(e)
                                                        }
                                                    }} />
                                            </View>
                                            <View style={styles.pinBox} >
                                                <TextInput style={[styles.input, styles.textCenter, styles.paddingNull]}
                                                    ref="pin3"
                                                    keyboardType={"number-pad"}
                                                    maxLength={1}
                                                    // onKeyPress={this.onKeyPress}
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key == "Backspace") {
                                                            this.manageNextField(3, '')
                                                        }
                                                        else {
                                                            this.manageNextField(3, e.nativeEvent.key)
                                                        }
                                                    }}
                                                    onChangeText={(e) => {
                                                        if (Platform.OS != 'ios') {
                                                            this.manageNextField(3, e)
                                                        }
                                                        else if (e.length == 4) {
                                                            this.manageAllInputs(e)
                                                        }
                                                    }} />
                                            </View>
                                            <View style={styles.pinBox} >
                                                <TextInput style={[styles.input, styles.textCenter, styles.paddingNull]}
                                                    ref="pin4"
                                                    keyboardType={"number-pad"}
                                                    maxLength={1}
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key == "Backspace") {
                                                            this.manageNextField(4, '')
                                                        }
                                                        else { this.manageNextField(4, e.nativeEvent.key) }
                                                    }}
                                                    onChangeText={(e) => {
                                                        if (Platform.OS != 'ios') {
                                                            this.manageNextField(4, e)
                                                        }
                                                        else if (e.length == 4) {
                                                            this.manageAllInputs(e)
                                                        }
                                                    }} />
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.pinRow}>
                                    </View>
                                </View>
                                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => this.btnSubmit()}>
                                    {this.state.isLoading ?
                                        <Spinner color={'#FFFFFF'} size={'small'} /> :
                                        <Text style={styles.buttonText}>{'Access Portal'.toUpperCase()}</Text>}
                                </TouchableOpacity>
                                <View style={styles.formFooter}>
                                    <TouchableOpacity onPress={() => this.callForgotPin()}>
                                        <Text style={[styles.label, styles.textCenter]}>FORGOT YOUR PIN?</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.nextButton} onPress={() => this.btnGoBack()}>
                                        <Image source={Images.circleArrowLeft} style={styles.circleArrow} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </ImageBackground>
            </KeyboardAvoidingView>
        )
    }
    //#endregion
}
