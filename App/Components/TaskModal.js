import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
  BackHandler,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import EventEmitter from '../Lib/EventEmitter';
import Constants from './Constants';
import * as Helper from '../Lib/Helper';
import {Images, Colors, Fonts} from '../Themes';
import {PieChart} from 'react-native-svg-charts';
import Api from '../Services/Api';
import {CountdownCircleTimer} from 'react-native-countdown-circle-timer';
import FastImage from 'react-native-fast-image';

// Global Variables
const objSecureAPI = Api.createSecure();

// Styles
import styles from '../Containers/Styles/HomeScreenStyles';
import moment from 'moment';
import BaseComponent from './BaseComponent';
import colors from '../Themes/Colors';

export default class TaskModal extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: this.props.visible ? this.props.visible : false,
      objFooterSelectedTask: this.props.objFooterSelectedTask,
      objSelectedChild: this.props.objSelectedChild,
      loading: false,
      currentTaskRemainTime: 0,
      playing: false,
      buttonText:
        this.props.objFooterSelectedTask.task_time == null
          ? 'START TIME'
          : this.props.objFooterSelectedTask.start_time
          ? 'START TIME'
          : 'PAUSE TIME',
      counterVisible: false,
      reward: '',
      task_id: this.props.objFooterSelectedTask?.sub_task_id,
      is_new: this.props.objFooterSelectedTask?.is_new,
      showSuccess: false,
      showSuccessModal: false,
      calenderSelectedDay: this.props?.calenderSelectedDay,
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentWillMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  handleBackButtonClick() {
    this.state.objFooterSelectedTask.start_time = null;
    this.setModal(false);
    setTimeout(() => {
      Helper.getChildRewardPoints(this.props.navigation);
    }, 300);
    return true;
  }

  componentWillReceiveProps(props) {
    console.log('===================OBJ--', props.calenderSelectedDay);
    this.setState({
      visible: props.visible,
      objFooterSelectedTask: props.objFooterSelectedTask,
      objSelectedChild: props?.objSelectedChild,
      task_id: props.objFooterSelectedTask?.sub_task_id,
      is_new: props.objFooterSelectedTask?.is_new,
      buttonText:
        props.objFooterSelectedTask?.task_time == null
          ? 'START TIME'
          : props.objFooterSelectedTask?.start_time
          ? 'START TIME'
          : 'PAUSE TIME',
      calenderSelectedDay: moment(props?.calenderSelectedDay ?? new Date()),
    });
  }
  componentWillUnmount() {
    clearInterval(this._timer);
    // this.navFocusListener.remove();
  }

  setModal = visible => {
    if (!visible) {
      clearInterval(this._timer);
      // setTimeout(() => {
      // this._timer = null
      // }, 100);
    }
    this.setState({visible: visible});
    if (this?.props?.closeParentModal instanceof Function) {
      this?.props?.closeParentModal();
    }
    if (this?.props?.onClose instanceof Function) {
      this?.props?.onClose();
    }
    this.props.onStateChange(visible);
  };

  pauseTask = () => {
    if (Helper.checkTaskTimeAndDate(this.state.objFooterSelectedTask)) {
      Helper.showErrorMessage(Constants.MESSAGE_NO_FUTURE_TASK);
      // this.navFocusListener =  this.props.navigation.addListener('didFocus', () => {
      //   Helper.getChildRewardPoints(this.props.navigation)
      // });
    } else {
      if (this.state.visible && this.state.playing) {
        this.setState({playing: false});
        // this.setState({counterVisible: false})
        this.setState({buttonText: 'RESUME TASK'});
      }

      if (this.state.visible && !this.state.playing) {
        this.setState({playing: true});
        // this.setState({counterVisible: false})
        this.setState({buttonText: 'PAUSE TASK'});
      }
    }
  };

  completeTask = taskStatus => {
    console.log('AAAAAAAAAAAAAAAAAAA');
    if (Helper.checkTaskTimeAndDate(this.state.objFooterSelectedTask)) {
      Helper.showErrorMessage(Constants.MESSAGE_NO_FUTURE_TASK);
      // this.navFocusListener =  this.props.navigation.addListener('didFocus', () => {
      //   Helper.getChildRewardPoints(this.props.navigation)
      // });
    } else {
      if (this.state.objSelectedChild.points.special != 0) {
        this.state.reward =
          this.state.objSelectedChild.points.special.toString();
      } else {
        this.state.reward =
          this.state.objSelectedChild.points.standard.toString();
      }

      this.callStartTask(taskStatus, true);
      this, this.setState({playing: true});
    }
  };
  onActionOK = () => {
    clearInterval(this._timer);
    this.setState({visible: false});
    this.setState({showSuccessModal: false});
    // this?.props?.closeParentModal();
    this.setModal(false);
    this.props.onStateChange(false);
    Helper.getChildRewardPoints(this.props.navigation);
  };

  callStartTask = (taskStatus, showAnimation) => {
    console.log('AKSKSKSKSKKSKSKSKSKSKS', this.state.calenderSelectedDay);
    const givenDateTime = moment(this.state.calenderSelectedDay);

    // Get the current date and time
    const now = moment();

    // Compare the given datetime with the current datetime
    if (givenDateTime.isAfter(now)) {
      Helper.showErrorMessage(Constants.MESSAGE_NO_FUTURE_TASK);
    } else {
      if (Helper.checkTaskTimeAndDate(this.state.objFooterSelectedTask)) {
        Helper.showErrorMessage(Constants.MESSAGE_NO_FUTURE_TASK);
      } else {
        objSecureAPI
          .updateTaskStatus(
            this.state.task_id,
            this.state.objSelectedChild.id,
            taskStatus,
            this.state.is_new,
            moment(this.state.calenderSelectedDay).format('YYYY-MM-DD'),
          )
          .then(response => {
            console.log('responseeeeee', response);
            if (response.ok) {
              if (response.data.success) {
                this.setState({
                  task_id: response.data.data[0]['updated_task']['id'],
                  is_new: response.data.data[0]['updated_task']['is_new'],
                });
                this.setState({playing: true});
                if (taskStatus == Constants.TASK_STATUS_COMPLETED) {
                  this.state.objFooterSelectedTask.status =
                    Constants.TASK_STATUS_COMPLETED;
                  EventEmitter.emit(Constants.EVENT_CHILD_UPDATE);
                  clearInterval(this._timer);
                  if (showAnimation) {
                    this.setState({showSuccess: true});
                    this.timer = setTimeout(() => {
                      this.setState({showSuccess: false});
                      this.setState({showSuccessModal: true});
                    }, 3000);
                  }
                  // this.setModal(false)
                  // this.setState({counterVisible: true})
                } else {
                  this.setRemainTime();
                  this.state.objFooterSelectedTask.start_time =
                    Helper.getCurrentUTCTime('YYYY-MM-DD HH:mm:ss');
                }
                this.setState({});
              } else {
                Helper.showErrorMessage(response.data.message);
              }
            } else {
              Helper.showErrorMessage(response.problem);
            }
          })
          .catch(error => {
            console.log('EEEEEE', error);
          });
      }
    }
  };

  setRemainTime() {
    if (!this._timer) {
      this._timer = setInterval(() => {
        let remainTime = Helper.getPercentageArrForTask(
          this.state.objFooterSelectedTask,
        )[0];

        if (remainTime > this.state.currentTaskRemainTime) {
          this.state.currentTaskRemainTime = remainTime;
          this.setState({});
        }
      }, 1000);
    }
  }

  renderMiniClockView() {
    const data = Helper.getPercentageArrForTask(
      this.state.objFooterSelectedTask,
    );
    if (!this._timer) {
      // this.setRemainTime()
    }
    const pieData = data.map((value, index) => ({
      value,
      svg: {
        fill: [Colors.clear, Colors.blue][index],
        onPress: () => {},
      },
      key: `pie-${index}`,
      index: index,
    }));
    const taskTime = this.state.objFooterSelectedTask?.task_time * 60;
    // cons
    return (
      <CountdownCircleTimer
        isPlaying={this.state.playing}
        duration={taskTime}
        colors="#6BC4FE"
        onComplete={() => {
          // do your stuff here
          return {shouldRepeat: false, delay: 1.5}; // repeat animation in 1.5 seconds
        }}>
        {({remainingTime}) => {
          const minutes = Math.floor(remainingTime / 60);
          const seconds = remainingTime % 60;
          return (
            <>
              <Text
                style={[
                  styles.minComplete,
                  styles.textCenter,
                ]}>{`${minutes}:${seconds}`}</Text>
              <Text style={[styles.SmallLabel, styles.textCenter]}>
                {'MIN'}
              </Text>
            </>
          );
        }}
      </CountdownCircleTimer>
    );
  }

  render() {
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.visible}
          style={{justifyContent: 'center', alignItems: 'center', flex: 1}}
          onRequestClose={() => {
            // this.state.objFooterSelectedTask.start_time = null
            this.state.objFooterSelectedTask.start_time = null;
            this.setModal(false);
            setTimeout(() => {
              Helper.getChildRewardPoints(this.props.navigation);
            }, 300);
          }}>
          <View style={styles.modal}>
            <SafeAreaView style={styles.SafeAreaView}>
              <TouchableOpacity
                style={styles.modalCloseTouch}
                onPress={() => {
                  this.state.objFooterSelectedTask.start_time = null;
                  this.setState({showSuccess: false});
                  clearInterval(this.timer);
                  this.setState({showSuccessModal: false});
                  this.setModal(false);
                  setTimeout(() => {
                    Helper.getChildRewardPoints(this.props.navigation);
                  }, 300);
                }}>
                <Image source={Images.close} style={styles.close} />
              </TouchableOpacity>
              <View style={styles.modalBody}>
                <View style={styles.modalBodyTop}>
                  {this.state.objFooterSelectedTask?.tasks &&
                  this.state.objFooterSelectedTask?.tasks.length > 0
                    ? this.state.objFooterSelectedTask?.tasks.map((data, i) => {
                        return (
                          <TouchableOpacity>
                            <Image
                              source={{uri: data.cate_image}}
                              style={styles.bigTaskIcon}
                            />
                            <Text
                              style={[
                                styles.heading2,
                                styles.textCenter,
                                styles.marginBottom,
                              ]}>
                              {Helper.checkNull(data.task_name).toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })
                    : null}
                  {this.state.objFooterSelectedTask && (
                    <>
                      <Image
                        source={{
                          uri: this.state.objFooterSelectedTask?.cate_image,
                        }}
                        style={styles.bigTaskIcon}
                      />
                      <Text
                        style={[
                          styles.heading2,
                          styles.textCenter,
                          styles.marginBottom,
                        ]}>
                        {Helper.checkNull(
                          this.state.objFooterSelectedTask?.task_name,
                        ).toUpperCase()}
                      </Text>
                    </>
                  )}

                  {this.state.objFooterSelectedTask?.start_time &&
                  this.state.objFooterSelectedTask?.task_time !== '' &&
                  this.stateobjFooterSelectedTask?.task_time !== null ? (
                    <View
                      style={{justifyContent: 'center', alignItems: 'center'}}>
                      {this.renderMiniClockView()}
                    </View>
                  ) : this.state.objFooterSelectedTask?.task_time !== '' &&
                    this.state.objFooterSelectedTask?.task_time !== null ? (
                    <TouchableOpacity
                      style={[styles.button, styles.smallButton]}
                      onPress={() =>
                        this.callStartTask(Constants.TASK_STATUS_START, false)
                      }>
                      <Text style={styles.mediumButtonText}>
                        {'START TASK'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {this.state.objFooterSelectedTask?.task_time !== '' &&
                    this.state.objFooterSelectedTask?.task_time !== null && (
                      <TouchableOpacity
                        style={[styles.button, styles.smallButton]}
                        onPress={() => this.pauseTask()}>
                        <Text style={styles.mediumButtonText}>
                          {this.state.buttonText}
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>
              </View>
              <View
                style={[
                  styles.modalFooter,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row-reverse',
                    marginLeft: 15,
                    marginRight: 15,
                  },
                ]}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buttonCarrot,
                    {marginLeft: 20},
                    // {marginTop: 0, marginBottom: 0},
                  ]}
                  onPress={() =>
                    this.completeTask(Constants.TASK_STATUS_COMPLETED)
                  }>
                  <Text
                    style={[
                      styles.buttonText,
                      {alignSelf: 'center', textAlign: 'center'},
                    ]}>
                    {'TASK COMPLETE'}
                  </Text>
                </TouchableOpacity>
                <Image
                  source={Images.rewardClaim}
                  style={[
                    styles.taskRewardImage,
                    {
                      position: 'absolute',
                      width: 120,
                      height: 120,
                      right: 0,
                      bottom: 30,
                    },
                  ]}
                />
                {Platform.OS === 'ios' ? (
                  <Image
                    source={Images.success_animation}
                    style={{
                      width: Dimensions.get('window').width / 1.5,
                      height: Dimensions.get('window').height / 1.2,
                      position: 'absolute',
                      bottom: 20,
                      display: this.state.showSuccess ? 'flex' : 'none',
                    }}
                  />
                ) : (
                  <FastImage
                    style={{
                      width: Dimensions.get('window').width / 1.5,
                      height: Dimensions.get('window').height / 1.2,
                      position: 'absolute',
                      bottom: 20,
                      display: this.state.showSuccess ? 'flex' : 'none',
                    }}
                    source={Images.success_animation}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                )}
              </View>
            </SafeAreaView>
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.showSuccessModal}
            onRequestClose={() => {
              // Handle second modal close
            }}>
            <SafeAreaView style={Cutomstyles.centeredModal}>
              <View
                style={{
                  padding: 20,
                  backgroundColor: colors.snow,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '70%',
                }}>
                <Text
                  style={[
                    styles.label,
                    styles.textCenter,
                    styles.marginBottom,
                    {
                      color: colors.black,
                    },
                  ]}>
                  MyRainbowClock
                </Text>
                <Text
                  style={[
                    styles.textCenter,
                    {
                      color: colors.black,
                      fontWeight: '100',
                      // fontFamily: Fonts.type.base,
                      fontSize: 12,
                      fontWeight: '300',
                      marginBottom: 15,
                    },
                  ]}>
                  {`Super Job!! \nYou have completed this task. ${
                    this.state?.objFooterSelectedTask?.no_of_token == null ||
                    this.state?.objFooterSelectedTask?.no_of_token ==
                      undefined ||
                    this.state?.objFooterSelectedTask?.no_of_token == ''
                      ? ''
                      : '\nYou have earned '
                  }`}
                  {this.state?.objFooterSelectedTask?.no_of_token &&
                    `${this.state?.objFooterSelectedTask?.no_of_token} `}
                  {this.state?.objFooterSelectedTask?.no_of_token &&
                    (this.state?.objFooterSelectedTask?.token_type ==
                    'Standard' ? (
                      <Image
                        source={this.props?.navigation?.getParam(
                          'standardRewardIcon',
                          Images.reward_star,
                        )}
                        style={{
                          width: 16,
                          height: 16,
                          alignSelf: 'center',
                          resizeMode: 'contain',
                          marginTop: -4,
                        }}
                      />
                    ) : (
                      <Image
                        source={Images.reward}
                        style={{
                          width: 16,
                          height: 16,
                          alignSelf: 'center',
                          resizeMode: 'contain',
                          marginTop: -4,
                        }}
                      />
                    ))}
                  {this.state?.objFooterSelectedTask?.no_of_token
                    ? 'token/s'
                    : ''}
                </Text>
                <TouchableOpacity
                  onPress={this.onActionOK}
                  style={{
                    borderTopColor: colors.gray,
                    paddingTop: 5,
                    borderTopWidth: 1,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      styles.label,
                      styles.textCenter,
                      {
                        color: colors.black,
                        marginBottom: 0,
                      },
                    ]}>
                    ok
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Modal>
        </Modal>
      </View>
    );
  }
}

const Cutomstyles = StyleSheet.create({
  centeredModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
  },
});
