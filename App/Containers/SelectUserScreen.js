import Spinner from '../Components/Spinner';
import React, { Component } from 'react';
import { FlatList, Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Constants from '../Components/Constants';
import EventEmitter from '../Lib/EventEmitter';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import { Images } from '../Themes';
// Styles
import styles from './Styles/SelectUserScreenStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseComponent from '../Components/BaseComponent';
 


// Global Variables
const objSecureAPI = Api.createSecure();

export default class SelectUserScreen extends BaseComponent {

    //constructor event
    constructor(props) {
        super(props)
        this.state = {
            arrAllChild: [],
            isLoading: false,
            userHasChilds: false,
            imageBg: Images.BgDay,
        }
    }

    //#region -> Component Methods
    componentDidMount() {
        super.componentDidMount()
        this.getImageBg()
        this.setState({ isLoading: true })
        AsyncStorage.getItem(Constants.KEY_USER_HAVE_CHILDREN, (err, result) => {
            if (result === '1') {
                this.setState({ userHasChilds: true })
                this.callGetChild()
            }
            else {
                this.setState({
                    userHasChilds: false,
                    isLoading: false
                })
            }
        })
    }
    //#endregion

    //#region -> Class Methods

    // getImageBg = () => {
    //     // Helper.getBackgroudImageTwelveHrsOnly((image, navHeaderColor) => {
    //     //     this.props.navigation.setParams({ navHeaderColor });
    //     //     this.setState({ imageBg: image })
    //     // })
    //     AsyncStorage.getItem(Constants.BACKGROUND_IMAGE, (err, result) => {
    //         if (result) {
    //           this.setState({ imageBg: result });
    //         }
    //       })
    //       AsyncStorage.getItem(Constants.NAV_COLOR, (err, result) => {
    //         if (result) {
    //           this.props.navigation.setParams({ navHeaderColor : result });
    //         }
    //       })
    // }
    getImageBg = () => {
        Helper.getBackgroudImage((image, navHeaderColor) => {
          // this.props.navigation.setParams({ navHeaderColor });
          // console.log('imageimage',image)
          this.setState({ imageBg: image });
          this.props.navigation.setParams({ navHeaderColor : navHeaderColor });
          AsyncStorage.setItem(Constants.BACKGROUND_IMAGE, JSON.stringify(image))
          AsyncStorage.setItem(Constants.NAV_COLOR, JSON.stringify(navHeaderColor))
          // this.setState({ imageBg: image });
        });
      };

    renderRow(item, index) {
        return (
            <TouchableOpacity style={styles.selectUser} onPress={() => this.moveToHomeScreen(item)}>
                <View style={styles.avatarWrapper}>
                    <Image style={styles.avatar} source={item.profile_pic != '' ? { uri: item.profile_pic } : Images.userPlaceholder} />
                </View>
                <View style={styles.userName}>
                    <Text style={styles.userNameText}>{(item.name).toUpperCase()}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    moveToAddChild = () => {
        this.props.navigation.navigate('AddUserScreen')
    }

    moveToHomeScreen = (selectedChild) => {
        try {
            AsyncStorage.setItem(Constants.KEY_SELECTED_CHILD, JSON.stringify(selectedChild))
            setTimeout(() => {
                this.props.navigation.navigate('HomeScreen')
                EventEmitter.emit(Constants.EVENT_CHILD_UPDATE)
            }, 100);
        } catch (error) {
            console.log('AsyncStorage Error: ', error)
        }
    }
    //#endregion

    //#endregion -> API Calls
    callGetChild = () => {
        this.setState({ isLoading: true })
        const res = objSecureAPI.getChildren().then((resJSON) => {
            if (resJSON.ok && resJSON.status == 200) {
                this.setState({ isLoading: false })
                if (resJSON.data.success) {
                    console.log('ALL CHILDREN ✅✅✅', JSON.stringify(resJSON.data.data))
                    arrAllChild = resJSON.data.data
                    if(arrAllChild.length === 0){
                        AsyncStorage.setItem(Constants.KEY_USER_HAVE_CHILDREN, '0');
                        this.setState({ userHasChilds: false })
                        AsyncStorage.setItem(Constants.KEY_SELECTED_CHILD, null)
                        EventEmitter.emit(Constants.EVENT_CHILD_UPDATE)
                    } else{
                        AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
                            if (child == null) {
                                try {
                                    AsyncStorage.setItem(Constants.KEY_SELECTED_CHILD, JSON.stringify(resJSON.data.data[0]))
                                } catch (error) {
                                    console.log('AsyncStorage Error: ', error)
                                }
                            }
                            setTimeout(() => {
                                EventEmitter.emit(Constants.EVENT_CHILD_UPDATE)
                            }, 100);
                        })
                        this.setState({ arrAllChild: resJSON.data.data })
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
                <ImageBackground source={this.state.imageBg} style={styles.backgroundImage}>
            {/* <ImageBackground source={Images.BgDay} style={styles.backgroundImage}> */}
                    <ScrollView contentContainerStyle={styles.ScrollView}>
                        <View style={[styles.container]}>
                            <View style={styles.selectUserList}>
                                {this.state.isLoading ?
                                    <View>
                                        <Spinner color={'#FFFFFF'} size={'small'} />
                                        <Text style={styles.waitText}>{Constants.TEXT_FATCHING_CHILD}</Text>
                                    </View>
                                    :
                                    this.state.userHasChilds ? <FlatList contentContainerStyle={{ flex: 1, alignSelf: 'center' }} style={{ width: '100%' }} keyboardShouldPersistTaps={'always'}
                                        data={this.state.arrAllChild}
                                        extraData={this.state}
                                        keyExtractor={(item, index) => (index + '')}
                                        renderItem={({ item, index }) => this.renderRow(item, index)}
                                    />
                                        :
                                        <Text style={styles.waitText}>{Constants.TEXT_NO_CHILD_ADDED_YET}</Text>
                                }
                            </View>
                            {!this.state.userHasChilds &&
                                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => this.moveToAddChild()}>
                                    <Text style={styles.buttonText}>{'Add a New User'.toUpperCase()}</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    </ScrollView>
                </ImageBackground>
            </View>
        )
    }
    //#endregion
}
