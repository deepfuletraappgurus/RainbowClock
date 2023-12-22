import React, { Component } from 'react'
import {
  ScrollView, Text, Image, View, ImageBackground, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView
} from 'react-native'
import { Images, Colors, Metrics } from '../Themes'

import * as Helper from '../Lib/Helper'
import Constants from '../Components/Constants';

// Styles
import styles from './Styles/LaunchScreenStyles'
import BaseComponent from '../Components/BaseComponent';

// Global Variables

export default class ParentsProfileScreen extends BaseComponent {

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
      console.log('Promise is rejected with error: ' + error);
    });
  }
  //#endregion

  //#region -> Class Methods
  moveToParentsUpdateProfile = () => {
    this.props.navigation.navigate('ParentsUpdateProfileScreen')
  }
  //#endregion 

  //#region -> View Render
  render() {
    return (
      <View style={styles.mainContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        <ImageBackground source={Images.blueBackground} style={styles.backgroundImage}>
          <KeyboardAvoidingView style={styles.mainContainer} behavior={"padding"}>
            <SafeAreaView style={styles.SafeAreaView}>
              <ScrollView contentContainerStyle={styles.ScrollView}>
                <View style={[styles.container, styles.center]}>
                  <View style={styles.form}>
                    <View style={styles.formControl}>
                      <Image source={Images.user} style={styles.inputIcon} />
                      <TextInput
                        value={this.state.username.toUpperCase()}
                        autoCapitalize='characters'
                        editable={false}
                        style={styles.input}
                        placeholder={'USERNAME'}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={'#fff'}
                      />
                    </View>
                    <View style={styles.formControl}>
                      <Image source={Images.inbox} style={styles.inputIcon} />
                      <TextInput
                        value={this.state.email.toUpperCase()}
                        autoCapitalize='characters'
                        editable={false}
                        style={styles.input}
                        placeholder={'EMAIL'}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={'#fff'}
                      />
                    </View>
                    
                    <View style={styles.formFooter}>
                    
                      <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => this.moveToParentsUpdateProfile()}>
                        <Text style={styles.buttonText}>{'UPDATE PROFILE'}</Text>
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
