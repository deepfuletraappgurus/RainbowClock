import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from '../Components/Spinner';
import React from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BaseComponent from '../Components/BaseComponent';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import {Images, Colors} from '../Themes';
// Styles
import styles from './Styles/SignupScreenStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import DeviceInfo from 'react-native-device-info';
import { getFcmToken } from '../Lib/firebaseService';


// Global Variables
const objAPI = Api.create();

export default class SignupScreen extends BaseComponent {
  //constructor event
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      confirmPass: '',
      isLoading: false,
      isPasswordSecure: true,
      isConfirmPasswordSecure: true
    };
  }

  //#region -> Class Methods
  btnSubmit = () => {
    Keyboard.dismiss();
    if (this.isValidate()) {
      this.callAPI_SignUp();
    }
  };

  isValidate = () => {
    if (this.state.username.trim() == '') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_USERNAME);
      return false;
    } else if (this.state.username.length < 7) {
      Helper.showErrorMessage(Constants.MESSAGE_USERNAME_LENGTH);
      return false;
    } else if (!Helper.validateUsername(this.state.username.trim())) {
      Helper.showErrorMessage(Constants.MESSAGE_VALID_USERNAME);
      return false;
    } else if (this.state.email.trim() == '') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_EMAIL);
      return false;
    } else if (!Helper.validateEmail(this.state.email.trim())) {
      Helper.showErrorMessage(Constants.MESSAGE_VALID_EMAIL);
      return false;
    } else if (this.state.password == '') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_PASSWORD);
      return false;
    } else if (this.state.password.length < 8) {
      Helper.showErrorMessage(Constants.MESSAGE_PASSWORD_LENGTH);
      return false;
    } else if (!Helper.validatePassword(this.state.password.trim())) {
      //MP
      Helper.showErrorMessage(Constants.MESSAGE_PASSWORD_ERROR);
      return false;
    } //MP
    else if (this.state.confirmPass == '') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_CONFIRMPASSWORD);
      return false;
    } else if (this.state.password != this.state.confirmPass) {
      Helper.showErrorMessage(Constants.MESSAGE_NOTMATCH_CONFIRMPASSWORD);
      return false;
    }
    return true;
  };
  //#endregion

  //#region -> API Calls
  callAPI_SignUp = async () => {
    const fcm_token = await getFcmToken()
    try {
        this.setState({isLoading: true});
        
        const uniqueId = await DeviceInfo.getUniqueId();
        const deviceType = Platform.OS.toUpperCase();
        const versionCode = DeviceInfo.getVersion();
        const osVersion = DeviceInfo.getSystemVersion();
        const mobileName = DeviceInfo.getBrand() + ' ' + DeviceInfo.getModel();

        const res = await objAPI.doSignUp(
            this.state.username,
            this.state.email,
            this.state.password,
            deviceType, // Device Type
            uniqueId, // Device Id
            fcm_token ?? '', // Device Token
            versionCode, // Version code
            osVersion, // OS version
            mobileName, // Mobile Name
        );

        if (res.ok && res.status === 200) {
            this.setState({isLoading: false});
            if (res.data.success) {
                Helper.storeItem(
                    Constants.KEY_USER,
                    JSON.stringify(res.data.data),
                );
                try {
                    await AsyncStorage.setItem(
                        Constants.KEY_USER_NAME,
                        res.data.data.username,
                    );
                    await AsyncStorage.setItem(
                        Constants.KEY_USER_TOKEN,
                        res.data.data.token + '',
                    );

                    //FOR SHOW TIPS
                    await AsyncStorage.setItem(Constants.HOME_TIPS, JSON.stringify(true));
                    await AsyncStorage.setItem(Constants.PARENT_HOME_TIPS, JSON.stringify(true));
                    await AsyncStorage.setItem(Constants.TASK_TIPS, JSON.stringify(true));
                } catch (error) {
                    // Handle the error if needed
                }
                this.props.navigation.navigate('PinScreen');
            } else {
                Helper.showErrorMessage(res.data.message);
            }
        } else if (res.status === 500) {
            this.setState({isLoading: false});
            Helper.showErrorMessage(res.data.message);
        } else {
            this.setState({isLoading: false});
            Helper.showErrorMessage(Constants.SERVER_ERROR);
        }
    } catch (error) {
      console.log('eee',error)
        this.setState({isLoading: false});
        Helper.showErrorMessage(Constants.SERVER_ERROR);
    }
};
  //#endregion

  //#region -> View Render
  render() {
    return (
      <View
        style={styles.mainContainer}
        pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        {/* <KeyboardAvoidingView style={styles.mainContainer} behavior={Helper.isIPhoneX() ? "padding" : null}> */}
        <ImageBackground
          source={Images.background}
          style={{width: '100%', height: '100%'}}>
          <KeyboardAwareScrollView>
            <SafeAreaView style={styles.SafeAreaView}>
              <ScrollView
                contentContainerStyle={styles.ScrollView}
                keyboardShouldPersistTaps="always">
                <View style={styles.container}>
                  <Image source={Images.logo} style={styles.logo} />
                  <View style={styles.form}>
                    <View style={styles.formControl}>
                      <Image source={Images.user} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        // autoCapitalize="characters"
                        placeholder={'Username'.toUpperCase()}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={Colors.placeHolderText}
                        returnKeyType={'next'}
                        onChangeText={username => this.setState({username})}
                        onSubmitEditing={event => {
                          this.refs.email.focus();
                        }}
                      />
                    </View>
                    <View style={styles.formControl}>
                      <Image source={Images.inbox} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        // autoCapitalize="characters"
                        placeholder={'Email'.toUpperCase()}
                        keyboardType={'email-address'}
                        ref="email"
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={Colors.placeHolderText}
                        returnKeyType={'next'}
                        onChangeText={email => this.setState({email})}
                        onSubmitEditing={event => {
                          this.refs.password.focus();
                        }}
                      />
                    </View>
                    <View style={styles.formControl}>
                      <Image source={Images.lock} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={'Password'.toUpperCase()}
                        ref="password"
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={Colors.placeHolderText}
                        secureTextEntry={this.state.isPasswordSecure ? true : false}
                        returnKeyType={'next'}
                        onChangeText={password => this.setState({password})}
                        onSubmitEditing={event => {
                          this.refs.confirmPass.focus();
                        }}
                      />
                       <TouchableOpacity>
                        <Icon
                          name={
                            this.state.isPasswordSecure ? 'eye' : 'eye-slash'
                          }
                          size={26}
                          color={'#fff'}
                          onPress={() =>
                            this.setState({
                              isPasswordSecure: !this.state.isPasswordSecure,
                            })
                          }
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.formControl}>
                      <Image source={Images.lock} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={'Confirm Password'.toUpperCase()}
                        ref="confirmPass"
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={Colors.placeHolderText}
                        secureTextEntry={this.state.isConfirmPasswordSecure ? true : false}
                        returnKeyType={'done'}
                        onChangeText={confirmPass =>
                          this.setState({confirmPass})
                        }
                        onSubmitEditing={event => {
                          Keyboard.dismiss();
                        }}
                      />
                      <TouchableOpacity>
                        <Icon
                          name={
                            this.state.isConfirmPasswordSecure ? 'eye' : 'eye-slash'
                          }
                          size={26}
                          color={'#fff'}
                          onPress={() =>
                            this.setState({
                              isConfirmPasswordSecure: !this.state.isConfirmPasswordSecure,
                            })
                          }
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.formFooter}>
                      {this.state.isLoading ? (
                        <Spinner color={'#FFFFFF'} size={'small'} />
                      ) : (
                        <TouchableOpacity
                          style={styles.nextButton}
                          onPress={() => this.btnSubmit()}>
                          <Image
                            source={Images.circleArrow}
                            style={styles.circleArrow}
                          />
                        </TouchableOpacity>
                      )}
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
    );
  }
  //#endregion
}
