import React, { Component } from 'react';
import { Image, ImageBackground, Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View, FlatList } from 'react-native';
import Api from '../Services/Api';
import { Colors, Images, Metrics } from '../Themes';
import BaseComponent from '../Components/BaseComponent';
import * as Helper from '../Lib/Helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from '../Components/Constants';
 

// Styles
import styles from './Styles/ChildClaimedRewardsScreenStyles';

// Global Variables
const mAPi = Api.createSecure();
const objSecureAPI = Api.createSecure();

export default class ChildClaimedRewardsScreen extends BaseComponent {


    //constructor event
    constructor(props) {
        super(props)
        this.state = {
            showDropdown: false,
            claimReward: false,
            noEnoughTokens: false,
            arrReward_original: [],
            arrReward: [],
            objSelectedChild: ''
        }
    }

    componentDidMount() {
        this.getImageBg()
        super.componentDidMount()
        this.getChildDetail()
        this.navFocusListener =  this.props.navigation.addListener('didFocus', () => {
            Helper.getChildRewardPoints(this.props.navigation)
          });
    }
    // componentWillUnmount() {
    //     this.navFocusListener.remove();
    // }

    getImageBg = () => {
        // Helper.getBackgroudImageTwelveHrsOnly((image, navHeaderColor) => {
        //   this.props.navigation.setParams({ navHeaderColor });
        //   this.setState({ imageBg: image })
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

    setClaimReward(visible) {
        this.setState({ claimReward: visible });
    }

    getChildDetail = () => {
        AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
            if (child != '') {
                const objChild = JSON.parse(child)
                this.setState({ objSelectedChild: objChild });
                this.getRewardList(objChild.id)
            }
        })
    }

    claimReward(item) {
        mAPi.claimReward(item.id, this.state.objSelectedChild ? this.state.objSelectedChild.id : null).then(response => {
            if (response.ok) {
                if (response.data.success) {
                    item.is_claimed = 1
                    this.setState({})
                } else {
                    Helper.showErrorMessage(response.data.message)
                }
            } else {
                Helper.showErrorMessage(response.problem)
            }
        }).catch(error => {
        })
    }

    getRewardList = (childId) => {
        mAPi.childReward(childId).then(response => {
            if (response.ok) {
                if (response.data.success) {
                    this.state.arrReward_original = response.data.data
                    Helper.getPaginatedArray(response.data.data, 2, (arrReward) => {
                        this.setState({ arrReward })
                    })
                } else {
                    Helper.showErrorMessage(response.data.message)
                }
            } else {
                Helper.showErrorMessage(response.problem)
            }
        }).catch(error => {
        })
    }

    render() {
        return (
            <View style={styles.mainContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
                <ImageBackground source={this.state.imageBg} style={styles.backgroundImage}>
            {/* <ImageBackground source={Images.BgDay} style={styles.backgroundImage}> */}
                    <ScrollView contentContainerStyle={styles.ScrollView}>
                        <View style={[styles.container]}>
                            <View style={styles.clockHeader}>
                                <Text style={[styles.h1, styles.textCenter]}>{((this.state.objSelectedChild ? this.state.objSelectedChild.name : '') + '\'s Rewards').toUpperCase()}</Text>
                            </View>
                            <FlatList
                                keyboardShouldPersistTaps={'always'}
                                horizontal={false}
                                data={this.state.arrReward}
                                extraData={this.state}
                                keyExtractor={(item, index) => (index + '')}
                                renderItem={({ item, index }) => this.renderRowFlatlist(item, index)}
                            />

                        </View>
                    </ScrollView>
                </ImageBackground>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.claimReward}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                    }}>
                    <View style={styles.blueTransparent}>
                        <SafeAreaView style={styles.SafeAreaView}>
                            <View style={[styles.dialogContainer]}>
                                <TouchableOpacity style={styles.bodyClose} onPress={() => {
                                    this.setClaimReward(false);
                                }}></TouchableOpacity>
                                <View style={{ flexDirection: 'column-reverse', zIndex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={styles.dialog}>
                                        <Text style={styles.dialogText}>{'Congratulations \n you have claimed'.toUpperCase()} <Text style={[styles.dialogText, { fontSize: 30 }]}>{'Your Reward'.toUpperCase()}</Text></Text>
                                    </View>
                                    <View style={styles.dialogOuter}>
                                        <Image source={Images.rewardClaim} style={styles.rewardClaim} />
                                    </View>
                                </View>
                            </View>
                        </SafeAreaView>
                    </View>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.noEnoughTokens}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                    }}>
                    <View style={styles.blueTransparent}>
                        <SafeAreaView style={styles.SafeAreaView}>
                            <View style={[styles.dialogContainer]}>
                                <TouchableOpacity style={styles.bodyClose} onPress={() => {
                                    this.setState({ noEnoughTokens: false })
                                }}></TouchableOpacity>
                                <View style={{ flexDirection: 'column-reverse', zIndex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={styles.dialog}>
                                        <Text style={styles.dialogText}>{'You do not have enough tokens \n\n try again soon!'.toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.dialogOuter}>
                                        {/* <Image source={Images.taskReward} style={styles.rewardClaim} /> */}
                                        <Image source={Images.taskReward} style={styles.taskNoEnoughTokens} />
                                    </View>
                                </View>
                            </View>
                        </SafeAreaView>
                    </View>
                </Modal>
            </View>
        )
    }

    renderRowFlatlist(arrItem, pageIndex) {
        const pagesCount = arrItem.length;
        const pages = [...new Array(pagesCount)].map((item, index) => {
            return this.renderRow(arrItem, index);
        });
        return (
            <View style={styles.rewardGridContainer}>
                {pages}
            </View>
        )
    }

    renderRow(arrItems, index) {
        const item = arrItems[index]
        const tokenDiffrence = ((item.type == "Special" ? Constants.specialReward : Constants.standardReward) * 100) / item.no_of_tokens
        const canClaimReward = item.is_claimed ? true : tokenDiffrence >= 100 ? true : false
        
        
        return (
            <View style={styles.rewardsItem}>
                <View style={styles.rewardsItemContent}>
                    <Text style={styles.rewardsItemHeader}>{item.name.toUpperCase()}</Text>
                    <View style={styles.rewardItemImageContainer}>
                        <Image source={{ uri: item.icon }} style={styles.imagePlaceholder} />
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressComplete, { width: item.is_claimed == 1 ? '100%' : tokenDiffrence + '%' }]}></View>
                    </View>
                    <Text style={styles.specialRewardText}>{item.type == "Special" ? 'SPECIAL REWARD' : ''}</Text>
                    <View style={styles.rewardsItemFooter}>
                        <TouchableOpacity activeOpacity={1} style={styles.rewardRating}>
                            <Image source={item.type == "Special" ? Images.reward:Constants.standardRewardIcon} style={styles.rewardIcon} />
                            <Text style={styles.rewardText}>{item.no_of_tokens}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.rewardClear} onPress={() => {
                            canClaimReward ? this.claimReward(item) : this.setState({ noEnoughTokens: true })
                        }}>
                            <Text style={styles.rewardClearText}>{'Claim Reward'.toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {item.is_claimed ?
                    <View style={styles.rewardOverlay}>
                        <Image source={Images.navIcon1} style={styles.ClaimedImage} />
                        <Text style={styles.ClaimedText}>{'Claimed'.toUpperCase()}</Text>
                    </View>
                    : null}
            </View>
        )
    }
    //#endregion
}
