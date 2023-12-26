import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from '../Components/Spinner';
import React, { Component } from 'react';
import { FlatList, Image, ImageBackground, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Permission from 'react-native-permissions';
import Constants from '../Components/Constants';
import EventEmitter from '../Lib/EventEmitter';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import { Colors, Images } from '../Themes';
 

// Styles
import styles from './Styles/AddUserScreenStyles';
import BaseComponent from '../Components/BaseComponent';

// Global Variables
const objAPI = Api.create();
const objSecureAPI = Api.createSecure();


export default class ChildProfileScreen extends BaseComponent {

    //constructor event
    constructor(props) {
        super(props)
        this.state = {
            dupObjSelectedChild: [],
            objSelectedChild: [],
            arrRewardIcons: [],
            image: '',
            isLoading: false,
            imageBg: Images.BgDay,
            selectedRewardIcon: '',
        }
    }

    //#region -> Component Methods
    componentDidMount() {
        super.componentDidMount()
        this.checkRequestPermission()
        this.getSelectedChild()
        this.getImageBg()
    }
    //#endregion

    //#region -> Class Methods
    getImageBg = () => {
        // Helper.getBackgroudImageTwelveHrsOnly((image, navHeaderColor) => {
        //     this.props.navigation.setParams({ navHeaderColor });
        //     this.setState({ imageBg: image })
        // })
        AsyncStorage.getItem(Constants.BACKGROUND_IMAGE, (err, result) => {
            if (result) {
              this.setState({ imageBg: result });
            }
          })
          AsyncStorage.getItem(Constants.NAV_COLOR, (err, result) => {
            if (result) {
              this.props.navigation.setParams({ navHeaderColor : result });
            }
          })
    }

    getSelectedChild = () => {
        AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
            if (child != '') {
                this.setState({
                    objSelectedChild: JSON.parse(child),
                    dupObjSelectedChild: JSON.parse(child)
                });
            }
            this.callGetRewardsIcons()
        })
    }

    checkRequestPermission = () => {
        Permission.checkMultiple(['photo', 'camera', 'microphone']).then(response => {
            console.log('response',response)
            if (response.photo == 'authorized') {
                if (response.camera == 'authorized') {
                } else {
                    Permission.request('camera').then(responseCamera => {
                        if (responseCamera == 'authorized') {

                        } else
                            Helper.showMessageWithOpenSetting('Can we access your camera? \n' +
                                Constants.APP_NAME + ' uses your camera to upload image.')
                    })
                }
            }
            else {
                Permission.request('photo').then(responsePhoto => {
                    if (responsePhoto == 'authorized') {
                        if (response.camera == 'authorized') {

                        } else {
                            Permission.request('camera').then(responseCamera => {
                                if (responseCamera == 'authorized') {

                                } else
                                    Helper.showMessageWithOpenSetting('Can we access your camera? \n' +
                                        Constants.APP_NAME + ' uses your camera to upload image.')
                            })
                        }
                    } else {
                        Helper.showMessageWithOpenSetting('Can we access your photo library? \n' +
                            Constants.APP_NAME + ' uses your photo library to upload image.')
                    }
                })
            }
        })

        Permission.checkMultiple(['microphone']).then(response => {
            if (response.photo != 'authorized') {
                Permission.request('microphone').then(responseCamera => {
                    if (responseCamera != 'authorized') {
                        Helper.showMessageWithOpenSetting('Can we access your microphone? \n' +
                            Constants.APP_NAME + ' uses your microphone to upload videos.')
                    }
                })
            }
        })
    }

    onPressAddChild = () => {
        Keyboard.dismiss();
        if (this.isValidate()) {
            this.callUpdateChildProfile()
        }
    }

    onPressSelectAvatar() {
        ImagePicker.openPicker({
            cropping: true
        }).then(image => {
            console.log('image.path', image.path);
            this.state.objSelectedChild.profile_pic = image.path
            this.setState({
                image: image
            })
        });
    }

    isValidate = () => {
        if (this.state.objSelectedChild.name.trim() == '') {
            Helper.showErrorMessage(Constants.MESSAGE_NO_USERNAME);
            return false;
        }
        else if (!Helper.validateChildName(this.state.objSelectedChild.name.trim())) {
            Helper.showErrorMessage(Constants.MESSAGE_VALID_CHILD_NAME);
            return false;
        }
        else if (JSON.stringify(this.state.dupObjSelectedChild) === JSON.stringify(this.state.objSelectedChild)) {
            Helper.showErrorMessage(Constants.MESSAGE_EDIT_CHILD_INFO);
            return false;
        }
        return true;
    }

    renderRow(item, index) {
        return (
            <TouchableOpacity style={[styles.rewardTouch, this.state.selectedRewardIcon == item ? styles.rewardTouchActive : '']}
                onPress={() => this.selectRewardIcon(item)}>
                <Image source={{ uri: item }} style={styles.rewardIconImage} />
            </TouchableOpacity>
        )
    }

    selectRewardIcon = (rewardIcon) => {
        this.state.objSelectedChild.icon = rewardIcon
        this.setState({ selectedRewardIcon: rewardIcon })
    }
    //#endregion

    //#region -> API Calls
    callGetRewardsIcons = () => {
        this.setState({ isLoading: true })
        const res = objAPI.getRewardIcons().then((resJSON) => {
            console.log('✅✅✅', JSON.stringify(resJSON.data.data))
            if (resJSON.ok && resJSON.status == 200) {
                this.setState({ isLoading: false })
                if (resJSON.data.success) {
                    var result = resJSON.data.data.icons.find(obj => {
                        return obj === this.state.objSelectedChild.icon
                    })
                    this.setState({
                        arrRewardIcons: resJSON.data.data.icons,
                        selectedRewardIcon: result
                    })
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

    callUpdateChildProfile = async () => {
        this.setState({ isLoading: true })
        var child = this.state.objSelectedChild
        var rewardIcon = this.state.selectedRewardIcon.split("/").slice(-1)[0];
        const res = objSecureAPI.updateChild(child.id, child.name, this.state.image != null ? this.state.image : '', rewardIcon).then((resJSON) => {
            console.log('✅✅✅', resJSON)
            if (resJSON.ok && resJSON.status == 200) {
                this.setState({ isLoading: false })
                if (resJSON.data.success) {
                    this.setState({ dupObjSelectedChild: JSON.stringify(resJSON.data.data[0]) })
                    try {
                        AsyncStorage.setItem(Constants.KEY_SELECTED_CHILD, JSON.stringify(resJSON.data.data[0]))
                        Helper.setRewardIcon(this.props.navigation)
                        EventEmitter.emit(Constants.EVENT_CHILD_UPDATE)
                        Helper.showErrorMessage(resJSON.data.message)
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
            <View style={styles.mainContainer}>
            {/* <ImageBackground source={Images.BgDay} style={styles.backgroundImage}> */}
                <ImageBackground source={this.state.imageBg} style={styles.backgroundImage}>
                    <ScrollView contentContainerStyle={styles.ScrollView}>
                        <View style={[styles.container, styles.justifySpaceBetween]}>
                            <View style={styles.topHeader}>
                                <Text style={[styles.h1, styles.textCenter]}>{'Profile'.toUpperCase()}</Text>
                            </View>
                            <View style={styles.form}>
                                <View style={styles.formControl}>
                                    <Image source={Images.user} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        autoCapitalize='characters'
                                        value={this.state.objSelectedChild.name ? this.state.objSelectedChild.name.toUpperCase() : ''}
                                        placeholder={'Name'.toUpperCase()}
                                        underlineColorAndroid={'transparent'}
                                        placeholderTextColor={Colors.placeHolderText}
                                        returnKeyType={'done'}
                                        onChangeText={(username) => {
                                            this.state.objSelectedChild.name = username
                                            this.setState({})
                                        }}
                                    //onSubmitEditing={(event) => { this.refs.pass.focus(); }}
                                    />
                                </View>
                                <View style={styles.imageUploader}>
                                    <View style={[styles.uploadView, styles.uploadViewCircle]}>
                                        <Image source={this.state.objSelectedChild && this.state.objSelectedChild.profile_pic ?
                                            { uri: this.state.objSelectedChild.profile_pic } : Images.upload} style={this.state.objSelectedChild && this.state.objSelectedChild.profile_pic ? styles.uploadedImage : styles.uploadPlaceholder} />
                                    </View>
                                    <TouchableOpacity style={[styles.button, styles.smallButton, styles.buttonCarrot]} onPress={() => this.onPressSelectAvatar()}>
                                        <Text style={styles.smallButtonText}>{'Change Profile Image'.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ paddingTop: 30 }}>
                                <Text style={[styles.label, { fontSize: 16 }]}>{'Reward Icon'.toUpperCase()}</Text>
                            </View>
                            <FlatList
                                // contentContainerStyle={{ flex: 1, /*alignSelf: 'center', */
                                // flexDirection:'row', /*justifyContent:'center',*/ paddingLeft:15, 
                                // paddingRight:15 }} style={{ width: '100%' }}
                                keyboardShouldPersistTaps={'always'}
                                numColumns={4}
                                horizontal={false}
                                data={this.state.arrRewardIcons}
                                extraData={this.state}
                                keyExtractor={(item, index) => (index + '')}
                                renderItem={({ item, index }) => this.renderRow(item, index)}
                            />
                            <View style={[styles.justifyFooter, { paddingTop: 20 }]}>
                                <TouchableOpacity style={styles.button} onPress={() => this.onPressAddChild()}>
                                    {this.state.isLoading ? <Spinner color={'#FFFFFF'} size={'small'} />
                                        :
                                        <Text style={styles.buttonText}>{'Save Changes'.toUpperCase()}</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </ImageBackground>
            </View>
        )
    }
    //#endregion
}
