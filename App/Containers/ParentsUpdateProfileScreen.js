import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from '../Components/Spinner';
import React, { Component } from 'react';
import { Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import { Colors, Images, Metrics } from '../Themes';
// Styles
import styles from './Styles/LaunchScreenStyles';
import BaseComponent from '../Components/BaseComponent';
import { NavigationActions, StackActions } from 'react-navigation';



// Global Variables
const objSecureAPI = Api.createSecure();
var txtInputType = 'pin'

export default class ParentsUpdateProfileScreen extends BaseComponent {

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
      username: '',
      email: '',
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

  //#region -> Component Methods
  componentDidMount() {
    super.componentDidMount()
    this.getParentsDetails()
  }

  getParentsDetails = () => {
    Helper.retrieveItem(Constants.KEY_USER).then((userData) => {
      var parseObject = JSON.parse(userData);
      this.setState({
        username: parseObject.username,
        email: parseObject.email
      });
    }).catch((error) => {
    });
  }
  //#endregion

  //#region -> Class Methods
  moveToParentsUpdateProfile = () => {
    //this.props.navigation.navigate('SignupScreen')
  }

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

  btnUpdateProfile = () => {
    Keyboard.dismiss();
    if (this.isValidate()) {
      this.callUpdareParentProfile()
    }
  }
  btnDeleteProfile=()=>{
    Keyboard.dismiss();
    this.callDeleteProfile()
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
      Helper.showErrorMessage(Constants.MESSAGE_VALID_EMAIL);
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

    var strPin = this.state.pin1 + this.state.pin2 + this.state.pin3 + this.state.pin4
    var strConfirmPin = this.state.cpin1 + this.state.cpin2 + this.state.cpin3 + this.state.cpin4
    
    if (strPin != '' || strConfirmPin != '') {
      if (strPin.length < 4 && strConfirmPin < 4) {
        Helper.showErrorMessage(Constants.MESSAGE_PIN_LENGTH);
        return false
      }
      else if (strPin != strConfirmPin) {
        Helper.showErrorMessage(Constants.MESSAGE_NOTMATCH_CONFIRMPIN);
        return false
      }
    }
    return true;
  }
  //#endregion 
callDeleteProfile =async()=>{
  const res = objSecureAPI.deleteProfile().then((resJSON) => {
    if (resJSON.ok && resJSON.status == 200) {
      if (resJSON.data.success) {
        this.setState({ isLoading: false })
        try {
          Helper.showErrorMessage(resJSON.data.message);
          AsyncStorage.clear(() => {
            const navigateAction = StackActions.reset({
              actions: [
                NavigationActions.navigate({ routeName: 'loginStack' })
              ],
              index: 0,
              key: null
            });
            this.props.navigation.dispatch(navigateAction);
          })
          
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
  //#region -> API Calls
  callUpdareParentProfile = async () => {
    this.setState({ isLoading: true })
    var strPin = this.state.pin1 + this.state.pin2 + this.state.pin3 + this.state.pin4;
    const res = objSecureAPI.doUpdateParentProfile(this.state.username, this.state.email, strPin, '',
      Platform.OS.toUpperCase(), '').then((resJSON) => {
        if (resJSON.ok && resJSON.status == 200) {
          if (resJSON.data.success) {
            this.setState({ isLoading: false })
            Helper.storeItem(Constants.KEY_USER, JSON.stringify(resJSON.data.data))
            try {
              AsyncStorage.setItem(Constants.KEY_USER_NAME, resJSON.data.data.username)
              AsyncStorage.setItem(Constants.KEY_USER_TOKEN, resJSON.data.data.token + "")
              Helper.showErrorMessage(resJSON.data.message);
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
  //#endregion

  //#region -> View Render
  render() {
    return (
      <View style={styles.mainContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        <ImageBackground source={Images.blueBackground} style={styles.backgroundImage}>
          <KeyboardAvoidingView style={styles.mainContainer} behavior={"padding"} keyboardVerticalOffset={Platform.OS === 'android' ? -200 : 0}>
            <SafeAreaView style={styles.SafeAreaView}>
              <ScrollView contentContainerStyle={styles.ScrollView}>
                <View style={[styles.container, styles.center]}>
                  <View style={styles.form}>
                    <View style={styles.formControl}>
                      <Image source={Images.user} style={styles.inputIcon} />
                      <TextInput
                        value={this.state.username.toUpperCase()}
                        autoCapitalize='characters'
                        style={styles.input}
                        placeholder={'Username'.toUpperCase()}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={'#fff'}
                        returnKeyType={'next'}
                        onChangeText={(username) => this.setState({ username })}
                        onSubmitEditing={(event) => { this.refs.email.focus(); }}
                      />
                    </View>
                    <View style={styles.formControl}>
                      <Image source={Images.inbox} style={styles.inputIcon} />
                      <TextInput
                        value={this.state.email.toUpperCase()}
                        style={styles.input}
                        autoCapitalize='characters'
                        ref='email'
                        placeholder={'Email'.toUpperCase()}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={'#fff'}
                        keyboardType={'email-address'}
                        onChangeText={(email) => this.setState({ email })}
                        onSubmitEditing={(event) => { Keyboard.dismiss(); }}
                      />
                    </View>
                    <View style={styles.pinForm}>
                      <View style={styles.pinRow}>
                        <Text style={[styles.label]}>
                          {'CHANGE PIN'}
                        </Text>
                        <View style={styles.pinFrm} >
                          <View style={styles.pinBox}>
                            <TextInput style={styles.input}
                              ref="pin1"
                              textAlign={'center'}
                              maxLength={1}
                              keyboardType={"number-pad"}
                              // onKeyPress={this.onKeyPress}
                              onKeyPress={(e) => {
                                if (e.nativeEvent.key == "Backspace") {
                                  this.manageNextField(1, '', txtInputType)
                                }
                                else { this.manageNextField(1, e.nativeEvent.key, txtInputType) }
                              }}
                              onChangeText={(e) => {
                                if (Platform.OS != 'ios') {
                                  this.manageNextField(1, e,txtInputType)
                                }
                                else if (e.length == 4) {
                                  this.manageAllInputs(e, txtInputType)
                                }
                              }} />
                          </View>
                          <View style={styles.pinBox} >
                            <TextInput style={styles.input}
                              ref="pin2"
                              textAlign={'center'}
                              keyboardType={"number-pad"}
                              maxLength={1}
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
                            <TextInput style={styles.input}
                              ref="pin3"
                              textAlign={'center'}
                              keyboardType={"number-pad"}
                              maxLength={1}
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
                            <TextInput style={styles.input}
                              ref="pin4"
                              textAlign={'center'}
                              keyboardType={"number-pad"}
                              maxLength={1}
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
                        <Text style={[styles.label]}>
                          {'CONFIRM PIN'.toUpperCase()}
                        </Text>
                        <View style={styles.pinFrm}>
                          <View style={styles.pinBox}>
                            <TextInput style={styles.input}
                              ref="cpin1"
                              textAlign={'center'}
                              maxLength={1}
                              keyboardType={"number-pad"}
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
                            <TextInput style={styles.input}
                              ref="cpin2"
                              textAlign={'center'}
                              keyboardType={"number-pad"}
                              maxLength={1}
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
                            <TextInput style={styles.input}
                              ref="cpin3"
                              textAlign={'center'}
                              keyboardType={"number-pad"}
                              maxLength={1}
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
                            <TextInput style={styles.input}
                              ref="cpin4"
                              textAlign={'center'}
                              keyboardType={"number-pad"}
                              maxLength={1}
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
                        <Spinner color={'#FFFFFF'} size={'small'} />
                        : <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => this.btnUpdateProfile()}>
                          <Text style={styles.buttonText}>{'UPDATE PROFILE'}</Text>
                        </TouchableOpacity>}
                        <TouchableOpacity style={[styles.button, styles.buttonPrimary]}
                  onPress={() => this.btnDeleteProfile()}>
                  <Text style={styles.buttonText}>{'DELETE ACCOUNT'}</Text>
                </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </View>
    )
  }
  //#endregion
}
