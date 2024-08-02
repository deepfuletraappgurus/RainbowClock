import React, {Component} from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Api from '../Services/Api';
import {Colors, Images, Metrics} from '../Themes';
// Styles
import styles from './Styles/RewardScreenStyles';
import BaseComponent from '../Components/BaseComponent';
import {FlatList} from 'react-native-gesture-handler';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Spinner from '../Components/Spinner';
import RBSheet from 'react-native-raw-bottom-sheet';
import colors from '../Themes/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Global Variables
const mAPi = Api.createSecure();

export default class RewardScreen extends BaseComponent {
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
      arrReward: [],
      showDropdown: false,
      imageData: '',
      saveLoading: false,
      isUpdateReward: false,
      updateItem: '',
      updateIndex: -1,
      deleteItem: '',
      deleteRewardLoading: false,
      objSelectedChild: '',
    };
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

  getRewardList = () => {
    mAPi
      .parentRewardList()
      .then(response => {
        if (response.ok) {
          if (response.data.success) {
            console.log('response.data.data', response.data.data);
            this.setState({arrReward: response.data.data});
          } else {
            Helper.showErrorMessage(response.data.message);
          }
        } else {
          Helper.showErrorMessage(response.problem);
        }
      })
      .catch(error => {});
  };

  onPressClearReward = (item, index) => {
    item.clearLoading = true;
    this.setState({});
    mAPi.clearReward(item.id).then(response => {
      item.clearLoading = false;
      this.setState({});
      if (response.ok) {
        if (response.data.success) {
          item.is_claimed = 0;
          this.setState({});
        } else {
          Helper.showErrorMessage(response.data.message);
        }
      } else {
        Helper.showErrorMessage(response.problem);
      }
    });
  };

  onUpdate = (item, index, visible) => {
    Helper.getChildRewardPoints(this.props.navigation);
    this.setState({
      updateItem: item,
      updateIndex: index,
      isUpdateReward: visible,
      imageData: '',
    });
  };
  componentDidMount() {
    super.componentDidMount();
    this.getRewardList();
    this.getChildDetail();
    this.navFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        Helper.getChildRewardPoints(this.props.navigation);
        this.getRewardList();
      },
    );
  }
  // componentWillUnmount() {
  //     this.navFocusListener.remove();
  // }

  toggleDropdown() {
    this.setState({showDropdown: !this.state.showDropdown});
  }

  async onDeleteYesPress() {
    console.log('DELETE REWARD CALL', this.state.deleteItem.id);
    try {
      this.setState({
        deleteRewardLoading: true,
      });
      const response = await mAPi.deleteReward(this.state.deleteItem.id);
      console.log('RRRRRR', response);
      if (response.ok) {
        if (response.data.success) {
          this.setState({
            deleteItem: '',
            deleteRewardLoading: false,
          });
          this.RBSheetTimer.close();
          this.getRewardList();
        } else {
          this.setState({
            deleteItem: '',
            deleteRewardLoading: false,
          });
          this.RBSheetTimer.close();
          Helper.showErrorMessage(response.data.message);
        }
      } else {
        this.setState({
          deleteItem: '',
          deleteRewardLoading: false,
        });
        this.RBSheetTimer.close();
        Helper.showErrorMessage(response.problem);
      }
    } catch (error) {
      this.setState({
        deleteItem: '',
        deleteRewardLoading: false,
      });
      this.RBSheetTimer.close();
      console.error('Error deleting reward:', error);
      Helper.showErrorMessage('An error occurred while deleting the reward.');
    }
  }

  //#region -> View Render
  renderRow(item, index) {
    return (
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => this.categorySelected(item)}>
        <Text style={[styles.dropdownItemText]}>MONDAY 12 OCTOBER 2018</Text>
      </TouchableOpacity>
    );
  }

  renderRewardRow = (item, index) => {
    console.log('ITEM', item);
    return (
      <TouchableOpacity
        style={styles.rewardsItem}
        onPress={() => this.onUpdate(item, index, true)}>
        <View
          style={[
            styles.rewardsItemContent,
            {
              backgroundColor: !item?.is_claimed
                ? Colors.darkYellow
                : colors.charcoal + 90,
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
            <TouchableOpacity
              onPress={() => {
                this.setState({deleteItem: item}, () => {
                  this.RBSheetTimer?.open();
                });
              }}
              style={{
                backgroundColor: Colors.fire,
                padding: 5,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 15,
              }}>
              <Image style={[styles1.deleteIcon]} source={Images.bin} />
            </TouchableOpacity>
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
            <Text style={[styles1.rewardType,{color:item.is_claimed ? Colors.fire : colors.pink}]}>
              {item?.is_claimed ? 'CLAIMED REWARD' : item.type == 'Special' ? 'SPECIAL REWARD' : 'EVERYDAY REWARD'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (item?.is_claimed) {
              Helper.showConfirmationMessageActions(
                'Are you sure you want to recover this schedule?',
                'No',
                'Yes',
                () => {},
                () => this.onPressClearReward(item),
              );
              
            } else {
              this.props.navigation.navigate('EditRewardScreen', {
                rewardDetail: item,
              });
            }
          }}
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
            {item?.is_claimed ? 'RECOVER' : 'EDIT REWARD'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  renderDeleteBottomSheet = () => {
    return (
      <View style={{flex: 1, paddingTop: 10}}>
        <Text style={{textAlign: 'center', fontSize: 18, fontWeight: '600'}}>
          DELETE
        </Text>
        <Text
          style={[
            styles.dropdownButtonText,
            {marginTop: 10, textAlign: 'center'},
          ]}>
          Are you sure you want to remove this reward?
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: 'white',
                flex: 0.45,
                borderWidth: 1,
                borderColor: Colors.black,
                marginBottom: 0,
              },
            ]}
            onPress={() => this.RBSheetTimer?.close()}>
            <Text style={[styles.buttonText, {color: Colors.black}]}>
              {'No'.toUpperCase()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonPrimary,
              {marginBottom: 0, flex: 0.45},
            ]}
            onPress={() => this.onDeleteYesPress()}>
            {this.state.deleteRewardLoading ? (
              <Spinner color={'#FFFFFF'} size={'small'} />
            ) : (
              <Text style={styles.buttonText}>{'yes'.toUpperCase()}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  render() {
    return (
      <View
        style={styles.mainContainer}
        pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        <ImageBackground
          source={Images.blueBackground}
          style={styles.backgroundImage}>
          <ScrollView
            contentContainerStyle={styles.ScrollView}
            onRefresh={() => this.getRewardList()}>
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
                contentContainerStyle={styles.rewardGridContainer}
                numColumns={2}
                data={this.state.arrReward}
                keyExtractor={(item, index) => index + ''}
                renderItem={({item, index}) =>
                  this.renderRewardRow(item, index)
                }
                extraData={this.state}
                onRefresh={() => this.getRewardList()}
                // numColumns={2}
              />
              <View style={[styles.center, {flex: 1}]}>
                {/* <Image source={Images.alarmClock} style={styles.alarmClock} /> */}
                <View
                  style={{
                    paddingLeft: 30,
                    paddingRight: 30,
                    width: '100%',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                  }}>
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
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonPrimary,
              {width: '90%', alignSelf: 'center'},
            ]}
            onPress={() =>
              this.props.navigation.navigate('CreateRewardScreen')
            }>
            <Text style={styles.buttonText}>
              {'Create A Reward'.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </ImageBackground>

        <RBSheet
          ref={ref => {
            this.RBSheetTimer = ref;
          }}
          height={Dimensions.get('window').height / 5.4}
          width={Dimensions.get('window').width}
          openDuration={250}>
          {this.renderDeleteBottomSheet()}
        </RBSheet>
      </View>
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
});
