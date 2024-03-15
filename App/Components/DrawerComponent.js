import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { BackHandler, FlatList, Image, ImageBackground, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import Constants from '../Components/Constants';
import EventEmitter from '../Lib/EventEmitter';
import * as Helper from '../Lib/Helper';
import { Images } from '../Themes/';
import styles from './Styles/DrawerContainerStyles';
import Share from 'react-native-share';
 

export default class DrawerContainer extends React.Component {

  //constructor event.  
  constructor(props) {
    super(props)
    this.state = {
      objSelectedChild: [],
      profilePic: '',
      isLoading: false,
      isMenuAsParentPortal: false,
    };
  }

  //#region -> Component Methods

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.navigate('DrawerClose')
      return true
    })
    this.getChildDetail()
    this.getMenuAccessRole()
    EventEmitter.on(Constants.EVENT_CHILD_UPDATE, (newData) => {
      this.getChildDetail()
    })
    EventEmitter.on(Constants.EVENT_DRAWER_UPDATE, (newData) => {
      this.getMenuAccessRole()
    })
  }

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove()
    }
  }

  getChildDetail = () => {
    AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
      if (child != '') {
        this.setState({ objSelectedChild: JSON.parse(child) });
      }
    })
  }

  getMenuAccessRole = () => {
    AsyncStorage.getItem(Constants.KEY_ACCESS_AS_PARENTS, (err, result) => {
      if (result == '1') {
        this.setState({ isMenuAsParentPortal: true });
      }
    })
  }
  //#endregion

  //#region -> Class Methods
  onPressMenuItem(strMenuItem) {
    if (strMenuItem.title == 'Logout') {
      this.onPressLogout()
    }
    else if (strMenuItem.title == 'Exit Admin Portal') {
      this.onPressExitParentProfile()
    }
    else if (strMenuItem.title == 'Share This App') {
      this.openShareOptions()
    }
    else if(this.state.objSelectedChild <= 0 && strMenuItem.title == 'Change User'){
      this.onPressChangeUser();
    }
    else {
      if (strMenuItem.screen != '' && this.state.objSelectedChild) {
        Helper.resetNavigationToScreenWithStack(this.props.navigation, strMenuItem.screen, 'drawerStack')
      }
    }
  }

  openShareOptions() {
    const shareOptions = {
      title: Constants.APP_NAME,
      message: 'Please download the app',
      url: 'some share url',
    };
    Share.open(shareOptions)
      .then((res) => {  })
      .catch((err) => {  });
  }

  renderRow(item, index) {
    return (
      <TouchableOpacity style={styles.navItem} onPress={() => this.onPressMenuItem(item)}>
        <Image source={item.img} style={styles.navIcon} />
        <Text style={styles.navItemText}>{(item.title).toUpperCase()}</Text>
      </TouchableOpacity>
    )
  }

  onPressLogout = () => {
    this.setState({ isLoading: true })
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
  }

  onPressExitParentProfile = () => {
    try {
      AsyncStorage.setItem(Constants.KEY_ACCESS_AS_PARENTS, '0')
      const navigateAction = StackActions.reset({
        actions: [
          NavigationActions.navigate({ routeName: 'drawerStack' })
        ],
        index: 0,
        key: null
      });
      this.props.navigation.dispatch(navigateAction);
    } catch (error) {
    }
  }

  onPressChangeUser = () => {
    try {      
      this.props.navigation.navigate('GetStartedScreen');    
    } catch (error) {
    }
  }
  //#endregion 

  //#region -> View Render
  render() {
    return (

      <ImageBackground source={this.state.isMenuAsParentPortal ? Images.aside1 : Images.aside} style={styles.sidebar}>
        <SafeAreaView style={styles.SafeAreaView}>
          <ScrollView contentContainerStyle={[styles.ScrollView]} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
            {this.state.objSelectedChild ? <View style={styles.aideHeade}>
              <TouchableOpacity activeOpacity={1} style={styles.selectUser}>
                <View style={styles.avatarWrapper}>
                  <Image source={this.state.objSelectedChild && (this.state.objSelectedChild.profile_pic ?
                    { uri: this.state.objSelectedChild.profile_pic } : Images.userPlaceholder)} style={styles.avatar} />
                </View>
                <View style={styles.userName}>
                  <Text style={styles.userNameText}>{this.state.objSelectedChild && this.state.objSelectedChild.name ?
                    this.state.objSelectedChild.name.toUpperCase() : ''}</Text>
                </View>
              </TouchableOpacity>
            </View> : null}
            <View style={styles.nav}>
              <FlatList keyboardShouldPersistTaps={'always'}
                data={this.state.isMenuAsParentPortal ? Constants.ARR_PARENT_PORTAL_DRAWER : Constants.ARR_DRAWER}
                extraData={this.state}
                keyExtractor={(item, index) => index}
                renderItem={({ item, index }) => this.renderRow(item, index)}
                contentContainerStyle={{ paddingBottom: 130 }}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    )
  }
  //#endregion 
}