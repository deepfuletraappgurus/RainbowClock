import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Alert, Image, ImageBackground, Modal, SafeAreaView, Text, TouchableOpacity, View, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import EventEmitter from '../Lib/EventEmitter';
import Constants from './Constants';
import * as Helper from '../Lib/Helper';
import { Images, Colors } from '../Themes';
import { PieChart } from 'react-native-svg-charts'
import Api from '../Services/Api';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';


// Global Variables
const objSecureAPI = Api.createSecure();

// Styles
import styles from '../Containers/Styles/HomeScreenStyles';
import moment from 'moment';
import BaseComponent from './BaseComponent';

export default class TaskModal extends BaseComponent {

  constructor(props) {
    super(props)
    this.state = {
      visible: this.props.visible ? this.props.visible : false,
      objFooterSelectedTask: this.props.objFooterSelectedTask,
      objSelectedChild: this.props.objSelectedChild,
      loading: false,
      currentTaskRemainTime: 0,
      playing: false,
      buttonText: 'PAUSE TASK',
      counterVisible: false,
      reward: ''
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      visible: props.visible,
      objFooterSelectedTask: props.objFooterSelectedTask,
      objSelectedChild: props.objSelectedChild,
    })
  }
  componentWillUnmount() {
    clearInterval(this._timer)
    // this.navFocusListener.remove();
  }

  setModal = (visible) => {
    if (!visible) {
      clearInterval(this._timer)
      // setTimeout(() => {
      // this._timer = null
      // }, 100);
    }
    this.setState({ visible: visible })
    this.props.onStateChange(visible)
  }

  pauseTask = () => {

    if (this.state.visible && this.state.playing) {
      this.setState({ playing: false })
      // this.setState({counterVisible: false})
      this.setState({ buttonText: 'RESUME TASK' })
    }

    if (this.state.visible && !this.state.playing) {
      this.setState({ playing: true })
      // this.setState({counterVisible: false})
      this.setState({ buttonText: 'PAUSE TASK' })
    }

  }

  checkTaskIsForToday = (taskStatus) => {
    if (Helper.checkTaskTimeAndDate(this.state.objFooterSelectedTask)) {
      Helper.showErrorMessage(Constants.MESSAGE_NO_FUTURE_TASK)
      // this.navFocusListener =  this.props.navigation.addListener('didFocus', () => {
      //   Helper.getChildRewardPoints(this.props.navigation)
      // });
    }
    else {
      this.callStartTask(taskStatus)
      this, this.setState({ playing: true })
    }
  }

  completeTask = (taskStatus) => {
    if (Helper.checkTaskTimeAndDate(this.state.objFooterSelectedTask)) {
      Helper.showErrorMessage(Constants.MESSAGE_NO_FUTURE_TASK)
      // this.navFocusListener =  this.props.navigation.addListener('didFocus', () => {
      //   Helper.getChildRewardPoints(this.props.navigation)
      // });
    }
    else {

      if (this.state.objSelectedChild.points.special != 0) {
        this.state.reward = this.state.objSelectedChild.points.special.toString()
      } else {
        this.state.reward = this.state.objSelectedChild.points.standard.toString()
      }
      console.log('REWARD :: ' + this.state.reward + '  /// POINTS=== ' + JSON.stringify(this.state.objSelectedChild.points))
      Helper.showConfirmationMessageSingleAction(
        'Super Job!! \n You have completed this task.\n Congratulations you have earned ' + this.state.reward + ' token',
        'OK',
        this.onActionOK,
      );
      // this.navFocusListener =  this.props.navigation.addListener('didFocus', () => {
      //   Helper.getChildRewardPoints(this.props.navigation)
      // });
      this.callStartTask(taskStatus)
      this, this.setState({ playing: true })
      // this.setState({counterVisible: true})

    }
  }
  onActionOK = () => {
    this.setModal(false)

  }

  callStartTask = (taskStatus) => {
    objSecureAPI.updateTaskStatus(this.state.objFooterSelectedTask.id, this.state.objSelectedChild.id,
      taskStatus).then(response => {
        console.log('TASK STATUS UPDATED ✅✅✅', JSON.stringify(response))
        if (response.ok) {
          if (response.data.success) {
            if (taskStatus == Constants.TASK_STATUS_COMPLETED) {
              this.state.objFooterSelectedTask.status = Constants.TASK_STATUS_COMPLETED
              EventEmitter.emit(Constants.EVENT_CHILD_UPDATE)
              clearInterval(this._timer)
              // this.setModal(false)
              // this.setState({counterVisible: true})
            }
            else {
              this.setRemainTime()
              this.state.objFooterSelectedTask.start_time = Helper.getCurrentUTCTime('YYYY-MM-DD HH:mm:ss')
            }
            this.setState({})
          } else {
            Helper.showErrorMessage(response.data.message)
          }
        } else {
          Helper.showErrorMessage(response.problem)
        }
      }).catch(error => {
        console.log(error);
      })
  }

  setRemainTime() {
    if (!this._timer) {
      this._timer = setInterval(() => {
        let remainTime = Helper.getPercentageArrForTask(this.state.objFooterSelectedTask)[0]
        console.log('setRemainTime', remainTime, this.state.currentTaskRemainTime);

        if (remainTime > this.state.currentTaskRemainTime) {
          this.state.currentTaskRemainTime = remainTime
          this.setState({});
        }
      }, 1000);
    }
  }

  renderMiniClockView() {
    const data = Helper.getPercentageArrForTask(this.state.objFooterSelectedTask)
    if (!this._timer) {
      // this.setRemainTime()
    }
    const pieData = data
      .map((value, index) => ({
        value,
        svg: {
          fill: [Colors.clear, Colors.blue][index],
          onPress: () => console.log('press', index),
        },
        key: `pie-${index}`,
        index: index
      }))
    const taskTime = this.state.objFooterSelectedTask?.task_time * 60;
    // cons
    return (
      <CountdownCircleTimer
        isPlaying={this.state.playing}
        duration={taskTime}
        colors="#6BC4FE"
        onComplete={() => {
          // do your stuff here
          return { shouldRepeat: false, delay: 1.5 } // repeat animation in 1.5 seconds
        }}
      >
        {({ remainingTime }) => {
          const minutes = Math.floor(remainingTime / 60)
          const seconds = remainingTime % 60
          return <>
            <Text style={[styles.minComplete, styles.textCenter]}>{`${minutes}:${seconds}`}</Text>
            <Text style={[styles.SmallLabel, styles.textCenter]}>{'MIN'}</Text></>
        }}
      </CountdownCircleTimer>)
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
            this.setState({ visible: false })
          }}>
          <View style={styles.modal}>
            <SafeAreaView style={styles.SafeAreaView}>
              <TouchableOpacity style={styles.modalCloseTouch} onPress={() => {
                this.state.objFooterSelectedTask.start_time = null
                this.setModal(false);
              }}>
                <Image source={Images.close} style={styles.close} />
              </TouchableOpacity>
              <View style={styles.modalBody}>
                <View style={styles.modalBodyTop}>
                  {this.state.objFooterSelectedTask.tasks && this.state.objFooterSelectedTask.tasks.length > 0 ?
                    this.state.objFooterSelectedTask.tasks.map((data, i) => {
                      return (
                        <TouchableOpacity>
                          <Image source={{ uri: data.cate_image }} style={styles.bigTaskIcon} />
                          <Text style={[styles.heading2, styles.textCenter, styles.marginBottom]}>{Helper.checkNull(data.task_name).toUpperCase()}</Text>
                        </TouchableOpacity>
                      )
                    })
                    : null}



                  {this.state.objFooterSelectedTask.start_time ?
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      {this.renderMiniClockView()}
                      {/* <Text style={[styles.minComplete, styles.textCenter]}>{Helper.getRemainTimeForTask(this.state.objFooterSelectedTask)}</Text>
                  <Text style={[styles.SmallLabel, styles.textCenter]}>{'MIN'}</Text> */}
                    </View>
                    :
                    <TouchableOpacity style={[styles.button, styles.smallButton]}
                      onPress={() => this.checkTaskIsForToday(Constants.TASK_STATUS_START)}>
                      <Text style={styles.mediumButtonText}>{'START TASK'}</Text>
                    </TouchableOpacity>
                  }
                  <TouchableOpacity style={[styles.button, styles.smallButton]}
                    onPress={() => this.pauseTask()}>
                    <Text style={styles.mediumButtonText}>{this.state.buttonText}</Text>
                  </TouchableOpacity>

                </View>
              </View>
              <View style={[styles.modalFooter, { justifyContent: 'center', alignItems: 'center', flexDirection: 'row-reverse', marginLeft: 15, marginRight: 15 }]}>
                <TouchableOpacity style={[styles.button, styles.buttonCarrot, { marginTop: 0, marginBottom: 0 }]} onPress={() => this.completeTask(Constants.TASK_STATUS_COMPLETED)}>
                  <Text style={[styles.buttonText, { paddingLeft: 40 }]}>{'TASK COMPLETE'}</Text>
                </TouchableOpacity>
                <Image source={Images.taskReward} style={[styles.taskRewardImage, { marginRight: -40 }]} />
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </View>
    )
  }
}