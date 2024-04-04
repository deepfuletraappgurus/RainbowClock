import Spinner from '../Components/Spinner';
import React from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import BaseComponent from '../Components/BaseComponent';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import {Colors, Images, Metrics} from '../Themes';
// Styles
import styles from './Styles/CreateRewardScreenStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Global Variables
const mAPi = Api.createSecure();

export default class CreateRewardScreen extends BaseComponent {
  static navigationOptions = ({navigation}) => ({
    headerStyle: {
      backgroundColor: Colors.navHeaderLight,
      shadowOpacity: 0,
      shadowOffset: {height: 0},
      elevation: 0,
      height: Metrics.navBarHeight,
      borderBottomWidth: 0,
    },
  });

  //constructor event
  constructor(props) {
    super(props);
    this.state = {
      showDropdown: false,
      arrTokens: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      rewardName: '',
      isSpecialReward: false,
      numberOfToken: '',
      rewardImage: '',
      loading: false,
      objSelectedChild: '',
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getChildDetail();
    this.navFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        Helper.getChildRewardPoints(this.props.navigation);
      },
    );
    // this.checkRequestPermission()
  }
  getChildDetail = () => {
    AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
      if (child != '') {
        this.setState({objSelectedChild: JSON.parse(child)});
      }
    });
  };
  //#region -> Class Methods
  checkRequestPermission = () => {
    check(PERMISSIONS.IOS.PHOTO_LIBRARY).then(result => {
      if (result === RESULTS.GRANTED) {
      } else {
        request(PERMISSIONS.IOS.PHOTO_LIBRARY).then(responseCamera => {});
      }
    });

    // Permission.checkMultiple(['microphone']).then(response => {
    //     if (response.photo != 'authorized') {
    //         Permission.request('microphone').then(responseCamera => {
    //             if (responseCamera != 'authorized') {
    //                 Helper.showMessageWithOpenSetting('Can we access your microphone? \n' +
    //                     Constants.APP_NAME + ' uses your microphone to upload videos.')
    //             }
    //         })
    //     }
    // })
  };
  checkPermission = () => {
    // Permission.checkMultiple(['photo', 'camera']).then(response => {
    //     if (response.photo == 'authorized') {
    //         if (response.camera == 'authorized') {
    //             this.onPressSelectImage()
    //         } else {
    //             Permission.request('camera').then(responseCamera => {
    //                 if (responseCamera == 'authorized') {
    //                     this.onPressSelectImage()
    //                 }
    //                 else {
    //                     Helper.showMessageWithOpenSetting('Can we access your camera? \n' +
    //                         Constants.APP_NAME + ' uses your camera to upload image.')
    //                 }
    //             })
    //         }
    //     }
    //     else {
    //         Permission.request('photo').then(responsePhoto => {
    //             if (responsePhoto == 'authorized') {
    //                 if (response.camera == 'authorized') {
    //                     this.onPressSelectImage()
    //                 } else {
    //                     Permission.request('camera').then(responseCamera => {
    //                         if (responseCamera == 'authorized') {
    //                             this.onPressSelectImage()
    //                         } else{
    //                             Helper.showMessageWithOpenSetting('Can we access your camera? \n' +
    //                                 Constants.APP_NAME + ' uses your camera to upload image.')
    //                         }
    //                     })
    //                 }
    //             } else {
    //                 Helper.showMessageWithOpenSetting('Can we access your photo library? \n' +
    //                     Constants.APP_NAME + ' uses your photo library to upload image.')
    //             }
    //         })
    //     }
    // })
    // check(PERMISSIONS.IOS.PHOTO_LIBRARY).then(result => {
    //     if (result === RESULTS.GRANTED) {
    //        this.onPressSelectImage()
    //     }
    //     else {
    //         request(PERMISSIONS.IOS.PHOTO_LIBRARY).then(responseCamera => {
    //             if (responseCamera === RESULTS.GRANTED) {
    //                 this.onPressSelectImage()
    //             }
    //         })
    //     }
    // })
    this.onPressSelectImage();
  };

  onPressSelectImage() {
    ImagePicker.openPicker({
      cropping: true,
    }).then(image => {
      this.setState({
        rewardImage: image,
      });
    });
  }

  toggleDropdown() {
    this.setState({showDropdown: !this.state.showDropdown});
  }

  chooseToken = isSpecialReward => {
    this.setState({isSpecialReward});
  };

  btnGoBack = () => {
    Keyboard.dismiss();
    this.props.navigation.goBack();
  };

  isValidate = () => {
    if (this.state.rewardImage == '') {
      Helper.showErrorMessage('Please select reward image.');
      return false;
    } else if (this.state.rewardName.trim() == '') {
      Helper.showErrorMessage('Please enter reward name.');
      return false;
    } else if (
      this.state.numberOfToken.trim().toLocaleLowerCase() === 'select' ||
      this.state.numberOfToken.trim() == ''
    ) {
      Helper.showErrorMessage('Please enter reward token.');
      return false;
    }
    return true;
  };
  //#endregion

  //#region -> API Calls
  onPressCreate = () => {
    Keyboard.dismiss();
    if (this.isValidate()) {
      this.setState({loading: true});
      AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
        if (child != '') {
          this.setState({objSelectedChild: JSON.parse(child)});
        }
      });
      mAPi
        .createReward(
          this.state.rewardName,
          this.state.isSpecialReward,
          this.state.numberOfToken,
          this.state.rewardImage,
          this.state.objSelectedChild?.id,
        )
        .then(response => {
          this.setState({loading: false});
          if (response.ok) {
            if (response.data.success) {
              this.props.navigation.goBack();
            } else {
              Helper.showErrorMessage(response.data.message);
            }
          } else {
            Helper.showErrorMessage(response.problem);
          }
        })
        .catch(error => {
          this.setState({loading: false});
        });
    }
  };

  renderTokens(item, index) {
    return (
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() =>
          this.setState({numberOfToken: item, showDropdown: false})
        }>
        <Text style={styles.dropdownItemText}>{item}</Text>
      </TouchableOpacity>
    );
  }
  //#endregion

  //#region -> View Render
  render() {
    return (
      <View
        style={styles.mainContainer}
        pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        <ImageBackground
          source={Images.blueBackground}
          style={styles.backgroundImage}>
          <ScrollView
            contentContainerStyle={[styles.ScrollView]}
            keyboardShouldPersistTaps="never">
            <View style={styles.container}>
              <Text style={[styles.h1, styles.textCenter, {marginBottom: 10}]}>
                {'Create Reward'.toUpperCase()}
              </Text>
              <View style={styles.form}>
                <View style={styles.imageUploader}>
                  <View style={styles.uploadView}>
                    <Image
                      source={
                        this.state.rewardImage
                          ? {uri: this.state.rewardImage.path}
                          : Images.upload
                      }
                      style={
                        this.state.rewardImage
                          ? styles.uploadedImage
                          : styles.uploadPlaceholder
                      }
                    />
                  </View>
                  <View style={styles.buttonRight}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.smallButton,
                        styles.buttonCarrot,
                        {marginBottom: 0},
                      ]}
                      onPress={() => this.checkPermission()}>
                      <Text style={styles.smallButtonText}>
                        {'Select Image'.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={[styles.formControl, styles.formControlSmall]}>
                  <TextInput
                    style={styles.input}
                    autoCapitalize="characters"
                    value={this.state.customTaskName}
                    placeholder={'Name'.toUpperCase()}
                    underlineColorAndroid={'transparent'}
                    placeholderTextColor={'#fff'}
                    onChangeText={rewardName => this.setState({rewardName})}
                  />
                </View>
                <View style={[styles.iconContainer, {flexGrow: 1}]}>
                  <Text style={[styles.title, styles.textCenter]}>
                    {'Type of Tokens'.toUpperCase()}
                  </Text>
                  <View style={styles.typeTokens}>
                    <TouchableOpacity
                      style={styles.tokensClick}
                      onPress={() => this.chooseToken(false)}>
                      <View
                        style={
                          this.state.isSpecialReward ? styles.disable : null
                        }>
                        <View style={styles.tokensIconView}>
                          <Image
                            source={Images.everyday}
                            style={styles.tokensIcon}
                          />
                        </View>
                        <Text style={[styles.tokensText, styles.textCenter]}>
                          {'EVERYDAY\nREWARD'.toUpperCase()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.tokensClick}
                      onPress={() => this.chooseToken(true)}>
                      <View
                        style={
                          this.state.isSpecialReward ? null : styles.disable
                        }>
                        <View style={styles.tokensIconView}>
                          <Image
                            source={Images.special}
                            style={styles.tokensIcon}
                          />
                        </View>
                        <Text style={[styles.tokensText, styles.textCenter]}>
                          {'SPECIAL\nREWARD'.toUpperCase()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* <View style={styles.frm}>
                                        <View style={[styles.inline, styles.dropdownSpaceBottom]}>
                                            <Text style={[styles.label, { marginBottom: 0, paddingBottom: 0 }]}>{'HOW MANY TOKENS'}</Text>
                                            <View style={{ flex: 1, paddingLeft: 15 }}>
                                                <TouchableOpacity style={styles.dropdownButton} onPress={() => this.toggleDropdown()}>
                                                    <Text style={styles.dropdownButtonText}>{this.state.numberOfToken}</Text>
                                                    <Image source={Images.downarrow} style={styles.downarrow} />
                                                </TouchableOpacity>
                                            </View>
                                            {this.state.showDropdown ?
                                                <View style={[styles.dropdown, styles.dropdownSmall]}>

                                                    <FlatList
                                                        keyboardShouldPersistTaps={'always'}
                                                        data={this.state.arrTokens}
                                                        extraData={this.state}
                                                        keyExtractor={(item, index) => index}
                                                        renderItem={({ item, index }) => this.renderTokens(item, index)}
                                                        contentContainerStyle={{}}
                                                    />
                                                </View>
                                                : null
                                            }
                                        </View>
                                    </View> */}
                <View style={[styles.formControl, styles.formControlSmall]}>
                  <TextInput
                    style={styles.input}
                    value={this.state.numberOfToken}
                    placeholder={'HOW MANY TOKENS'.toUpperCase()}
                    underlineColorAndroid={'transparent'}
                    placeholderTextColor={'#fff'}
                    onChangeText={numberOfToken =>
                      this.setState({numberOfToken})
                    }
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              <View style={{paddingLeft: 30, paddingRight: 30, width: '100%'}}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buttonPrimary,
                    {marginBottom: 0},
                  ]}
                  onPress={() => this.onPressCreate()}>
                  {this.state.loading ? (
                    <Spinner size="small" color={Colors.snow} />
                  ) : (
                    <Text style={styles.buttonText}>
                      {'Create'.toUpperCase()}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.formFooter}>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => this.btnGoBack()}>
                  <Image
                    source={Images.circleArrowLeft}
                    style={styles.circleArrow}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    );
  }
  //#endregion
}
