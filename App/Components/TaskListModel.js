import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {Alert, BackHandler,Image, ImageBackground, Modal, SafeAreaView, Text, TouchableOpacity, View, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import EventEmitter from '../Lib/EventEmitter';
import Constants from './Constants';
import * as Helper from '../Lib/Helper';
import { Images, Colors } from '../Themes';
import { PieChart } from 'react-native-svg-charts'
import Api from '../Services/Api';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import TaskModal from '../Components/TaskModal'

// Global Variables
const objSecureAPI = Api.createSecure();

// Styles
import styles from '../Containers/Styles/HomeScreenStyles';
import moment from 'moment';

export default class TaskListModel extends Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: this.props.visible ? this.props.visible : false,
      objFooterSelectedTask: this.props.objFooterSelectedTask,
      objSelectedChild: this.props.objSelectedChild,
      objSelectedDay:this.props.objSelectedDay,
      objSelectedTaskList:this.props.objSelectedTaskList,
      loading: false,
      currentTaskRemainTime: 0,
      playing :false,
      buttonText: 'PAUSE TASK',
      taskComplete:false,
    
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      visible: props.visible,
      objFooterSelectedTask: props.objFooterSelectedTask,
      objSelectedChild: props.objSelectedChild,
      objSelectedDay:props.objSelectedDay,
      objSelectedTaskList:props.objSelectedTaskList,
    })
    console.log('PROPSSSSS ',props)
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.setState({ visible: false })
      return true
    })
  }
  componentWillUnmount(){
    clearInterval(this._timer)
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
  onPressTask(objTask) {
    
        this.setState({
            objFooterSelectedTask: objTask,
            taskComplete: true,
        })
    
}

  renderTaskRow = (item, index) => {
        return (
                    <View style={styles.ScheduleTask}>
                    {item.tasks && item.tasks.length > 0 ?
                        item.tasks.map((data, i) => {
                            return (
                                <TouchableOpacity style={styles.ScheduleTaskItem} onPress={() => this.onPressTask(data)}>
                                      {/* <Text style={styles.timer}>{data.time_from} {data.start_time_meridiem}-{data.time_to} {data.end_time_meridiem}</Text> */}
                                    <Image source={{ uri: data.cate_image }}
                                        style={data.status == Constants.TASK_STATUS_COMPLETED ? styles.fadedIcon : styles.iconTaskList} />
                                </TouchableOpacity>
                            )
                        })
                        : null}
                </View>

        )
    }


  render() {
    console.log('ITEMS=-> '+JSON.stringify(this.state.objFooterSelectedTask.tasks))
    return (<Modal
      animationType="slide"
      transparent={true}
      visible={this.state.visible}
      onRequestClose={() => {
        // Alert.alert('Modal has been closed.');
        this.setState({ visible: false })
      }}>
      <View style={styles.modal}>
        <SafeAreaView style={styles.SafeAreaView}>
        <TouchableOpacity style={styles.modalCloseTouch} onPress={() => { this.setModal(false); }}>
            <Image source={Images.close} style={styles.close} />
          </TouchableOpacity>
          <View style={styles.modalBody}>
            <View style={styles.modalBodyTop}>
             {/* {this.state.objFooterSelectedTask !=null ?
            <Image source={{ uri: this.state.objFooterSelectedTask}} style={styles.bigTaskIcon} />
            <Text  style={[styles.waitText, styles.textCenter]}>{Constants.TEXT_NO_TASKS}</Text>
                                    // <FlatList
                                    //     data={this.state.objSelectedTaskList}
                                    //     extraData={this.state}
                                    //     keyExtractor={(item, index) => (index + '')}
                                    //     renderItem={({ item, index }) => this.renderTaskRow(item, index)}
                                    // /> 
                                    :
                                    <View style={styles.notFoundMessage}>
                                        <Text  style={[styles.waitText, styles.textCenter]}>{Constants.TEXT_NO_TASKS}</Text>
                                    </View> } 
                                     */}
                       {this.state.objFooterSelectedTask.tasks && this.state.objFooterSelectedTask.tasks.length > 0 ?
                        this.state.objFooterSelectedTask.tasks.map((data, i) => {
                            return (
                                <TouchableOpacity style={styles.ScheduleTaskItem} onPress={() => this.onPressTask(this.state.objFooterSelectedTask)}>
                                    <Image source={{ uri: data.cate_image }}
                                        style={data.status == Constants.TASK_STATUS_COMPLETED ? styles.fadedIcon : styles.iconTaskList} />
                                </TouchableOpacity>
                            )
                        })
                        : null}

            </View>
          </View>
          <View style={[styles.modalFooter, { justifyContent: 'center', alignItems: 'center', flexDirection: 'row-reverse', marginLeft: 15, marginRight: 15 }]}>
            <TouchableOpacity style={[styles.button, styles.buttonCarrot, { marginTop: 0, marginBottom: 0 }]} >
              <Text style={[styles.buttonText, {paddingLeft:40}]}>{'SELECT TASK'}</Text>
            </TouchableOpacity>
            <Image source={Images.taskReward} style={[styles.taskRewardImage, {marginRight:-100}]} />
          </View>
        </SafeAreaView>
      </View>
               <TaskModal
                    visible={this.state.taskComplete}
                    objSelectedChild={this.state.objSelectedChild}
                    objFooterSelectedTask={this.state.objFooterSelectedTask}
                    onStateChange={(state) => this.setState({ taskComplete: state })}
                    navigation={this.props.navigation}
                />
    </Modal>
    
    )
    
  }
}