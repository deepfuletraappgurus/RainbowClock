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
  ActivityIndicator,
  Pressable,
  Animated,
} from 'react-native';
import Api from '../Services/Api';
import {Colors, Images, Metrics} from '../Themes';
import BaseComponent from '../Components/BaseComponent';
import * as Helper from '../Lib/Helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from '../Components/Constants';
import LinearGradient from 'react-native-linear-gradient';

// Styles
import styles from './Styles/ChildClaimedRewardsScreenStyles';
import colors from '../Themes/Colors';

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
      isLoading: true,
      tokenCounts: {},
      handAnimation: new Animated.Value(0),
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
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.handAnimation, {
          toValue: 1,
          duration: 500, // Half a second
          useNativeDriver: true,
        }),
        Animated.timing(this.state.handAnimation, {
          toValue: 0,
          duration: 500, // Half a second
          useNativeDriver: true,
        }),
      ]),
      {
        iterations: 6, // Run for 3 seconds (6 iterations * 0.5s)
      },
    ).start();
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

  onActionYes = item => {
    mAPi
      .claimReward(
        item.id,
        this.state.objSelectedChild ? this.state.objSelectedChild.id : null,
      )
      .then(response => {
        if (response.ok) {
          if (response.data.success) {
            item.is_claimed = 1;
            this.setState({showTokenBottomView: false});
            Helper.getChildRewardPoints(this.props.navigation);
          } else {
            Helper.showErrorMessage(response.data.message);
          }
        } else {
          Helper.showErrorMessage(response.problem);
        }
      })
      .catch(error => {});
  };

  getRewardList = childId => {
    this.setState({isLoading: true});
    mAPi
      .childReward(childId)
      .then(response => {
        console.log('REWWWWWWWWWWWW', JSON.stringify(response.data.data));
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
      .catch(error => {})
      .finally(() => {
        this.setState({isLoading: false});
      });
  };

  handleRewardPress = item => {
    const {tokenCounts} = this.state;
    const currentTokenCount = tokenCounts[item.id] || 0;
    const tokenDiffrence =
      (item.type == 'Special'
        ? Constants.specialReward / currentTokenCount
        : Constants.standardReward) / currentTokenCount;

    if (tokenDiffrence <= 1) {
      this.setState({noEnoughTokens: true});
    } else if (currentTokenCount < item.no_of_tokens) {
      // Increment token count
      this.setState(
        prevState => ({
          tokenCounts: {
            ...prevState.tokenCounts,
            [item.id]: currentTokenCount + 1,
          },
        }),
        () => {
          // Check if tokens reached the limit
          if (this.state.tokenCounts[item.id] === item.no_of_tokens) {
            Alert.alert(
              'Congratulations!',
              'You have reached the token limit!',
              [{text: 'OK'}],
            );
          }
        },
      );
    } else {
      this.claimReward(item);
    }
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
              {this.state.isLoading ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ActivityIndicator
                    color={colors.white}
                    size={30}
                    style={{zIndex: 1000}}
                  />
                  <Text style={[styles.buttonText]}>Fetching Rewards...</Text>
                </View>
              ) : (
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
              )}
            </View>
          </ScrollView>
          <LinearGradient
            colors={[colors.transparent, colors.pink]} // Transparent at the top to pink at the bottom
            start={{x: 0.5, y: 0}} // Start at the top center
            end={{x: 0.5, y: 0.6}} // End the gradient a bit earlier to show more pink
            style={{
              paddingVertical: 15,
              borderTopEndRadius: 15,
              borderTopStartRadius: 15,
              alignItems: 'center', // Center align items horizontally
            }}>
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  showTokenBottomView: !this.state.showTokenBottomView,
                });
              }}
              style={{
                backgroundColor: 'transparent', // Make sure background color is transparent to show gradient
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 15,
                width: '100%', // Ensure it spans the full width
              }}>
              <Image source={Images.rewardClaim} style={styles1.pigIcon} />
              <View style={{width: '100%'}}>
                <Text style={[styles.h1, styles.textCenter, {marginTop: 10}]}>
                  TOKENS EARNED
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  paddingTop: 15,
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
          </LinearGradient>
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
        activeOpacity={1}>
        <View
          style={[
            styles.rewardsItemContent,
            {
              backgroundColor: !canClaimReward
                ? Colors.darkYellow
                : Colors.white + 90,
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
            <Pressable
              hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
              onPress={() => this.handleRewardPress(item)}
              style={styles1.rewardDetails}>
              <Image
                source={
                  item.type == 'Special'
                    ? Images.reward
                    : Constants.standardRewardIcon
                }
                style={styles1.icon}
              />
              <Text style={styles1.tokenText}>
                {this.state.tokenCounts[item.id] || 0}
              </Text>
            </Pressable>
            {!item.is_claimed && (
              <Animated.View
                style={[
                  styles1.handImageContainer,
                  {
                    opacity: this.state.handAnimation, // Fade in/out
                    transform: [
                      {
                        scale: this.state.handAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2], // Scale up slightly
                        }),
                      },
                    ],
                  },
                ]}>
                <Image source={Images.finger} style={styles1.handImage} />
              </Animated.View>
            )}
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
            backgroundColor: Colors.black,
            padding: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={[styles1.rewardType, {color: Colors.white, marginTop: 0}]}>
            Claim FOR {item?.no_of_tokens}
            <Image
              source={
                item.type == 'Special'
                  ? Images.reward
                  : Constants.standardRewardIcon
              }
              style={[styles1.icon, {marginTop: -3}]}
            />
            TOKEN
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
    width: 17,
    height: 17,
    // marginRight: 5,
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
  handImageContainer: {
    position: 'absolute',
    top: 10, // Adjust to position above the Pressable
    left: '40%', // Center it over the Pressable
    zIndex: 1000,
  },
  handImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
