import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from '../Components/Spinner';
import React, { Component } from 'react';
import { Alert, FlatList, Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Constants from '../Components/Constants';
import EventEmitter from '../Lib/EventEmitter';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import { Colors, Images, Metrics } from '../Themes';
 

// Styles
import styles from './Styles/SelectUserScreenStyles';
import BaseComponent from '../Components/BaseComponent';


// Global Variables
const objSecureAPI = Api.createSecure();

export default class ParentsSelectChildScreen extends BaseComponent {

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
            arrAllChild: [],
            isLoading: false,
            userHasChilds: false,
        }
    }

    //#region -> Component Methods
    componentDidMount(){
        super.componentDidMount()
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

    renderRow(item, index) {
        return (
            <>
            <TouchableOpacity style={styles.selectUser} onPress={() => this.moveToParentHomeScreen(item)}>
                <View style={styles.avatarWrapper}>
                    <Image style={styles.avatar} source={item.profile_pic != '' ? { uri: item.profile_pic } : Images.userPlaceholder} />
                </View>
                <View style={styles.userName}>
                    <Text style={styles.userNameText}>{(item.name).toUpperCase()}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteWrapper} onPress={() => this.confirmDelete(item?.id)}><Image style={[styles.deleteIcon,{tintColor:'black'}]} source={Images.bin} /></TouchableOpacity>
            </>
        )
    }

    moveToAddChild = () => {
        this.props.navigation.navigate('ParentsAddUserScreen')
    }

    moveToParentHomeScreen = (selectedChild) => {
        try {
            AsyncStorage.setItem(Constants.KEY_SELECTED_CHILD, JSON.stringify(selectedChild))
            EventEmitter.emit(Constants.EVENT_CHILD_UPDATE)
            this.props.navigation.navigate('ParentHomeScreen', {
             isSchedule : true
            })
        } catch (error) {
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
                                    EventEmitter.emit(Constants.EVENT_CHILD_UPDATE)
                                } catch (error) {
                                }
                            }
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

   confirmDelete = (cid) =>
    Alert.alert(
        Constants.APP_NAME,
      "If you remove this child then all information will be removed for this child.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
        { text: "OK", onPress: () => this.deleteChild(cid) }
      ]
    );
      //#endregion -> API Calls
      deleteChild = (cid) => {
        // this.setState({ isLoading: true })
        const res = objSecureAPI.deleteChild(cid).then((resJSON) => {
            if (resJSON.ok && resJSON.status == 200) {
                // this.setState({ isLoading: false })
                if (resJSON.data.success) {
                    Helper.showErrorMessage(resJSON.data.message);
                    setTimeout(() => {
                        this.callGetChild();
                    }, 500);
                }
                else {
                    Helper.showErrorMessage(resJSON.data.message);
                }
            }
            else if (resJSON.status == 500) {
                // this.setState({ isLoading: false })
                Helper.showErrorMessage(resJSON.data.message);
            }
            else {
                // this.setState({ isLoading: false })
                Helper.showErrorMessage(Constants.SERVER_ERROR);
            }
        })
    }
    //#endregion

    //#region -> View Render
    render() {
        return (
            <View style={styles.mainContainer}>
                <ImageBackground source={Images.blueBackground} style={styles.backgroundImage}>
                    <ScrollView contentContainerStyle={styles.ScrollView}>
                       {this.state.userHasChilds ? <Text style={[styles.title, styles.textCenter]}>SELECT THE USER YOU {'\n'} WOULD LIKE TO SCHEDULE</Text> : null} 
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
                            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => this.moveToAddChild()}>
                                <Text style={styles.buttonText}>{'Add a New User'.toUpperCase()}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </ImageBackground>
            </View>
        )
    }
    //#endregion
}
