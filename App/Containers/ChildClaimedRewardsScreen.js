import React, {Component} from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import Api from '../Services/Api';
import {Colors, Images, Metrics} from '../Themes';
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
    super(props);
    this.state = {
      showDropdown: false,
      claimReward: false,
      noEnoughTokens: false,
      arrReward_original: [],
      arrReward: [],
      objSelectedChild: '',
      showTokenBottomView: false,
    };
  }

  componentDidMount() {
    this.getImageBg();
    super.componentDidMount();
    this.getChildDetail();
    this.navFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        Helper.getChildRewardPoints(this.props.navigation);
      },
    );
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
        this.setState({imageBg: result});
      }
    });
    AsyncStorage.getItem(Constants.NAV_COLOR, (err, result) => {
      if (result) {
        this.props.navigation.setParams({navHeaderColor: result});
      }
    });
  };

  setClaimReward(visible) {
    this.setState({claimReward: visible});
  }

  getChildDetail = () => {
    AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
      if (child != '') {
        const objChild = JSON.parse(child);
        this.setState({objSelectedChild: objChild});
        this.getRewardList(objChild.id);
      }
    });
  };

  claimReward(item) {
    Helper.showConfirmationMessageActions(
      'Are you sure you want to claim this reward?',
      'No',
      'Yes',
      () => {},
      () => this.onActionYes(item),
    );
    
  }

  onActionYes = (item) => {
    mAPi
      .claimReward(
        item.id,
        this.state.objSelectedChild ? this.state.objSelectedChild.id : null,
      )
      .then(response => {
        if (response.ok) {
          if (response.data.success) {
            item.is_claimed = 1;
            this.setState({showTokenBottomView:false});
            Helper.getChildRewardPoints(this.props.navigation);
          } else {
            Helper.showErrorMessage(response.data.message);
          }
        } else {
          Helper.showErrorMessage(response.problem);
        }
      })
      .catch(error => {});
  }

  getRewardList = childId => {
    mAPi
      .childReward(childId)
      .then(response => {
        if (response.ok) {
          if (response.data.success) {
            this.state.arrReward_original = response.data.data;
            Helper.getPaginatedArray(response.data.data, 2, arrReward => {
              this.setState({arrReward});
            });
          } else {
            Helper.showErrorMessage(response.data.message);
          }
        } else {
          Helper.showErrorMessage(response.problem);
        }
      })
      .catch(error => {});
  };

  render() {
    return (
      <View
        style={styles.mainContainer}
        pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        <ImageBackground
          source={this.state.imageBg}
          style={styles.backgroundImage}>
          {/* <ImageBackground source={Images.BgDay} style={styles.backgroundImage}> */}
          <ScrollView contentContainerStyle={styles.ScrollView}>
            <View style={[styles.container]}>
              <View style={styles.clockHeader}>
                <Text style={[styles.h1, styles.textCenter]}>
                  {(
                    (this.state.objSelectedChild
                      ? this.state.objSelectedChild.name
                      : '') + "'s Rewards"
                  ).toUpperCase()}
                </Text>
              </View>
              <FlatList
                keyboardShouldPersistTaps={'always'}
                horizontal={false}
                data={this.state.arrReward}
                extraData={this.state}
                keyExtractor={(item, index) => index + ''}
                renderItem={({item, index}) =>
                  this.renderRowFlatlist(item, index)
                }
              />
            </View>
          </ScrollView>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                showTokenBottomView: !this.state.showTokenBottomView,
              });
            }}
            style={{
              backgroundColor: Colors.pink,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 15,
              borderTopEndRadius: 15,
              borderTopStartRadius: 15,
            }}>
            <Image source={Images.rewardClaim} style={styles1.pigIcon} />
            <Text style={[styles.h1, styles.textCenter, {marginTop: 10}]}>
              TOKENS
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginTop: 15,
                width: '100%',
                display: this.state.showTokenBottomView ? 'flex' : 'none',
              }}>
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  padding: 10,
                  backgroundColor: Colors.darkPink,
                  borderRadius: 10,
                  flex: 0.3,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  source={Constants.standardRewardIcon}
                  style={styles1.tokenIcon}
                />
                <Text style={[styles.h1, styles.textCenter]}>
                  {Constants.standardReward}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  padding: 10,
                  backgroundColor: Colors.darkPink,
                  borderRadius: 10,
                  flex: 0.3,
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: Constants.specialReward > 0 ? 'flex' : 'none',
                }}>
                <Image source={Images.reward} style={styles1.tokenIcon} />
                <Text style={[styles.h1, styles.textCenter]}>
                  {Constants.specialReward}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.bodyClose}
                  onPress={() => {
                    this.setClaimReward(false);
                  }}></TouchableOpacity>
                <View
                  style={{
                    flexDirection: 'column-reverse',
                    zIndex: 1,
                    position: 'relative',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View style={styles.dialog}>
                    <Text style={styles.dialogText}>
                      {'Congratulations \n you have claimed'.toUpperCase()}{' '}
                      <Text style={[styles.dialogText, {fontSize: 30}]}>
                        {'Your Reward'.toUpperCase()}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.dialogOuter}>
                    <Image
                      source={Images.rewardClaim}
                      style={styles.rewardClaim}
                    />
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
                <TouchableOpacity
                  style={styles.bodyClose}
                  onPress={() => {
                    this.setState({noEnoughTokens: false});
                  }}></TouchableOpacity>
                <View
                  style={{
                    flexDirection: 'column-reverse',
                    zIndex: 1,
                    position: 'relative',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View style={styles.dialog}>
                    <Text style={styles.dialogText}>
                      {'You do not have enough tokens \n\n try again soon!'.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.dialogOuter}>
                    {/* <Image source={Images.taskReward} style={styles.rewardClaim} /> */}
                    <Image
                      source={Images.taskReward}
                      style={styles.taskNoEnoughTokens}
                    />
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </View>
    );
  }

  renderRowFlatlist(arrItem, pageIndex) {
    const pagesCount = arrItem.length;
    const pages = [...new Array(pagesCount)].map((item, index) => {
      return this.renderRow(arrItem, index);
    });
    return <View style={styles.rewardGridContainer}>{pages}</View>;
  }

  renderRow(arrItems, index) {
    const item = arrItems[index];
    const tokenDiffrence =
      (item.type == 'Special'
        ? Constants.specialReward
        : Constants.standardReward) / item.no_of_tokens;
    const canClaimReward = item.is_claimed
      ? true
      : tokenDiffrence < 1
      ? true
      : false;

    return (
      <TouchableOpacity
        style={styles.rewardsItem}
        disabled={item?.is_claimed}
        onPress={() =>
          !canClaimReward
            ? this.claimReward(item)
            : this.setState({noEnoughTokens: true})
        }>
        <View
          style={[
            styles.rewardsItemContent,
            {
              backgroundColor: !canClaimReward
                ? Colors.darkYellow
                : Colors.charcoal + 90,
            },
          ]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 5,
            }}>
            <Text
              style={[
                styles.rewardsItemHeader,
                {color: Colors.white, marginBottom: 0},
              ]}>
              {item.name.toUpperCase()}
            </Text>
          </View>
          <View style={styles.rewardItemImageContainer}>
            <Image
              source={item.icon != '' ? {uri: item.icon} : Images.upload}
              style={[
                styles.imagePlaceholder,
                {borderBottomLeftRadius: 10, borderBottomRightRadius: 10},
              ]}
            />
          </View>
          <View style={styles1.rewardInfo}>
            <View style={styles1.rewardDetails}>
              <Image
                source={
                  item.type == 'Special'
                    ? Images.reward
                    : Constants.standardRewardIcon
                }
                style={styles1.icon}
              />
              <Text style={styles1.tokenText}>{item.no_of_tokens}</Text>
            </View>
            <Text style={styles1.rewardType}>
              {item.type == 'Special' ? 'SPECIAL REWARD' : 'EVERYDAY REWARD'}
            </Text>
          </View>
        </View>
        {item.is_claimed ? (
          <View style={styles.rewardOverlay}>
            <Image source={Images.navIcon1} style={styles.ClaimedImage} />
            <Text style={styles.ClaimedText}>{'Claimed'.toUpperCase()}</Text>
          </View>
        ) : null}
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: item?.is_claimed
              ? Colors.restoreGreen
              : Colors.black,
            padding: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={[styles1.rewardType, {color: Colors.white, marginTop: 0}]}>
            {tokenDiffrence < 1 ? (
              'INSUFFICIENT TOKEN'
            ) : (
              <>
                GET FOR {item?.no_of_tokens}
                <Image
                  source={
                    item.type == 'Special'
                      ? Images.reward
                      : Constants.standardRewardIcon
                  }
                  style={[styles1.icon, {marginTop: -3}]}
                />
                TOKEN
              </>
            )}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
  //#endregion
}

const styles1 = StyleSheet.create({
  rewardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  rewardInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: -10,
    paddingVertical: 5,
  },
  rewardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  tokenText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rewardType: {
    fontSize: 14,
    color: '#800080', // Text color
    marginTop: 5,
  },
  deleteIcon: {
    width: 15,
    height: 15,
    // resizeMode: 'contain',
  },
  pigIcon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  tokenIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});
