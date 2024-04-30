import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  Alert,
  BackHandler,
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import EventEmitter from '../Lib/EventEmitter';
import Constants from './Constants';
import * as Helper from '../Lib/Helper';
import {Images, Colors, Metrics} from '../Themes';
import {PieChart} from 'react-native-svg-charts';
import Api from '../Services/Api';
import {CountdownCircleTimer} from 'react-native-countdown-circle-timer';
import TaskModal from '../Components/TaskModal';

// Global Variables
const objSecureAPI = Api.createSecure();

// Styles
import styles from '../Containers/Styles/HomeScreenStyles';
import moment from 'moment';

export default class TaskListModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: this.props.visible ? this.props.visible : false,
      objFooterSelectedTask: this.props.objFooterSelectedTask,
      objSelectedChild: this.props.objSelectedChild,
      objSelectedDay: this.props.objSelectedDay,
      objSelectedTaskList: this.props.objSelectedTaskList,
      loading: false,
      currentTaskRemainTime: 0,
      playing: false,
      buttonText: 'PAUSE TASK',
      taskComplete: false,
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
    this?.props?.onClose();
    return true;
  }

  componentWillReceiveProps(props) {
    this.setState({
      visible: props.visible,
      objFooterSelectedTask: props.objFooterSelectedTask,
      objSelectedChild: props.objSelectedChild,
      objSelectedDay: props.objSelectedDay,
      objSelectedTaskList: props.objSelectedTaskList,
    });
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.setState({visible: false});
      return true;
    });
  }
  componentWillUnmount() {
    clearInterval(this._timer);
    this.setState({visible: false});
  }

  setModal = visible => {
    this.setState({visible: visible});
  };
  onPressTask(objTask) {
    this.setState({
      objFooterSelectedTask: objTask,
      taskComplete: true,
    });
  }
  callRecoverTask(objTask) {
    console.log('!!!!!!!!-----!!!!!!!!', objTask);
    objSecureAPI
      .restoreTask(objTask.sub_task_id, this.state.objSelectedChild.id)
      .then(response => {
        console.log('   RECOVER RESPONSE', response);
        if (response.ok) {
          if (response.data.success) {
            this.setState(
              {
                objFooterSelectedTask: {},
              },
              () => {
                // Then set objFooterSelectedTask with new data
                this.setState({
                  objFooterSelectedTask: response.data.data,
                });
              },
            );
            // this?.props?.onClose()
          } else {
            Helper.showErrorMessage(response.data.message);
          }
        } else {
          this.setState({
            isLoading: false,
          });
          Helper.showErrorMessage(response.problem);
        }
      })
      .catch(error => {
        this.setState({
          isLoading: false,
        });
      });
  }

  renderTaskRow = (item, index) => {
    return (
      <View style={styles.ScheduleTask}>
        {item.tasks && item.tasks.length > 0
          ? item.tasks.map((data, i) => {
              return (
                <TouchableOpacity
                  style={styles.ScheduleTaskItem}
                  onPress={() => this.onPressTask(data)}>
                  {/* <Text style={styles.timer}>{data.time_from} {data.start_time_meridiem}-{data.time_to} {data.end_time_meridiem}</Text> */}
                  <Image
                    source={{uri: data.cate_image}}
                    style={
                      data.status == Constants.TASK_STATUS_COMPLETED
                        ? styles.fadedIcon
                        : styles.iconTaskList
                    }
                  />
                </TouchableOpacity>
              );
            })
          : null}
      </View>
    );
  };

  render() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.visible}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          this?.props?.onClose();
        }}>
        <View style={styles.modal}>
          <SafeAreaView style={styles.SafeAreaView}>
            <TouchableOpacity
              style={styles.modalCloseTouch}
              onPress={() => {
                this?.props?.onClose();
              }}>
              <Image source={Images.close} style={styles.close} />
            </TouchableOpacity>
            <View
              style={[
                {
                  // flexGrow: 1,
                  paddingLeft: 30,
                  paddingRight: 30,
                  paddingTop: 20,
                  // paddingBottom: 15,
                  flex: 1,
                },
              ]}>
              {console.log(
                'objFooterSelectedTask',
                this.state.objFooterSelectedTask,
              )}
              <ScrollView showsVerticalScrollIndicator={false}>
                {this.state.objFooterSelectedTask.tasks &&
                this.state.objFooterSelectedTask.tasks.length > 0
                  ? this.state.objFooterSelectedTask.tasks.map((data, i) => {
                      return (
                        <TouchableOpacity
                          disabled={data.status == Constants.TASK_STATUS_COMPLETED}
                          style={{
                            paddingVertical: 10,
                            alignItems: 'center',
                            flexDirection: 'row',
                            borderBottomWidth: 0.3,
                            borderBottomColor: Colors.snow,
                          }}
                          onPress={() => this.onPressTask(data)}>
                          <Image
                            source={{uri: data.cate_image}}
                            style={
                              data.status == Constants.TASK_STATUS_COMPLETED
                                ? [
                                    styles.fadedIcon,
                                    {
                                      width: Metrics.screenWidth / 6,
                                      height: Metrics.screenWidth / 6,
                                    },
                                  ]
                                : styles.iconTaskList
                            }
                          />
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.minComplete,
                              {
                                color: Colors.snow,
                                alignSelf: 'center',
                                marginLeft: 10,
                                width: '50%',
                                opacity:
                                  data.status == Constants.TASK_STATUS_COMPLETED
                                    ? 0.5
                                    : 1,
                              },
                            ]}>
                            {data?.task_name}
                          </Text>
                          {data.status == Constants.TASK_STATUS_COMPLETED ? (
                            <TouchableOpacity
                              style={[
                                {
                                  backgroundColor: Colors.restoreGreen,
                                  justifyContent: 'center',
                                  alignSelf: 'center',
                                  height: 30,
                                  borderRadius: 3,
                                  padding: 5,
                                  position: 'absolute',
                                  right: 0,
                                  // alignSelf: 'flex-start',
                                  // width: '110%',
                                  // justifyContent: 'center',
                                },
                              ]}
                              onPress={() => this.callRecoverTask(data)}>
                              <Text style={[styles.taskRecoverText, {}]}>
                                {'Recover'.toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })
                  : null}
              </ScrollView>
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
                  {marginTop: 0, marginBottom: 0},
                ]}>
                <Text style={[styles.buttonText, {paddingLeft: 40}]}>
                  {'SELECT TASK'}
                </Text>
              </TouchableOpacity>
              <Image
                source={Images.taskReward}
                style={[styles.taskRewardImage, {marginRight: -50}]}
              />
            </View>
          </SafeAreaView>
        </View>
        <TaskModal
          visible={this.state.taskComplete}
          objSelectedChild={this.state.objSelectedChild}
          objFooterSelectedTask={this.state.objFooterSelectedTask}
          onStateChange={state => this.setState({taskComplete: state})}
          navigation={this.props.navigation}
          closeParentModal={() => this.setModal(false)}
          onClose={() => this?.props?.onClose()}
        />
      </Modal>
    );
  }
}
