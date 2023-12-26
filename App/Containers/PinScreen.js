import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from '../Components/Spinner';
import React from 'react';
import { Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import BaseComponent from '../Components/BaseComponent';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import { Images } from '../Themes';
// Styles
import styles from './Styles/PinScreenStyles';

// Global Variables
const objSecureAPI = Api.createSecure();
var txtInputType = 'pin'

export default class PinScreen extends BaseComponent {

    //constructor event
    constructor(props) {
        super(props)
        this.state = {
            pin1: '',
            pin2: '',
            pin3: '',
            pin4: '',
            cpin1: '',
            cpin2: '',
            cpin3: '',
            cpin4: '',
            isLoading: false,
        }
    }

    //#region -> Component LifeCycle Events
    componentDidMount() {
        this.refs.pin1.focus();
    }
    //#endregion

    //#region -> Class Methods
    manageNextField(position, text, type) {
        var sholdMoveForword = (text != '')
        switch (position) {
            case 1:
                type == txtInputType ? this.state.pin1 = text : this.state.cpin1 = text
                this.setState(type == txtInputType ? { pin1: text } : { cpin1: text })
                if (sholdMoveForword) {
                    type == txtInputType ? this.refs.pin2.focus() : this.refs.cpin2.focus()
                }
                break;
            case 2:
                type == txtInputType ? this.state.pin2 = text : this.state.cpin2 = text
                this.setState(type == txtInputType ? { pin2: text } : { cpin2: text })
                if (sholdMoveForword) {
                    type == txtInputType ? this.refs.pin3.focus() : this.refs.cpin3.focus()
                }
                else {
                    type == txtInputType ? this.refs.pin1.focus() : this.refs.cpin1.focus()
                }
                break;
            case 3:
                type == txtInputType ? this.state.pin3 = text : this.state.cpin3 = text
                this.setState(type == txtInputType ? { pin3: text } : { cpin3: text })
                if (sholdMoveForword) {
                    type == txtInputType ? this.refs.pin4.focus() : this.refs.cpin4.focus()
                }
                else {
                    type == txtInputType ? this.refs.pin2.focus() : this.refs.cpin2.focus()
                }
                break;
            case 4:
                if (sholdMoveForword && type == txtInputType) {
                    this.refs.cpin1.focus()
                }
                else if (type == txtInputType && !sholdMoveForword) {
                    this.refs.pin3.focus();
                }
                else if (type != txtInputType && !sholdMoveForword) {
                    this.refs.cpin3.focus()
                }
                else if (type != txtInputType && sholdMoveForword) {
                    Keyboard.dismiss();
                }

                this.setState(type == txtInputType ? { pin4: text } : { cpin4: text })
                break;
        }
    }

    manageAllInputs(text, type) {
        if (parseInt(text)) {
            this.setState(
                type = txtInputType ? { pin1: text[0] ? text[0] : '' } : { cpin: text[0] ? text[0] : '' },
                type = txtInputType ? { pin2: text[1] ? text[1] : '' } : { cpin: text[1] ? text[1] : '' },
                type = txtInputType ? { pin3: text[2] ? text[2] : '' } : { cpin: text[2] ? text[2] : '' },
                type = txtInputType ? { pin4: text[3] ? text[3] : '' } : { cpin: text[3] ? text[3] : '' },
            )
        }
    }

    btnSubmit = () => {
        Keyboard.dismiss();
        if (this.isValidate()) {
            this.callAPI_SetPIN()
        }
    }

    isValidate = () => {
        var strPin = this.state.pin1 + this.state.pin2 + this.state.pin3 + this.state.pin4
        var strConfirmPin = this.state.cpin1 + this.state.cpin2 + this.state.cpin3 + this.state.cpin4
        if (strPin.length < 4 && strConfirmPin < 4) {
            Helper.showErrorMessage(Constants.MESSAGE_PIN_LENGTH);
            return false
        }
        else if (strPin != strConfirmPin) {
            Helper.showErrorMessage(Constants.MESSAGE_NOTMATCH_CONFIRMPIN);
            return false
        }
        return true
    }
    //#endregion

    //#region -> API Calls
    callAPI_SetPIN = async () => {
        this.setState({ isLoading: true })
        var strPin = this.state.pin1 + this.state.pin2 + this.state.pin3 + this.state.pin4
        const res = objSecureAPI.doSetPin(strPin).then((resJSON) => {
            console.log('resJSON ✅✅✅', resJSON)
            if (resJSON.ok && resJSON.status == 200) {
                this.setState({ isLoading: false })
                if (resJSON.data.success) {
                    try {
                        AsyncStorage.setItem(Constants.KEY_USER_PIN, strPin)
                        AsyncStorage.setItem(Constants.KEY_IS_LOGIN, '1')
                        const resetAction = StackActions.reset({
                            index: 0,
                            key: null,
                            actions: [
                                NavigationActions.navigate({ routeName: 'getStartedStack' })
                            ]
                        })
                        this.props.navigation.dispatch(resetAction)
                    } catch (error) {
                        console.log('AsyncStorage Error: ', error)
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
    //#endregion

    //#region -> View Render
    render() {
        return (
            <KeyboardAvoidingView style={styles.mainContainer} behavior={Helper.isIPhoneX() ? "padding" : null}>
                <ImageBackground source={Images.background} style={{ width: '100%', height: '100%' }}>
                    <ScrollView contentContainerStyle={styles.ScrollView} keyboardShouldPersistTaps='always'>
                        <View style={styles.container}>
                            <Image source={Images.logo} style={styles.logo} />
                            <View style={styles.form}>
                                <Text style={[styles.title, styles.textCenter]}>
                                    CREATE A SPECIAL PIN {'\n'} FOR THE ADMIN PORTAL
                                </Text>
                                <View style={styles.pinForm}>
                                    <View style={styles.pinRow}>
                                        <Text style={[styles.label, styles.textCenter]}>
                                            {'Enter a Pin'.toUpperCase()}
                                        </Text>
                                        <View style={styles.pinFrm} >
                                            <View style={styles.pinBox}>
                                                <TextInput style={[styles.input, styles.textCenter, styles.paddingNull]}
                                                    ref="pin1"
                                                    textAlign={'center'}
                                                    maxLength={1}
                                                    keyboardType={"numeric"}
                                                    underlineColorAndroid={'transparent'}
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key == "Backspace") {
                                                            this.manageNextField(1, '', txtInputType)
                                                        }
                                                        else { this.manageNextField(1, e.nativeEvent.key, txtInputType) }
                                                    }}
                                                    onChangeText={(e) => {
                                                        if (Platform.OS != 'ios') {
                                                            this.manageNextField(1, e, txtInputType)
                                                        }
                                                        else if (e.length == 4) {
                                                            this.manageAllInputs(e, txtInputType)
                                                        }
                                                    }}
                                                />
                                            </View>
                                            <View style={styles.pinBox} >
                                                <TextInput style={[styles.input, styles.textCenter, styles.paddingNull]}
                                                    ref="pin2"
                                                    textAlign={'center'}
                                                    keyboardType={"numeric"}
                                                    maxLength={1}
                                                    underlineColorAndroid={'transparent'}
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key == "Backspace") {
                                                            this.manageNextField(2, '', txtInputType)
                                                        }
                                                        else { this.manageNextField(2, e.nativeEvent.key, txtInputType) }
                                                    }}
                                                    onChangeText={(e) => {
                                                        if (Platform.OS != 'ios') {
                                                            this.manageNextField(2, e, txtInputType)
                                                        }
                                                        else if (e.length == 4) {
                                                            this.manageAllInputs(e, txtInputType)
                                                        }
                                                    }} />
                                            </View>
                                            <View style={styles.pinBox} >
                                                <TextInput style={[styles.input, styles.textCenter, styles.paddingNull]}
                                                    ref="pin3"
                                                    textAlign={'center'}
                                                    keyboardType={"numeric"}
                                                    maxLength={1}
                                                    underlineColorAndroid={'transparent'}
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key == "Backspace") {
                                                            this.manageNextField(3, '', txtInputType)
                                                        }
                                                        else {
                                                            this.manageNextField(3, e.nativeEvent.key, txtInputType)
                                                        }
                                                    }}
                                                    onChangeText={(e) => {
                                                        if (Platform.OS != 'ios') {
                                                            this.manageNextField(3, e, txtInputType)
                                                        }
                                                        else if (e.length == 4) {
                                                            this.manageAllInputs(e, txtInputType)
                                                        }
                                                    }} />
                                            </View>
                                            <View style={styles.pinBox} >
                                                <TextInput style={[styles.input, styles.textCenter, styles.paddingNull]}
                                                    ref="pin4"
                                                    textAlign={'center'}
                                                    keyboardType={"numeric"}
                                                    maxLength={1}
                                                    underlineColorAndroid={'transparent'}
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key == "Backspace") {
                                                            this.manageNextField(4, '', txtInputType)
                                                        }
                                                        else { this.manageNextField(4, e.nativeEvent.key, txtInputType) }
                                                    }}
                                                    onChangeText={(e) => {
                                                        if (Platform.OS != 'ios') {
                                                            this.manageNextField(4, e, txtInputType)
                                                        }
                                                        else if (e.length == 4) {
                                                            this.manageAllInputs(e, txtInputType)
                                                        }
                                                    }} />
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.pinRow}>
                                        <Text style={[styles.label, styles.textCenter]}>
                                            {'CONFIRM PIN'.toUpperCase()}
                                        </Text>
                                        <View style={styles.pinFrm}>
                                            <View style={styles.pinBox}>
                                                <TextInput style={[styles.input, styles.textCenter, styles.paddingNull]}
                                                    ref="cpin1"
                                                    textAlign={'center'}
                                                    maxLength={1}
                                                    keyboardType={"numeric"}
                                                    underlineColorAndroid={'transparent'}
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key == "Backspace") {
                                                            this.manageNextField(1, '', '')
                                                        }
                                                        else { this.manageNextField(1, e.nativeEvent.key, '') }
                                                    }}
                                                    onChangeText={(e) => {
                                                        if (Platform.OS != 'ios') {
                                                            this.manageNextField(1, e, '')
                                                        }
                                                        else if (e.length == 4) {
                                                            this.manageAllInputs(e, '')
                                                        }
                                                    }} />
                                            </View>
                                            <View style={styles.pinBox}>
                                                <TextInput style={[styles.input, styles.textCenter, styles.paddingNull]}
                                                    ref="cpin2"
                                                    textAlign={'center'}
                                                    keyboardType={"numeric"}
                                                    maxLength={1}
                                                    underlineColorAndroid={'transparent'}
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key == "Backspace") {
                                                            this.manageNextField(2, '', '')
                                                        }
                                                        else { this.manageNextField(2, e.nativeEvent.key, '') }
                                                    }}
                                                    onChangeText={(e) => {
                                                        if (Platform.OS != 'ios') {
                                                            this.manageNextField(2, e, '')
                                                        }
                                                        else if (e.length == 4) {
                                                            this.manageAllInputs(e, '')
                                                        }
                                                    }} />
                                            </View>
                                            <View style={styles.pinBox}>
                                                <TextInput style={[styles.input, styles.textCenter, styles.paddingNull]}
                                                    ref="cpin3"
                                                    textAlign={'center'}
                                                    keyboardType={"numeric"}
                                                    maxLength={1}
                                                    underlineColorAndroid={'transparent'}
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key == "Backspace") {
                                                            this.manageNextField(3, '', '')
                                                        }
                                                        else {
                                                            this.manageNextField(3, e.nativeEvent.key, '')
                                                        }
                                                    }}
                                                    onChangeText={(e) => {
                                                        if (Platform.OS != 'ios') {
                                                            this.manageNextField(3, e, '')
                                                        }
                                                        else if (e.length == 4) {
                                                            this.manageAllInputs(e, '')
                                                        }
                                                    }} />
                                            </View>
                                            <View style={styles.pinBox}>
                                                <TextInput style={[styles.input, styles.textCenter, styles.paddingNull]}
                                                    ref="cpin4"
                                                    textAlign={'center'}
                                                    keyboardType={"numeric"}
                                                    maxLength={1}
                                                    underlineColorAndroid={'transparent'}
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key == "Backspace") {
                                                            this.manageNextField(4, '', '')
                                                        }
                                                        else { this.manageNextField(4, e.nativeEvent.key, '') }
                                                    }}
                                                    onChangeText={(e) => {
                                                        if (Platform.OS != 'ios') {
                                                            this.manageNextField(4, e, '')
                                                        }
                                                        else if (e.length == 4) {
                                                            this.manageAllInputs(e, '')
                                                        }
                                                    }} />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.formFooter}>
                                    {this.state.isLoading ?
                                        <Spinner color={'#FFFFFF'} size={'small'} /> :
                                        <TouchableOpacity style={styles.nextButton} onPress={() => this.btnSubmit()}>
                                            <Image source={Images.circleArrow} style={styles.circleArrow} />
                                        </TouchableOpacity>}
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
