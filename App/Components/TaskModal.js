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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import EventEmitter from '../Lib/EventEmitter';
import Constants from './Constants';
import * as Helper from '../Lib/Helper';
import {Images, Colors} from '../Themes';
import {PieChart} from 'react-native-svg-charts';
import Api from '../Services/Api';
import {CountdownCircleTimer} from 'react-native-countdown-circle-timer';

// Global Variables
const objSecureAPI = Api.createSecure();

// Styles
import styles from '../Containers/Styles/HomeScreenStyles';
import moment from 'moment';
import BaseComponent from './BaseComponent';

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
    this.setState({
      visible: props.visible,
      objFooterSelectedTask: props.objFooterSelectedTask,
      objSelectedChild: props.objSelectedChild,
      task_id: props.objFooterSelectedTask.sub_task_id,
      is_new: props.objFooterSelectedTask.is_new,
      buttonText:
        props.objFooterSelectedTask.task_time == null
          ? 'START TIME'
          : props.objFooterSelectedTask.start_time
          ? 'START TIME'
          : 'PAUSE TIME',
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
    // this?.props?.closeParentModal();
    this.setModal(false);
    this.props.onStateChange(false);
    Helper.getChildRewardPoints(this.props.navigation);
  };

  callStartTask = (taskStatus, showAnimation) => {
    if (Helper.checkTaskTimeAndDate(this.state.objFooterSelectedTask)) {
      Helper.showErrorMessage(Constants.MESSAGE_NO_FUTURE_TASK);
      // this.navFocusListener =  this.props.navigation.addListener('didFocus', () => {
      //   Helper.getChildRewardPoints(this.props.navigation)
      // });
    } else {
      objSecureAPI
        .updateTaskStatus(
          this.state.task_id,
          this.state.objSelectedChild.id,
          taskStatus,
          this.state.is_new,
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
                  let timer = setTimeout(() => {
                    this.setState({showSuccess: false});
                    Helper.showConfirmationMessageSingleAction(
                      `Super Job!! \nYou have completed this task. ${
                        this.state.objFooterSelectedTask.no_of_token == null ||
                        this.state.objFooterSelectedTask.no_of_token ==
                          undefined ||
                        this.state.objFooterSelectedTask.no_of_token == ''
                          ? ''
                          : '\nCongratulations you have earned ' +
                            (this.state.objFooterSelectedTask.no_of_token +
                              ' ' +
                              (this.state.objFooterSelectedTask.token_type ==
                                null ||
                              this.state.objFooterSelectedTask.token_type ==
                                undefined
                                ? ''
                                : this.state.objFooterSelectedTask.token_type) +
                              ' token')
                      }`,
                      'OK',
                      this.onActionOK,
                    );
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
        .catch(error => {});
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
                  this.setModal(false);
                  setTimeout(() => {
                    Helper.getChildRewardPoints(this.props.navigation);
                  }, 300);
                }}>
                <Image source={Images.close} style={styles.close} />
              </TouchableOpacity>
              <View style={styles.modalBody}>
                <View style={styles.modalBodyTop}>
                  {this.state.objFooterSelectedTask.tasks &&
                  this.state.objFooterSelectedTask.tasks.length > 0
                    ? this.state.objFooterSelectedTask.tasks.map((data, i) => {
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

                  {this.state.objFooterSelectedTask.start_time &&
                  this.state.objFooterSelectedTask.task_time ? (
                    <View
                      style={{justifyContent: 'center', alignItems: 'center'}}>
                      {this.renderMiniClockView()}
                    </View>
                  ) : this.state.objFooterSelectedTask.task_time ? (
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
                  {this.state.objFooterSelectedTask.task_time && (
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
                    {marginLeft:20}
                    // {marginTop: 0, marginBottom: 0},
                  ]}
                  onPress={() =>
                    this.completeTask(Constants.TASK_STATUS_COMPLETED)
                  }>
                  <Text style={[styles.buttonText, {alignSelf:'center',textAlign:'center'}]}>
                    {'TASK COMPLETE'}
                  </Text>
                </TouchableOpacity>
                <Image
                  source={Images.rewardClaim}
                  style={[
                    styles.taskRewardImage,
                    {position:'absolute', width: 120, height: 120,right:0,bottom:30, },
                  ]}
                />
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
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </View>
    );
  }
}
