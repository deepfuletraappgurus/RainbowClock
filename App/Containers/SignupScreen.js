import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from '../Components/Spinner';
import React from 'react';
import { Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import BaseComponent from '../Components/BaseComponent';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import { Images, Colors } from '../Themes';
// Styles
import styles from './Styles/SignupScreenStyles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

// Global Variables
const objAPI = Api.create();

export default class SignupScreen extends BaseComponent {

    //constructor event
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            email: '',
            password: '',
            confirmPass: '',
            isLoading: false,
        }
    }

    //#region -> Class Methods
    btnSubmit = () => {
        Keyboard.dismiss();
        if (this.isValidate()) {
            this.callAPI_SignUp()
        }
    }

    isValidate = () => {
        if (this.state.username.trim() == '') {
            Helper.showErrorMessage(Constants.MESSAGE_NO_USERNAME);
            return false;
        }
        else if (this.state.username.length < 7) {
            Helper.showErrorMessage(Constants.MESSAGE_USERNAME_LENGTH);
            return false;
        }
        else if (!Helper.validateUsername(this.state.username.trim())) {
            Helper.showErrorMessage(Constants.MESSAGE_VALID_USERNAME);
            return false;
        }
        else if (this.state.email.trim() == '') {
            Helper.showErrorMessage(Constants.MESSAGE_NO_EMAIL);
            return false;
        }
        else if (!Helper.validateEmail(this.state.email.trim())) {
            Helper.showErrorMessage(Constants.MESSAGE_VALID_EMAIL);
            return false;
        }
        else if (this.state.password == '') {
            Helper.showErrorMessage(Constants.MESSAGE_NO_PASSWORD);
            return false;
        }
        else if (this.state.password.length < 8) {
            Helper.showErrorMessage(Constants.MESSAGE_PASSWORD_LENGTH);
            return false;
        }
        else if(!Helper.validatePassword(this.state.password.trim())){  //MP
            Helper.showErrorMessage(Constants.MESSAGE_PASSWORD_ERROR);
            return false;
        } //MP
        else if (this.state.confirmPass == '') {
            Helper.showErrorMessage(Constants.MESSAGE_NO_CONFIRMPASSWORD);
            return false;
        }
        else if (this.state.password != this.state.confirmPass) {
            Helper.showErrorMessage(Constants.MESSAGE_NOTMATCH_CONFIRMPASSWORD);
            return false;
        }
        return true;
    }
    //#endregion

    //#region -> API Calls
    callAPI_SignUp = async () => {
        this.setState({ isLoading: true })
        const res = objAPI.doSignUp(this.state.username, this.state.email, this.state.password, '',
            Platform.OS.toUpperCase(), '').then((resJSON) => {
                console.log('✅✅✅', resJSON)
                if (resJSON.ok && resJSON.status == 200) {
                    this.setState({ isLoading: false })
                    if (resJSON.data.success) {
                        Helper.storeItem(Constants.KEY_USER, JSON.stringify(resJSON.data.data))
                        try {
                            AsyncStorage.setItem(Constants.KEY_USER_NAME, resJSON.data.data.username)
                            AsyncStorage.setItem(Constants.KEY_USER_TOKEN, resJSON.data.data.token + "")

                            //FOR SHOW TIPS
                            AsyncStorage.setItem(Constants.HOME_TIPS, JSON.stringify(true))
                            AsyncStorage.setItem(Constants.PARENT_HOME_TIPS, JSON.stringify(true))
                            AsyncStorage.setItem(Constants.TASK_TIPS, JSON.stringify(true))


                        } catch (error) {
                            console.log('AsyncStorage Error: ', error)
                        }
                        this.props.navigation.navigate('PinScreen')
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
            
                <View style={styles.mainContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'} >
                   
                    {/* <KeyboardAvoidingView style={styles.mainContainer} behavior={Helper.isIPhoneX() ? "padding" : null}> */}
                        <ImageBackground source={Images.background} style={{ width: '100%', height: '100%' }}>
                        <KeyboardAwareScrollView>
                            <SafeAreaView style={styles.SafeAreaView}>
                                <ScrollView contentContainerStyle={styles.ScrollView} keyboardShouldPersistTaps='always'>
                                    <View style={styles.container}>
                                        <Image source={Images.logo} style={styles.logo} />
                                        <View style={styles.form}>
                                            <View style={styles.formControl}>
                                                <Image source={Images.user} style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.input}
                                                    autoCapitalize='characters'
                                                    placeholder={'Username'.toUpperCase()}
                                                    underlineColorAndroid={'transparent'}
                                                    placeholderTextColor={Colors.placeHolderText}
                                                    returnKeyType={'next'}
                                                    onChangeText={(username) => this.setState({ username })}
                                                    onSubmitEditing={(event) => { this.refs.email.focus(); }}
                                                />
                                            </View>
                                            <View style={styles.formControl}>
                                                <Image source={Images.inbox} style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.input}
                                                    autoCapitalize='characters'
                                                    placeholder={'Email'.toUpperCase()}
                                                    keyboardType={'email-address'}
                                                    ref='email'
                                                    underlineColorAndroid={'transparent'}
                                                    placeholderTextColor={Colors.placeHolderText}
                                                    returnKeyType={'next'}
                                                    onChangeText={(email) => this.setState({ email })}
                                                    onSubmitEditing={(event) => { this.refs.password.focus(); }}
                                                />
                                            </View>
                                            <View style={styles.formControl}>
                                                <Image source={Images.lock} style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder={'Password'.toUpperCase()}
                                                    ref='password'
                                                    underlineColorAndroid={'transparent'}
                                                    placeholderTextColor={Colors.placeHolderText}
                                                    secureTextEntry={true}
                                                    returnKeyType={'next'}
                                                    onChangeText={(password) => this.setState({ password })}
                                                    onSubmitEditing={(event) => { this.refs.confirmPass.focus(); }}
                                                />
                                            </View>
                                            <View style={styles.formControl}>
                                                <Image source={Images.lock} style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder={'Confirm Password'.toUpperCase()}
                                                    ref='confirmPass'
                                                    underlineColorAndroid={'transparent'}
                                                    placeholderTextColor={Colors.placeHolderText}
                                                    secureTextEntry={true}
                                                    returnKeyType={'done'}
                                                    onChangeText={(confirmPass) => this.setState({ confirmPass })}
                                                    onSubmitEditing={(event) => { Keyboard.dismiss() }}
                                                />
                                            </View>
                                            <View style={styles.formFooter}>
                                                {this.state.isLoading ?
                                                    <Spinner color={'#FFFFFF'} size={'small'} />
                                                    : <TouchableOpacity style={styles.nextButton} onPress={() => this.btnSubmit()}>
                                                        <Image source={Images.circleArrow} style={styles.circleArrow} />
                                                    </TouchableOpacity>}
                                            </View>
                                        </View>
                                    </View>
                                </ScrollView>
                            </SafeAreaView>
                            </KeyboardAwareScrollView>
                        </ImageBackground>
                    {/* </KeyboardAvoidingView> */}
                    
                </View>
            // </KeyboardAwareScrollView>
        )
    }
    //#endregion
}
