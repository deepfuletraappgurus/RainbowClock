import Spinner from '../Components/Spinner';
import React, { Component } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Permission from 'react-native-permissions';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import { Colors, Images, Metrics } from '../Themes';
import styles from './Styles/AddUserScreenStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseComponent from '../Components/BaseComponent';
import EventEmitter from '../Lib/EventEmitter';
import moment from 'moment';

const objAPISecure = Api.createSecure();

export default class ParentsAddUserScreen extends BaseComponent {
  static navigationOptions = ({ navigation }) => ({
    headerStyle: {
      backgroundColor: Colors.navHeaderLight,
      shadowOpacity: 0,
      shadowOffset: { height: 0 },
      elevation: 0,
      height: Metrics.navBarHeight,
      borderBottomWidth: 0,
    },
  });

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      profilePic: '',
      image: '',
      isLoading: false,
      data: [],
      startDate: moment().format('hh:mm A').toString(),
      endDate: moment(moment().add(moment.duration('01:00')))
        .format('hh:mm A')
        .toString(),
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.checkRequestPermission();
  }

  checkRequestPermission = () => {
    Permission.checkMultiple(['photo', 'camera', 'microphone']).then(
      response => {
        if (response.photo === 'authorized') {
          if (response.camera === 'authorized') {
            // All permissions are granted
          } else {
            Permission.request('camera').then(responseCamera => {
              if (responseCamera === 'authorized') {
                // Camera permission granted
              } else {
                Helper.showMessageWithOpenSetting(
                  'Can we access your camera? \n' +
                    Constants.APP_NAME +
                    ' uses your camera to upload image.',
                );
              }
            });
          }
        } else {
          Permission.request('photo').then(responsePhoto => {
            if (responsePhoto === 'authorized') {
              if (response.camera === 'authorized') {
                // All permissions are granted
              } else {
                Permission.request('camera').then(responseCamera => {
                  if (responseCamera === 'authorized') {
                    // Camera permission granted
                  } else {
                    Helper.showMessageWithOpenSetting(
                      'Can we access your camera? \n' +
                        Constants.APP_NAME +
                        ' uses your camera to upload image.',
                    );
                  }
                });
              }
            } else {
              Helper.showMessageWithOpenSetting(
                'Can we access your photo library? \n' +
                  Constants.APP_NAME +
                  ' uses your photo library to upload image.',
              );
            }
          });
        }
      },
    );

    Permission.checkMultiple(['microphone']).then(response => {
      if (response.photo !== 'authorized') {
        Permission.request('microphone').then(responseCamera => {
          if (responseCamera !== 'authorized') {
            Helper.showMessageWithOpenSetting(
              'Can we access your microphone? \n' +
                Constants.APP_NAME +
                ' uses your microphone to upload videos.',
            );
          }
        });
      }
    });
  };

  onPressAddChild = () => {
    Keyboard.dismiss();
    if (this.isValidate()) {
      this.callAPI_AddUser();
    }
  };

  onPressSelectAvatar() {
    ImagePicker.openPicker({
      cropping: true,
    }).then(image => {
      this.setState({
        profilePic: image.path,
        image: image,
      });
    });
  }

  isValidate = () => {
    if (this.state.username.trim() === '') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_CHILDNAME);
      return false;
    } else if (!Helper.validateChildName(this.state.username.trim())) {
      Helper.showErrorMessage(Constants.MESSAGE_VALID_CHILD_NAME);
      return false;
    }
    return true;
  };

  callAPI_AddUser = async () => {
    this.setState({ isLoading: true });
    try {
      const resJSON = await objAPISecure.addchild(
        this.state.username,
        this.state.image,
        this.state.startDate,
        this.state.endDate,
        Platform.OS.toUpperCase(),
        '',
      );
      if (resJSON.ok && resJSON.status === 200) {
        this.setState({ isLoading: false });
        if (resJSON.data.success) {
          this.setState({
            username: '',
            profilePic: '',
            image: '',
            data: resJSON.data.data,
          });
          try {
            AsyncStorage.setItem(Constants.KEY_USER_HAVE_CHILDREN, '1');
            Helper.showConfirmationMessageActions(
              resJSON.data.message,
              'No',
              'Yes',
              this.onActionNo,
              this.onActionYes,
            );
          } catch (error) {
            Alert.alert('Error setting AsyncStorage', error.message);
          }
        } else {
          Helper.showErrorMessage(resJSON.data.message);
        }
      } else if (resJSON.status === 500) {
        this.setState({ isLoading: false });
        Helper.showErrorMessage(resJSON.data.message);
      } else {
        this.setState({ isLoading: false });
        Helper.showErrorMessage(Constants.SERVER_ERROR);
      }
    } catch (error) {
      this.setState({ isLoading: false });
      Alert.alert('Error in callAPI_AddUser', error.message);
    }
  };

  onActionYes = () => { };
  onActionNo = () => {
    Helper.showConfirmationMessageSingleAction(
      Constants.ADD_CHILD_SUCCESS,
      'OK',
      this.onActionOK,
    );
  };

  onActionOK = () => {
    try {
      // AsyncStorage.setItem(Constants.KEY_ACCESS_AS_PARENTS, '1');
      EventEmitter.emit(Constants.EVENT_DRAWER_UPDATE);
      this.props.navigation.push('ParentsSelectChildScreen');
    } catch (error) {
      Alert.alert('Error in onActionOK', error.message);
    }
  };

  moveToHomeScreen = selectedChild => {
    try {
      AsyncStorage.setItem(
        Constants.KEY_SELECTED_CHILD,
        JSON.stringify(selectedChild),
      );
      setTimeout(() => {
        this.props.navigation.navigate('HomeScreen');
        EventEmitter.emit(Constants.EVENT_CHILD_UPDATE);
      }, 100);
    } catch (error) {
      Alert.alert('Error in moveToHomeScreen', error.message);
    }
  };

  render() {
    return (
      <View style={styles.mainContainer}>
        <ImageBackground
          source={Images.blueBackground}
          style={styles.backgroundImage}>
          <ScrollView contentContainerStyle={styles.ScrollView}>
            <View style={[styles.container, styles.justifySpaceBetween]}>
              <View style={styles.topHeader}>
                <Text style={[styles.h1, styles.textCenter]}>
                  {'Add Child'.toUpperCase()}
                </Text>
              </View>
              <View style={styles.form}>
                <View style={styles.formControl}>
                  <Image source={Images.user} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    autoCapitalize="characters"
                    value={this.state.username}
                    maxLength={15}
                    placeholder={"Child's name".toUpperCase()}
                    underlineColorAndroid={'transparent'}
                    placeholderTextColor={Colors.placeHolderText}
                    returnKeyType={'next'}
                    onChangeText={username => this.setState({ username })}
                  />
                </View>
                <View style={styles.imageUploader}>
                  <View style={styles.uploadView}>
                    {this.state.profilePic ? (
                      <Image
                        source={{ uri: this.state.profilePic }}
                        style={styles.uploadedImage}
                      />
                    ) : (
                      <Image
                        source={Images.upload}
                        style={styles.uploadPlaceholder}
                      />
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.smallButton,
                      styles.buttonCarrot,
                    ]}
                    onPress={() => this.onPressSelectAvatar()}>
                    <Text style={styles.smallButtonText}>
                      {'Add An Avatar Image'.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.justifyFooter}>
                <TouchableOpacity
                  disabled={this.state.isLoading}
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={() => this.onPressAddChild()}>
                  {this.state.isLoading ? (
                    <Spinner color={'#FFFFFF'} size={'small'} />
                  ) : (
                    <Text style={styles.buttonText}>
                      {'Add Child'.toUpperCase()}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    );
  }
}