import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from '../Components/Spinner';
import React, {Component, useRef, useState} from 'react';
import {
  ActivityIndicator,
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
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import {Colors, Images, Metrics} from '../Themes';
// Styles
import styles from './Styles/LaunchScreenStyles';
import BaseComponent from '../Components/BaseComponent';
import {NavigationActions, StackActions} from 'react-navigation';
import colors from '../Themes/Colors';
import Icon from 'react-native-vector-icons/FontAwesome';

const objSecureAPI = Api.createSecure();

const ChangePasswordScreen = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isCurrentPasswordSequre, setIsCurrentPasswordSequre] = useState(true);
  const [isNewPasswordSequre, setIsNewPasswordSequre] = useState(true);
  const [isConfirmNewPasswordSequre, setIsConfirmNewPasswordSequre] =
    useState(true);
  const newPasswordRef = useRef(null);
  const confirmNewPasswordRef = useRef(null);

  const btnSaveChange = () => {
    if (isValidate()) {
      callUpdatePassword();
    }
  };

  const isValidate = () => {
    if (currentPassword.trim() == '') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_CURRENT_PASSWORD);
      return false;
    } else if (newPassword.trim() == '') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_NEW_PASSWORD);
      return false;
    } else if (newPassword.length < 8) {
      Helper.showErrorMessage(Constants.MESSAGE_PASSWORD_LENGTH);
      return false;
    } else if (!Helper.validatePassword(newPassword.trim())) {
      //MP
      Helper.showErrorMessage(Constants.MESSAGE_PASSWORD_ERROR);
      return false;
    } else if (confirmNewPassword.trim() == '') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_CONFIRM_NEW_PASSWORD);
      return false;
    } else if (newPassword !== confirmNewPassword) {
      Helper.showErrorMessage(Constants.MESSAGE_NOT_MATCH_PASSWORD);
      return false;
    } else {
      return true;
    }
  };

  const callUpdatePassword = async () => {
    setIsLoading(true);
    try {
      // Call the API and await the response
      const resJSON = await objSecureAPI.doUpdatePassword(
        currentPassword,
        newPassword,
        confirmNewPassword,
      );
      console.log('ressss', resJSON);

      // Check if the response is OK and status is 200
      if (resJSON.ok && resJSON.status === 200) {
        if (resJSON.data.success) {
          // Update state and handle successful response
          setIsLoading(false);
          Helper.showConfirmationMessageSingleAction(
            resJSON.data.message,
            'OK',
            onActionOK,
          );
        } else {
          // Show error message if the response is not successful
          setIsLoading(false);
          Helper.showErrorMessage(resJSON.data.message);
        }
      } else if (resJSON.status === 500) {
        // Handle server error
        setIsLoading(false);
        Helper.showErrorMessage(resJSON.data.message);
      } else {
        // Handle other errors
        setIsLoading(false);
        Helper.showErrorMessage(Constants.SERVER_ERROR);
      }
    } catch (error) {
      // Handle errors from the API call
      setIsLoading(false);
      console.error('API call error:', error);
      Helper.showErrorMessage(Constants.SERVER_ERROR);
    }
  };

  const onActionOK = () => {
    navigation.navigate('ParentHomeScreen');
  };

  return (
    <View
      style={styles.mainContainer}
      pointerEvents={isLoading ? 'none' : 'auto'}>
      <ImageBackground
        source={Images.blueBackground}
        style={styles.backgroundImage}>
        <KeyboardAvoidingView
          style={styles.mainContainer}
          behavior={'padding'}
          keyboardVerticalOffset={Platform.OS === 'android' ? -200 : 0}>
          <SafeAreaView style={styles.SafeAreaView}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 25,
              }}>
              <TouchableOpacity
              onPress={() => navigation.goBack()}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  source={Images.circleArrowLeft}
                  style={{width: 30, height: 30}}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.h1,
                  {flex: 1, textAlign: 'center', color: 'white'},
                ]}>
                {'change password'.toUpperCase()}
              </Text>
            </View>

            <ScrollView contentContainerStyle={styles.ScrollView}>
              <View style={[styles.container, {marginTop: 30}]}>
                <View style={styles.form}>
                  <View style={styles.formControl}>
                    <Image source={Images.lock} style={styles.inputIcon} />
                    <TextInput
                      value={currentPassword}
                      style={styles.input}
                      placeholder={'Current password'.toUpperCase()}
                      underlineColorAndroid={'transparent'}
                      placeholderTextColor={'#fff'}
                      returnKeyType={'next'}
                      onChangeText={password => setCurrentPassword(password)}
                      onSubmitEditing={event => {
                        newPasswordRef.current.focus();
                      }}
                      secureTextEntry={isCurrentPasswordSequre}
                    />
                    <TouchableOpacity>
                      <Icon
                        name={isCurrentPasswordSequre ? 'eye' : 'eye-slash'}
                        size={26}
                        color={'#fff'}
                        onPress={() =>
                          setIsCurrentPasswordSequre(!isCurrentPasswordSequre)
                        }
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.formControl}>
                    <Image source={Images.lock} style={styles.inputIcon} />
                    <TextInput
                      value={newPassword}
                      style={styles.input}
                      ref={newPasswordRef}
                      placeholder={'New Password'.toUpperCase()}
                      underlineColorAndroid={'transparent'}
                      placeholderTextColor={'#fff'}
                      keyboardType={'default'}
                      onChangeText={pass => setNewPassword(pass)}
                      onSubmitEditing={event => {
                        confirmNewPasswordRef.current.focus();
                      }}
                      secureTextEntry={isNewPasswordSequre}
                    />
                    <TouchableOpacity>
                      <Icon
                        name={isNewPasswordSequre ? 'eye' : 'eye-slash'}
                        size={26}
                        color={'#fff'}
                        onPress={() =>
                          setIsNewPasswordSequre(!isNewPasswordSequre)
                        }
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.formControl}>
                    <Image source={Images.lock} style={styles.inputIcon} />
                    <TextInput
                      value={confirmNewPassword}
                      style={styles.input}
                      ref={confirmNewPasswordRef}
                      placeholder={'Confirm New Password'.toUpperCase()}
                      underlineColorAndroid={'transparent'}
                      placeholderTextColor={'#fff'}
                      keyboardType={'default'}
                      onChangeText={pass => setConfirmNewPassword(pass)}
                      onSubmitEditing={event => {
                        Keyboard.dismiss();
                      }}
                      secureTextEntry={isConfirmNewPasswordSequre}
                    />
                    <TouchableOpacity>
                      <Icon
                        name={isConfirmNewPasswordSequre ? 'eye' : 'eye-slash'}
                        size={26}
                        color={'#fff'}
                        onPress={() =>
                          setIsConfirmNewPasswordSequre(
                            !isConfirmNewPasswordSequre,
                          )
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formFooter}>
                    <TouchableOpacity
                      style={[styles.button, styles.buttonPrimary]}
                      onPress={() => btnSaveChange()}>
                      {isLoading ? (
                        <ActivityIndicator
                          color={colors.white}
                          size={30}
                          style={{zIndex: 1000}}
                        />
                      ) : (
                        <Text style={styles.buttonText}>
                          {'save'.toUpperCase()}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default ChangePasswordScreen;
