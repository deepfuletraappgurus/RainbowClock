import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from '../Components/Spinner';
import React, {Component} from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NavigationActions, StackActions} from 'react-navigation';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import {Images, Colors} from '../Themes';
import Icon from 'react-native-vector-icons/FontAwesome';
import crashlytics from '@react-native-firebase/crashlytics';

// Styles
import styles from './Styles/LaunchScreenStyles';
import BaseComponent from '../Components/BaseComponent';
import {getFcmToken} from '../Lib/firebaseService';
import DeviceInfo from 'react-native-device-info';

// Global Variables
const objAPI = Api.create();

export default class LaunchScreen extends BaseComponent {
  //constructor event
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      isLoading: false,
      isPasswordSecure: true,
    };
  }

  //#region -> Class Methods
  btnSubmit = () => {
    // crashlytics().crash()
    Keyboard.dismiss();
    if (this.isValidate()) {
      this.callAPI_LogIn();
    }
  };

  moveToSignUp = () => {
    this.props.navigation.navigate('SignupScreen');
  };

  moveToForgotpassword = () => {
    this.props.navigation.navigate('ForgotpasswordScreen');
  };

  isValidate = () => {
    if (this.state.username.trim() == '') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_USERNAME);
      return false;
    } else if (this.state.username.length < 7) {
      Helper.showErrorMessage(Constants.MESSAGE_USERNAME_LENGTH);
      return false;
    } else if (!Helper.validateUsername(this.state.username.trim())) {
      Helper.showErrorMessage(Constants.MESSAGE_VALID_EMAIL);
      return false;
    } else if (this.state.password == '') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_PASSWORD);
      return false;
    } else if (this.state.password.length < 8) {
      Helper.showErrorMessage(Constants.MESSAGE_PASSWORD_LENGTH);
      return false;
    }
    return true;
  };
  //#endregion

  //#endregion -> API Calls
  callAPI_LogIn = async () => {
    try {
      this.setState({isLoading: true});

      const resJSON = await objAPI.doLogIn(
        this.state.username,
        this.state.password,
        Platform.OS.toUpperCase(), // Device Type
        await DeviceInfo.getUniqueId(), // Device Id
        '', // Device Token
        DeviceInfo.getVersion(), // Version code
        DeviceInfo.getSystemVersion(), // OS version
        DeviceInfo.getBrand() + ' ' + DeviceInfo.getModel(), // Mobile Name
      );

      console.log('eeee', resJSON);

      if (resJSON.ok && resJSON.status === 200) {
        this.setState({isLoading: false});

        if (resJSON.data.success) {
          try {
            await AsyncStorage.setItem(
              Constants.KEY_USER_IMAGE,
              resJSON.data.data.profile_pic,
            );
            Helper.storeItem(
              Constants.KEY_USER,
              JSON.stringify(resJSON.data.data),
            );
            await AsyncStorage.setItem(
              Constants.KEY_USER_NAME,
              resJSON.data.data.username,
            );
            await AsyncStorage.setItem(
              Constants.KEY_USER_TOKEN,
              resJSON.data.data.token + '',
            );

            if (resJSON.data.data.is_set) {
              await AsyncStorage.setItem(Constants.KEY_IS_LOGIN, '1');

              if (resJSON.data.data.child_cnt > 0) {
                await AsyncStorage.setItem(
                  Constants.KEY_USER_HAVE_CHILDREN,
                  '1',
                );
                const resetAction = StackActions.reset({
                  index: 0,
                  key: null,
                  actions: [
                    NavigationActions.navigate({routeName: 'drawerStack'}),
                  ],
                });
                this.props.navigation.dispatch(resetAction);
              } else {
                this.props.navigation.navigate('GetStartedScreen');
              }
            } else {
              this.props.navigation.navigate('PinScreen');
            }
          } catch (error) {
            console.error('Error storing data:', error);
          }
        } else {
          Helper.showErrorMessage(resJSON.data.message);
        }
      } else if (resJSON.status === 500) {
        this.setState({isLoading: false});
        Helper.showErrorMessage(resJSON.data.message);
      } else {
        this.setState({isLoading: false});
        Helper.showErrorMessage(Constants.SERVER_ERROR);
      }
    } catch (error) {
      console.error('API call error:', error);
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
                        // autoCapitalize="characters"
                        placeholder={'Username'.toUpperCase()}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={Colors.placeHolderText}
                        returnKeyType={'next'}
                        onChangeText={username => this.setState({username})}
                        onSubmitEditing={event => {
                          this.refs.pass.focus();
                        }}
                      />
                    </View>
                    <View style={styles.formControl}>
                      <Image source={Images.lock} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={'Password'.toUpperCase()}
                        underlineColorAndroid={'transparent'}
                        ref="pass"
                        placeholderTextColor={Colors.placeHolderText}
                        returnKeyType={'done'}
                        secureTextEntry={
                          this.state.isPasswordSecure ? true : false
                        }
                        onChangeText={password => this.setState({password})}
                        onSubmitEditing={event => {
                          Keyboard.dismiss();
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
                    <View style={styles.formFooter}>
                      {this.state.isLoading ? (
                        <Spinner color={'#FFFFFF'} size={'small'} />
                      ) : (
                        <TouchableOpacity
                          style={styles.button}
                          onPress={() => this.btnSubmit()}>
                          <Text style={styles.buttonText}>
                            {'Sign In'.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.link}
                        onPress={() => this.moveToForgotpassword()}>
                        <Text style={styles.linkText}>
                          {'FORGOT YOUR PASSWORD?'.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.linkButton}
                      onPress={() => this.moveToSignUp()}>
                      <Text style={styles.linkButtonText}>
                        DON’T HAVE AN ACCOUNT? {'\n'} SIGNUP NOW
                      </Text>
                    </TouchableOpacity>
                  </View>
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
