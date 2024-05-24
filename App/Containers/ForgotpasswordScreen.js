import Spinner from '../Components/Spinner';
import React, {Component} from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import {Images, Colors} from '../Themes';
// Styles
import styles from './Styles/LaunchScreenStyles';
import BaseComponent from '../Components/BaseComponent';
import DeviceInfo from 'react-native-device-info';
import { getFcmToken } from '../Lib/firebaseService';

// Global Variables
const objAPI = Api.create();

export default class ForgotpasswordScreen extends BaseComponent {
  //constructor event
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      isLoading: false,
    };
  }

  //#region -> Class Methods
  btnSubmit = () => {
    Keyboard.dismiss();
    if (this.isValidate()) {
      this.callAPI_ForgotPassword();
    }
  };

  btnGoBack = () => {
    this.props.navigation.goBack();
  };

  isValidate = () => {
    if (this.state.username.trim() == '') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_USERNAME);
      return false;
    } else if (this.state.username.length < 7) {
      Helper.showErrorMessage(Constants.MESSAGE_USERNAME_LENGTH);
      return false;
    }
    return true;
  };
  //#endregion

  //#endregion -> API Calls
  callAPI_ForgotPassword = async () => {
    const fcm_token = await getFcmToken()
    try {
      this.setState({isLoading: true});
      
      const deviceId = await DeviceInfo.getUniqueId();
      const deviceVersion = DeviceInfo.getVersion();
      const osVersion = DeviceInfo.getSystemVersion();
      const mobileName = DeviceInfo.getBrand() + ' ' + DeviceInfo.getModel();
      
      const resJSON = await objAPI.doForgotPassword(
        this.state.username,
        Platform.OS.toUpperCase(), // Device Type
        deviceId, // Device Id
        fcm_token ?? '', // Device Token
        deviceVersion, // Version code
        osVersion, // OS version
        mobileName, // Mobile Name
      );
  
      if (resJSON.ok && resJSON.status === 200) {
        this.setState({isLoading: false});
        const action = await Helper.showConfirmationMessagesignleAction(
          resJSON.data.message,
          'Ok',
        );
        if (action) {
          this.btnGoBack();
        }
      } else if (resJSON.status === 500) {
        this.setState({isLoading: false});
        Helper.showErrorMessage(resJSON.data.message);
      } else {
        this.setState({isLoading: false});
        Helper.showErrorMessage(Constants.SERVER_ERROR);
      }
    } catch (error) {
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
        <ImageBackground
          source={Images.background}
          style={{width: '100%', height: '100%'}}>
          <SafeAreaView style={styles.SafeAreaView}>
            <KeyboardAvoidingView
              style={styles.mainContainer}
              behavior={Helper.isIPhoneX() ? 'padding' : null}>
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
                        placeholder={'Username'.toUpperCase()}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={Colors.placeHolderText}
                        returnKeyType={'next'}
                        onChangeText={username => this.setState({username})}
                      />
                    </View>
                    <View style={styles.formFooter}>
                      {this.state.isLoading ? (
                        <Spinner color={'#FFFFFF'} size={'small'} />
                      ) : (
                        <TouchableOpacity
                          style={styles.button}
                          onPress={() => this.btnSubmit()}>
                          <Text style={styles.buttonText}>{'SUBMIT'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.formFooter}>
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={() => this.btnGoBack()}>
                    <Image
                      source={Images.circleArrowBack}
                      style={styles.circleArrow}
                    />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }
  //#endregion
}
