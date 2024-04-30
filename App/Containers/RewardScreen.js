import React, { Component } from 'react';
import { Image, ImageBackground, Text, TouchableOpacity, View,ScrollView } from 'react-native';
import Api from '../Services/Api';
import { Colors, Images, Metrics } from '../Themes';
// Styles
import styles from './Styles/RewardScreenStyles';
import BaseComponent from '../Components/BaseComponent';
import { FlatList } from 'react-native-gesture-handler';
import Constants from '../Components/Constants';
import * as Helper from "../Lib/Helper";
import Spinner from '../Components/Spinner';
 
// Global Variables
const mAPi = Api.createSecure();


export default class RewardScreen extends BaseComponent {

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
            arrReward: [],
            showDropdown: false,
            imageData: '',
            saveLoading: false,
            isUpdateReward: false,
            updateItem: '',
            updateIndex: -1,
        }
    }
    getRewardList = () => {
        mAPi.parentRewardList().then(response => {
            if (response.ok) {
                if (response.data.success) {
                    this.setState({ arrReward: response.data.data })
                } else {
                    Helper.showErrorMessage(response.data.message)
                }
            } else {
                Helper.showErrorMessage(response.problem)
            }
        }).catch(error => {
        })
    }

    onPressClearReward = (item, index) => {
        item.clearLoading = true
        this.setState({})
        mAPi.clearReward(item.id).then(response => {
            item.clearLoading = false
            this.setState({})
            if (response.ok) {
                if (response.data.success) {
                    item.is_claimed = 0
                    this.setState({})
                } else {
                    Helper.showErrorMessage(response.data.message)
                }
            } else {
                Helper.showErrorMessage(response.problem)
            }
        })
    }

    onUpdate = (item, index, visible) => {
        Helper.getChildRewardPoints(this.props.navigation);
        this.setState({
            updateItem: item,
            updateIndex: index,
            isUpdateReward: visible,
            imageData: ''
        })
    }
    componentDidMount(){
        super.componentDidMount()
        this.getRewardList()
        this.navFocusListener =  this.props.navigation.addListener('didFocus', () => {
            Helper.getChildRewardPoints(this.props.navigation)
            this.getRewardList()
          });
    }
    // componentWillUnmount() {
    //     this.navFocusListener.remove();
    // }

    toggleDropdown() {
        this.setState({ showDropdown: !this.state.showDropdown });
    }

    //#region -> View Render
    renderRow(item, index) {
        return (
            <TouchableOpacity style={styles.dropdownItem} onPress={() => this.categorySelected(item)}>
                <Text style={[styles.dropdownItemText]}>MONDAY 12 OCTOBER 2018</Text>
            </TouchableOpacity>
        )
    }

    renderRewardRow = (item, index) => {
        return (
            <TouchableOpacity style={styles.rewardsItem} onPress={() => this.onUpdate(item, index, true)}>
                <View style={styles.rewardsItemContent}>
                    <Text style={styles.rewardsItemHeader}>{item.name.toUpperCase()}</Text>
                    <View style={styles.rewardItemImageContainer}>
                        <Image source={item.icon != '' ? { uri: item.icon } : Images.upload} style={styles.imagePlaceholder} />
                    </View>
                    <Text style={styles.specialRewardText}>{item.type == "Special" ? 'SPECIAL REWARD' : ''}</Text>
                    <View style={styles.rewardsItemFooter}>
                        <View style={styles.rewardRating}>
                            <Image source={item.type == "Special" ? Images.reward : Constants.standardRewardIcon} style={styles.rewardIcon} />
                            <Text style={styles.rewardText}>{item.no_of_tokens}</Text>
                        </View>
                        <TouchableOpacity style={styles.rewardClear} onPress={() => {
                            if (item.is_claimed == 1) {
                                this.onPressClearReward(item, index)
                            }
                        }}>
                            <View style={item.is_claimed == 1 ? null : styles.disable}>
                                {item.clearLoading ?
                                    <Spinner size='small' color={Colors.snow} />
                                    :
                                    <Text style={styles.rewardClearText}>{'Clear Reward'.toUpperCase()}</Text>
                                }
                            </View>
                        </TouchableOpacity>
                    </View>
                </View >
            </TouchableOpacity >
        )
    }
    render() {
        return (
            <View style={styles.mainContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
                <ImageBackground source={Images.blueBackground} style={styles.backgroundImage}>
                <ScrollView contentContainerStyle={styles.ScrollView} onRefresh={() => this.getRewardList()}>
                    <View style={[styles.container]}>
                        <View style={styles.clockHeader}>
                            <Text style={[styles.h1, styles.textCenter]}>{'Reward'.toUpperCase()}</Text>
                        </View> 
                        <FlatList
                                contentContainerStyle={styles.rewardGridContainer}
                                numColumns={2}
                                data={this.state.arrReward}
                                keyExtractor={(item, index) => (index + '')}
                                renderItem={({ item, index }) => this.renderRewardRow(item, index)}
                                extraData={this.state}
                                onRefresh={() => this.getRewardList()}
                            // numColumns={2}
                            />
                        <View style={[styles.center, { flex: 1 }]}>
                            {/* <Image source={Images.alarmClock} style={styles.alarmClock} /> */}
                            <View style={{ paddingLeft: 30, paddingRight: 30, width: '100%', position: 'absolute', bottom:0,left:0,}}>
                                <TouchableOpacity style={[styles.button, styles.buttonPrimary, { marginBottom: 0 }]} onPress={() => this.props.navigation.navigate('CreateRewardScreen')}>
                                    <Text style={styles.buttonText}>{'Create A Reward'.toUpperCase()}</Text>
                                </TouchableOpacity>
                                {/* <TouchableOpacity style={[styles.button, styles.buttonCarrot, { marginBottom: 0 }]} onPress={() => this.props.navigation.navigate('ClaimedRewardsScreen')}>
                                    <Text style={styles.buttonText}>{'Claimed Reward'.toUpperCase()}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.buttonBlue, { marginBottom: 0 }]} onPress={() => this.props.navigation.navigate('EditRewardsScreen')}>
                                    <Text style={styles.buttonText}>{'Edit Reward'.toUpperCase()}</Text>
                                </TouchableOpacity> */}
                            </View>

                        </View>
                    </View>
                    </ScrollView>
                </ImageBackground>

            </View>
        )
    }
    //#endregion
}
