import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
    Image, ImageBackground, FlatList, Text, TouchableOpacity, View, Modal, SafeAreaView, TextInput, KeyboardAvoidingView, ScrollView
} from 'react-native';
import Api from '../Services/Api';
import { Colors, Images, Metrics } from '../Themes';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
 

// Styles
import styles from './Styles/RescheduleScreenStyles';
import BaseComponent from '../Components/BaseComponent';

// Global Variables
const objSecureAPI = Api.createSecure();

export default class RescheduleScreen extends BaseComponent {

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
            showDropdown: false,
            selectedDay: '',
            selectedTimeSlot: '',
            arrTimeSlotForTheSelectedDay: '',
            selectDayDropdown: false,
            arrSchedule: [],
            arrWeekDays: [],
            isLoading: false,
            modalVisible: false,
        }
    }

    //#region -> Component Methods
    componentDidMount() {
        super.componentDidMount()
        this.setState({
            arrWeekDays: Helper.getUpcominSevenDays()
        })
        this.getChildDetail()
    }
    //#endregion

    //#region -> Class Methods
    getChildDetail = () => {
        AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
            if (child != '') {
                this.state.objSelectedChild = JSON.parse(child)
                this.getTaskList()
            }
        })
    }
    //#endregion

    //#region -> API Call
    getTaskList = () => {
        this.setState({ isLoading: true });
        // __DEV__ ? '2019-07-03' :
        const aDate = Helper.dateFormater(this.state.arrWeekDays[0], 'dddd DD MMMM YYYY', 'YYYY-MM-DD')
        objSecureAPI.childTasksList(this.state.objSelectedChild.id, 'Pending', aDate, '1').then(response => {
            console.log('CHILD TASK LIST ✅✅✅', JSON.stringify(response))
            if (response.ok) {
                if (response.data.success) {
                    let arr = []
                    if (response.data.data.length > 0) {
                        const tasks = response.data.data[0].tasks
                        Object.keys(tasks).map((item) => {
                            arr.push({ time: item, tasks: tasks[item] })
                        })
                        this.state.isLoading = false
                        this.setState({ arrSchedule: arr })
                        console.log('arrSchedule ✅✅✅', this.state.arrSchedule)
                    }
                } else {
                    Helper.showErrorMessage(response.data.message)
                }
            } else {
                this.setState({ isLoading: false });
                Helper.showErrorMessage(response.problem)
            }
        }).catch(error => {
            this.setState({ isLoading: false });
            console.log(error);
        })
    }

    callAddTask = () => {
        this.setState({ isLoading: true })
        var childId = this.state.objSelectedChild.id
        var mainCatId = this.state.selectedTask.mcid
        var subCatId = this.state.selectedTask.ccid
        var taskType = this.state.selectedTask.type
        var timeSloteName = this.state.selectedTask.name
        var taskName = this.state.selectedTask.task_name
        var taskDescription = this.state.selectedTask.description
        var taskFromTime = this.state.selectedTimeSlot.split('-')[0]
        var taskToTime = this.state.selectedTimeSlot.split('-')[1]
        var taskTime = this.state.selectedTask.task_time
        var taskColor = this.state.selectedTask.color
        var taskTokenType = this.state.selectedTask.token_type
        var taskNumberOfTokens = this.state.selectedTask.no_of_token
        var taskDates = Helper.dateFormater(this.state.selectedDay, 'dddd DD MMMM YYYY', 'YYYY-MM-DD')
        var taskCustomIcon = this.state.selectedTask.type == Constants.TASK_TYPE_CUSTOM ? this.state.selectedTask.cate_image : ''
        var frequency = this.state.frequency ? this.state.frequency : ''

        const res = objSecureAPI.addTask(childId, mainCatId, subCatId, taskType, timeSloteName, taskName, taskDescription, taskFromTime,
            taskToTime, taskTime, taskColor, taskTokenType, taskNumberOfTokens, taskDates, taskCustomIcon, frequency).then((resJSON) => {
                console.log('✅✅✅', resJSON)
                if (resJSON.ok && resJSON.status == 200) {
                    if (resJSON.data.success) {
                        this.state.showDropdown = false
                        this.state.arrTimeSlotForTheSelectedDay = ''
                        this.state.selectedDay = ''
                        this.state.selectedTimeSlot = ''
                        this.state.selectDayDropdown = false
                        this.state.arrSchedule = []
                        this.callRemoveTask()

                    }
                    else {
                        this.setState({ isLoading: false })
                        Helper.showErrorMessage(resJSON.data.message);
                    }
                }
                else if (resJSON.status == 500) {
                    this.setState({ isLoading: false })
                    Helper.showErrorMessage(resJSON.data.message);
                }
                else {
                    this.setState({ isLoading: false })
                    Helper.showErrorMessage(Constants.SERVER_ERROR);
                }
            })
    }

    callRemoveTask = () => {
        const res = objSecureAPI.deleteTask(this.state.selectedTask.id, this.state.objSelectedChild.id).then((resJSON) => {
            console.log('✅✅✅', resJSON)
            if (resJSON.ok && resJSON.status == 200) {
                this.setState({ isLoading: false })
                if (resJSON.data.success) {
                    this.getTaskList()
                    this.setState({ modalVisible: false })
                }
                else {
                    Helper.showErrorMessage(resJSON.data.message);
                }
            }
            else if (resJSON.status == 500) {
                this.setState({ isLoading: false })
                Helper.showErrorMessage(resJSON.data.message);
            }
            else {
                this.setState({ isLoading: false })
                Helper.showErrorMessage(Constants.SERVER_ERROR);
            }
        })
    }

    clearData = () => {
        this.state.showDropdown = false
        this.state.arrTimeSlotForTheSelectedDay = ''
        this.state.selectedDay = ''
        this.state.selectedTimeSlot = ''
        this.state.selectDayDropdown = false
        this.setState({ modalVisible: false })
    }

    onPressReschedule = (objTask) => {
        this.setState({ modalVisible: true, selectedTask: objTask });
    }

    checkAvailableMinutes = () => {
        const totalMinutes = Helper.getTimeFromSelectTimeSlot(this.state.selectedTimeSlot)
        var availableMinutes = totalMinutes
        this.state.arrTimeSlotForTheSelectedDay[0][this.state.selectedTimeSlot].map((task, index) => {
            availableMinutes = availableMinutes - task.task_time
        })
        return availableMinutes > this.state.selectedTask.task_time ? true : false
    }

    addTask = () => {
        if (this.isValidator()) {
            this.callAddTask()
        }
    }

    isValidator = () => {
        if (this.state.selectedDay.trim() == '') {
            Helper.showErrorMessage(Constants.MESSAGE_SELECT_DAY_RESCHEDULE);
            return false;
        }
        else if (this.state.selectedTimeSlot.trim() == '') {
            Helper.showErrorMessage(Constants.MESSAGE_SELECT_TIME_RESCHEDULE);
            return false;
        }
        else if (!this.checkAvailableMinutes()) {
            Helper.showErrorMessage("BC Khabar pade 6e k nai kai 🤬");
            return false;
        }
        return true
    }

    toggleSelectDayDropdown = () => {
        this.setState({ selectDayDropdown: !this.state.selectDayDropdown });
    }

    selectDayForTasks = (day) => {
        this.setState({ selectedDay: day, selectedTimeSlot: '' });
        const taskForTheDay = this.state.arrSchedule.map((item) => {
            return item.time == Helper.dateFormater(day, 'dddd DD MMMM YYYY', 'YYYY-MM-DD') ?
                item.tasks : []
        })
        this.state.arrTimeSlotForTheSelectedDay = taskForTheDay[0].length == 0 ? '' : taskForTheDay
        if (taskForTheDay[0].length == 0) {
            this.setState({ selectedDay: '', selectedTimeSlot: '' });
            Helper.showErrorMessage(Constants.MESSAGE_NO_TASK_ON_DAY)
        }
        this.toggleSelectDayDropdown()
    }

    selectTimeSlot = (time) => {
        this.setState({ selectedTimeSlot: time });
    }
    //#endregion

    //#region -> View Render

    renderDaySlot(item, index) {
        return (
            <TouchableOpacity style={[styles.itemList]} onPress={() => this.selectTimeSlot(item)}>
                <View style={[styles.colorCode, { backgroundColor: this.state.arrTimeSlotForTheSelectedDay[0][item][0].color }]}></View>
                <Text style={styles.dropdownItemText}>{item}</Text>
            </TouchableOpacity>
        )
    }

    renderDayRow(item, index) {
        return (
            <TouchableOpacity style={styles.dropdownItem} onPress={() => this.selectDayForTasks(item)}>
                <Text style={styles.dropdownItemText}>{(item)}</Text>
            </TouchableOpacity>
        )
    }

    renderRow(item, index) {
        const pages = Object.keys(item.tasks).map((keyTime, mainIndex) => {
            const taskView = item.tasks[keyTime].map((task, subIndex) => {
                const isLastArray = mainIndex == (Object.keys(item.tasks).length - 1) ? true : false
                return this.renderTaskRow(task, isLastArray, item.tasks[keyTime], subIndex)
            });
            return taskView
        });
        return (
            <View style={[styles.taskItem]}>
                <Text style={styles.taskItemDate}>
                    {Helper.dateFormater(item.time, 'YYYY-MM-DD', 'dddd DD MMMM YYYY').toUpperCase()}</Text>
                {pages}
            </View>
        )
    }

    renderTaskRow(task, isLastArray, arrTaskList, subIndex) {
        return (
            ((arrTaskList.length - 1) == subIndex) && isLastArray ?
                <View style={[styles.taskListReschedule, styles.taskListLast]}>
                    <View style={styles.taskLeft}>
                        <Image source={{ uri: task.cate_image }} style={styles.iconSmall} />
                        <Text style={styles.taskListText}>{task.description ? task.description : task.task_name}</Text>
                    </View>
                    <TouchableOpacity style={styles.taskReschedule} onPress={() => this.onPressReschedule(task)}>
                        <Text style={styles.taskRescheduleText}>{'Reschedule'.toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>
                :
                <View style={[styles.taskListReschedule]}>
                    <View style={styles.taskLeft}>
                        <Image source={{ uri: task.cate_image }} style={styles.iconSmall} />
                        <Text style={styles.taskListText}>{task.description ? task.description : task.task_name}</Text>
                    </View>
                    <TouchableOpacity style={styles.taskReschedule} onPress={() => this.onPressReschedule(task)}>
                        <Text style={styles.taskRescheduleText}>{'Reschedule'.toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>
        )
    }

    render() {
        return (
            <View style={styles.mainContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
                <ImageBackground source={Images.blueBackground} style={styles.backgroundImage}>
                    <View style={[styles.container]}>
                        <View style={{ flex: 1 }}>
                            <View style={[styles.clockHeader, { marginBottom: 20 }]}>
                               {this.state.arrSchedule.length > 0 && <Text style={[styles.h1, styles.textCenter]}>{'Tasks Not Completed'.toUpperCase()}</Text>}
                            </View>
                            {this.state.isLoading ?
                                <View style={styles.notFoundMessage}>
                                    <Text style={[styles.waitText, styles.textCenter]}>{Constants.TEXT_FATCHING_TASKS}</Text>
                                </View>
                                :
                                this.state.arrSchedule.length > 0 && !this.state.isLoading ?
                                    <FlatList
                                        data={this.state.arrSchedule}
                                        extraData={this.state}
                                        keyExtractor={(item, index) => (index + '')}
                                        renderItem={({ item, index }) => this.renderRow(item, index)}
                                    /> :
                                    <View style={styles.notFoundMessage}>
                                        <Text style={[styles.waitText, styles.textCenter]}>{Constants.TEXT_NO_TASKS}</Text>
                                    </View>
                            }
                        </View>
                    </View>
                </ImageBackground>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => this.setModalVisible(false)}>

                    <View style={styles.rescheduleModal}>
                        <SafeAreaView style={styles.SafeAreaView}>
                            <KeyboardAvoidingView style={styles.mainContainer} behavior={"padding"}>
                                <View style={styles.modalView}>
                                    <ScrollView style={styles.modalDialog} contentContainerStyle={styles.ScrollView}>
                                        <View style={[styles.container]}>
                                            <View style={[styles.containerBody, { flexDirection: 'column-reverse' }]}>
                                                <View style={[styles.modalFooter, styles.paddingNull, { marginTop: 30, }]}>
                                                    <TouchableOpacity style={[styles.button, styles.buttonPrimary, { marginTop: 0 }]}
                                                        onPress={() => this.addTask()}>
                                                        <Text style={styles.buttonText}>{'SAVE'}</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[styles.button, styles.buttonPrimary, { marginTop: 0 }]}
                                                        onPress={() => this.clearData()}>
                                                        <Text style={styles.buttonText}>{'CANCEL'}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{ flexGrow: 1 }}>
                                                    <View style={{ flexDirection: 'column-reverse' }}>
                                                        <View style={styles.rescheduleTimeSlotBox}>
                                                            {!this.state.arrTimeSlotForTheSelectedDay ?
                                                                <Text style={[styles.textCenter, styles.pinFrm]}>{'Select day and time to reschedule the task.'}</Text> :
                                                                <FlatList keyboardShouldPersistTaps={'always'}
                                                                    data={Object.keys(this.state.arrTimeSlotForTheSelectedDay[0])}
                                                                    extraData={this.state}
                                                                    keyExtractor={(item, index) => index}
                                                                    renderItem={({ item, index }) => this.renderDaySlot(item, index)}
                                                                    contentContainerStyle={{ padding: 2 }}
                                                                />
                                                            }
                                                        </View>
                                                        <View style={[styles.frm, { marginTop: 0 }]}>
                                                            <Text style={[styles.label, { color: Colors.titleColor, fontSize: 16 }]}>{'TIME'}</Text>
                                                            <TouchableOpacity style={[styles.dropdownButton, styles.buttonBorder]}>
                                                                <Text style={styles.dropdownButtonText}>{this.state.selectedTimeSlot}</Text>
                                                            </TouchableOpacity>
                                                            {this.state.typeOfTokensDropdown ?
                                                                <View style={[styles.dropdown, styles.dropdownSmall]}>
                                                                    <FlatList keyboardShouldPersistTaps={'always'}
                                                                        data={[]}
                                                                        extraData={this.state}
                                                                        keyExtractor={(item, index) => index}
                                                                        renderItem={({ item, index }) => this.renderTokenType(item, index)}
                                                                        contentContainerStyle={{ padding: 0 }}
                                                                    />
                                                                </View>
                                                                : null
                                                            }
                                                        </View>
                                                        <View style={[styles.frm, { marginTop: 0 }]}>
                                                            <Text style={[styles.label, { color: Colors.titleColor, fontSize: 16 }]}>{'DAY'}</Text>
                                                            <TouchableOpacity style={[styles.dropdownButton, styles.buttonBorder]} onPress={() => this.toggleSelectDayDropdown()}>
                                                                <Text style={styles.dropdownButtonText}>{this.state.selectedDay ? this.state.selectedDay : 'SELECT DAY'}</Text>
                                                                <Image source={Images.downarrow} style={styles.downarrow} />
                                                            </TouchableOpacity>
                                                            {this.state.selectDayDropdown ?
                                                                <View style={[styles.dropdown, styles.dropdownSmall]}>
                                                                    <FlatList keyboardShouldPersistTaps={'always'}
                                                                        data={this.state.arrWeekDays}
                                                                        extraData={this.state}
                                                                        keyExtractor={(item, index) => index}
                                                                        renderItem={({ item, index }) => this.renderDayRow(item, index)}
                                                                        contentContainerStyle={{ padding: 0 }}
                                                                    />
                                                                </View>
                                                                : null
                                                            }
                                                        </View>

                                                    </View>
                                                </View>
                                                <Text style={[styles.rescheduleTitle, styles.textCenter]}>{'RESCHEDULE'}</Text>
                                            </View>
                                        </View>
                                    </ScrollView>
                                </View>
                            </KeyboardAvoidingView>
                        </SafeAreaView>
                    </View>
                </Modal>

            </View>
        )
    }
    //#endregion
}
