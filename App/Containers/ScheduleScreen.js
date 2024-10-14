import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BaseComponent from '../Components/BaseComponent';
import Constants from '../Components/Constants';
import Api from '../Services/Api';
import {Colors, Images, Metrics} from '../Themes';
import * as Helper from '../Lib/Helper';
import TaskModal from '../Components/TaskModal';
import TaskListModel from '../Components/TaskListModel';
import CalendarStrip from 'react-native-calendar-strip';
import RBSheet from 'react-native-raw-bottom-sheet';
import {Calendar, LocaleConfig} from 'react-native-calendars';

// Styles
// import styles from './Styles/HomeScreenStyles';
import styles from './Styles/ScheduleScreenStyles';
import Spinner from '../Components/Spinner';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';

// Global Variables
const mApi = Api.createSecure();

const ScheduleType = [
  {name: 'Regular', isSelect: true},
  {name: 'School Holidays', isSelect: false},
  {name: 'Custom', isSelect: false},
];
export default class ScheduleScreen extends BaseComponent {
  static navigationOptions = ({navigation}) => ({
    headerStyle: {
      backgroundColor: '#b47feb',
      shadowOpacity: 0,
      shadowOffset: {height: 0},
      elevation: 0,
      height: Metrics.navBarHeight,
    },
  });

  //constructor event
  constructor(props) {
    super(props);
    this.state = {
      showDropdown: false,
      objSelectedChild: '',
      arrTasks: [],
      arrWeekDays: [],
      selectedDay: new Date(),
      isMenuAsParentPortal: false,
      taskComplete: false,
      objFooterSelectedTask: {},
      isLoading: false,
      showTaskList: false,
      item: '',
      username: '',
      isPdfLoading: false,
      scheduleType: ScheduleType,
      customScheduleText: '',
      showCustomTextInput: false,
      editingIndex: null,
      editingText: '',
      showFullCalender: false,
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
    alert('back');
    return true;
  }

  //#region -> Component Methods
  componentDidMount() {
    super.componentDidMount();
    const upComingDays = Helper.getUpcominSevenDays();
    this.setState({
      arrWeekDays: upComingDays,
      selectedDay: new Date(),
    });
    console.log('~~~~~~~', upComingDays[0]);
    this.getMenuAccessRole();
    this.getChildId();
    this.navFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        this.getChildId();
      },
    );
    this.navFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        Helper.getChildRewardPoints(this.props.navigation);
      },
    );
  }

  getMenuAccessRole = () => {
    AsyncStorage.getItem(Constants.KEY_ACCESS_AS_PARENTS, (err, result) => {
      if (result == '1') {
        this.setState({isMenuAsParentPortal: true});
      }
    });
  };

  //#endregion

  //#region -> Class Methods
  getChildId = async () => {
    const child = await AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD);
    this.setState({objSelectedChild: JSON.parse(child)}, () =>
      this.getTaskList(),
    );
  };

  getMenuAccessRole = () => {
    AsyncStorage.getItem(Constants.KEY_ACCESS_AS_PARENTS, (err, result) => {
      if (result == '1') {
        this.setState({isMenuAsParentPortal: true});
      }
    });
  };

  getTaskList = () => {
    // __DEV__ ? '2019-07-03' :
    this.setState({isLoading: true});
    const aDate = Helper.dateFormater(
      new Date(this.state.selectedDay),
      'dddd DD MMMM YYYY',
      'YYYY-MM-DD',
    );
    mApi
      .childTasksList(this.state.objSelectedChild.id, '', aDate)
      .then(response => {
        console.log('CHILD TASK LIST ✅✅✅', JSON.stringify(response));
        if (response.ok) {
          if (response.data.success) {
            let arr = [];
            if (response.data.data.length > 0) {
              this.setState({username: response.data.data[0].name});
              const tasks = response.data.data[0].tasks;
              Object.keys(tasks).map(item => {
                arr.push({time: item, tasks: tasks[item], key: item.id});
              });
              this.setState({arrTasks: arr});
              console.log('arr ✅✅✅', JSON.stringify(this.state.arrTasks));
            }
          } else {
            Helper.showErrorMessage(response.data.message);
          }
          this.setState({isLoading: false});
        } else {
          Helper.showErrorMessage(response.problem);
          this.setState({isLoading: false});
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  callRecoverTask(objTask) {
    this.state.isLoading = true;
    mApi
      .restoreTask(objTask.id, this.state.objSelectedChild.id)
      .then(response => {
        //console.log("Task Restored ✅✅✅", JSON.stringify(response));
        if (response.ok) {
          if (response.data.success) {
            const objIndex = this.state.selectedTaskSlot.findIndex(
              obj => obj.id == objTask.id,
            );
            this.state.selectedTaskSlot[objIndex].status = '';
            this.state.selectedTaskSlot[objIndex].start_time = '';
            this.state.objRestoreTask = {};
            this.setState({
              isLoading: false,
            });
            this.getChildId();
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
        //console.log(error);
      });
  }

  toggleDropdown() {
    this.setState({showDropdown: !this.state.showDropdown});
  }

  moveToAddNewTask = () => {
    this.props.navigation.navigate('SetupTimeBlockScreen');
  };

  moveToEditTask = item => {
    if (this.state.isMenuAsParentPortal) {
      // this.props.navigation.navigate('EditScheduleScreen', {
      //   scheduleDetails: item.tasks[0],
      // });
    } else {
      this.setState({
        showTaskList: true,
        item: item,
      });
    }
  };

  parentViewEditTask = (item, schedule_details) => {
    var dictCreateTask = {
      taskName: item.task_name,
      fromTime: item.time_from,
      toTime: item.time_to,
      taskColor: item.color,
      task_date: item?.task_date.includes(',')
        ? item?.task_date.split(',')
        : [item?.task_date],
      is_date: item.is_date,
      is_school_clock: item.is_school_clock,
      scheduleDetails: item,
      sub_task_id: item?.sub_task_id,
      show_delete: true,
      is_saved_for_future: item?.is_saved_for_future,
      is_multiple_task: schedule_details?.tasks.length !== 1 ? true : false,
      time_frame: schedule_details?.time,
    };
    this.props.navigation.navigate('EditSelectTaskScreen', {
      dictCreateTask: dictCreateTask,
    });
  };

  selectDay = day => {
    this.setState({selectedDay: day}, () => this.getTaskList());
    this.toggleDropdown();
  };

  onPressTask(objTask, item) {
    console.log('-----------', objTask, item);
    if (this.state.isMenuAsParentPortal) {
      this.parentViewEditTask(objTask, item);
    } else {
      console.log('-----------', objTask, item);
      if (
        objTask.status != Constants.TASK_STATUS_COMPLETED &&
        !this.state.isMenuAsParentPortal
      ) {
        this.setState({
          objFooterSelectedTask: objTask,
          taskComplete: true,
        });
      } else {
        this.setState({
          showTaskList: true,
          item: item,
        });
      }
      // this.setState({
      //   showTaskList: true,
      //   item: item,
      // });
    }
  }

  onPrintTask() {
    this.setState({isPdfLoading: true});
    const aDate = Helper.dateFormater(
      this.state.selectedDay,
      'dddd DD MMMM YYYY',
      'YYYY-MM-DD',
    );
    mApi
      .printTask(this.state.objSelectedChild.id, aDate)
      .then(response => {
        console.log('PDF LIST ✅✅✅', JSON.stringify(response));
        if (response.ok) {
          if (response.data.success) {
            // let arr = []
            // if (response.data.data.length > 0) {
            const tasks = response.data.data.pdf;
            Linking.openURL(response.data.data.pdf);
            // this.setState({ arrTasks: arr })
            // }
          } else {
            Helper.showErrorMessage(response.data.message);
          }
          this.setState({isPdfLoading: false});
        } else {
          Helper.showErrorMessage(response.problem);
          this.setState({isPdfLoading: false});
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  setModal() {
    console.log('CLOSEEEEEEEEEEEE');
    this.setState({showTaskList: false});
    this.getChildId();
    Helper.getChildRewardPoints(this.props.navigation);
  }

  onTimeBlockDeletePress = async dictCreateTask => {
    const currentTime = moment();
    const startTime = moment(dictCreateTask?.time.split('-')[0], 'hh:mm A');
    const endTime = moment(dictCreateTask?.time.split('-')[1], 'hh:mm A');

    if (currentTime.isBetween(startTime, endTime)) {
      Helper.showConfirmationMessageActions(
        Constants.MESSAGE_CURRENTTIME_DELETE_SCHEDULE,
        'No',
        'Yes',
        () => {},
        () => this.onDeleteScheduleActionYes(dictCreateTask),
      );
    } else {
      console.log('Schedule......', dictCreateTask);
      let delete_message = '';
      if (dictCreateTask?.tasks[0].is_date) {
        if (dictCreateTask?.tasks.length == 1) {
          delete_message = 'Are you sure you want to remove this schedule?';
        } else {
          delete_message =
            'Are you sure you want to remove this schedule? It will also remove all the tasks of this schedule.';
        }
      } else {
        if (dictCreateTask?.tasks.length == 1) {
          delete_message =
            'Are you sure you want to remove this recurring schedule?';
        } else {
          delete_message =
            'Are you sure you want to remove this recurring schedule? It will also remove all the tasks of this schedule.';
        }
      }
      Helper.showConfirmationMessageActions(
        delete_message,
        'No',
        'Yes',
        () => {},
        () => this.onActionYes(dictCreateTask.tasks[0], dictCreateTask?.time),
      );
    }
  };

  getObjectFromStorage = async key => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error retrieving data from local storage:', e);
    }
  };

  handleDelete = async timeSlot => {
    const key = Constants.KEY_SELECTED_CHILD; // replace with your actual key
    const data = await this.getObjectFromStorage(key);
    if (data) {
      const updatedData = this.deleteTaskTimeSlot(data, timeSlot);
      await this.saveObjectToStorage(key, updatedData);
      console.log('Updated data:', updatedData);
    }
  };

  deleteTaskTimeSlot = (data, timeSlot) => {
    const updatedData = {...data};
    if (updatedData.tasks && updatedData.tasks[timeSlot]) {
      delete updatedData.tasks[timeSlot];
    }
    return updatedData;
  };

  saveObjectToStorage = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error('Error saving data to local storage:', e);
    }
  };

  onActionYes = (dictCreateTask, time) => {
    console.log('dddddd', dictCreateTask);
    const res = mApi
      .deleteSchedule(
        dictCreateTask?.id,
        this.state.objSelectedChild.id,
        dictCreateTask?.is_new,
      )
      .then(resJSON => {
        if (resJSON.ok && resJSON.status == 200) {
          this.setState({isLoading: false});
          if (resJSON.data.success) {
            Helper.showErrorMessage(resJSON.data.message);
            this.getTaskList();
            this.handleDelete(time);
          } else {
            Helper.showErrorMessage(resJSON.data.message);
          }
        } else if (resJSON.status == 500) {
          this.setState({isLoading: false});
          Helper.showErrorMessage(resJSON.data.message);
        } else {
          this.setState({isLoading: false});
          Helper.showErrorMessage(Constants.SERVER_ERROR);
        }
      });
  };

  onTimeBlockEditPress(item) {
    const currentTime = moment();
    const startTime = moment(item?.time.split('-')[0], 'hh:mm A');
    const endTime = moment(item?.time.split('-')[1], 'hh:mm A');

    if (currentTime.isBetween(startTime, endTime)) {
      Helper.showConfirmationMessageActions(
        Constants.MESSAGE_CURRENTTIME_EDIT_SCHEDULE,
        'No',
        'Yes',
        () => {},
        () => this.onEditScheduleActionYes(item),
      );
    } else {
      this.props.navigation.navigate('EditScheduleScreen', {
        scheduleDetails: item.tasks[0],
      });
    }
  }

  onEditScheduleActionYes(item) {
    this.props.navigation.navigate('EditScheduleScreen', {
      scheduleDetails: item.tasks[0],
    });
  }

  onDeleteScheduleActionYes(dictCreateTask) {
    let delete_message = '';
    if (dictCreateTask?.tasks[0].is_date) {
      if (dictCreateTask?.tasks.length == 1) {
        delete_message = 'Are you sure you want to remove this schedule?';
      } else {
        delete_message =
          'Are you sure you want to remove this schedule? It will also remove all the tasks of this schedule.';
      }
    } else {
      if (dictCreateTask?.tasks.length == 1) {
        delete_message =
          'Are you sure you want to remove this recurring schedule?';
      } else {
        delete_message =
          'Are you sure you want to remove this recurring schedule? It will also remove all the tasks of this schedule.';
      }
    }
    Helper.showConfirmationMessageActions(
      delete_message,
      'No',
      'Yes',
      () => {},
      () => this.onActionYes(dictCreateTask.tasks[0], dictCreateTask?.time),
    );
  }

  onTimeBlockAddPress(item) {
    item = item?.tasks[0];
    var dictCreateTask = {
      fromTime: item.time_from,
      toTime: item.time_to,
      taskColor: item.color,
      task_date: item?.task_date.includes(',')
        ? item?.task_date.split(',')
        : [item?.task_date],
      is_date: item.is_date,
      is_school_clock: item.is_school_clock,
      task_id: item?.id,
      from_listing: 1,
      is_new: item?.is_new,
      userDate: this.state.selectedDay,
      isEdit:true
    };
    this.props.navigation.navigate('SelectTaskScreen', {
      dictCreateTask: dictCreateTask,
    });
  }

  onAddTaskPress(text) {
    const newOption = {name: text, isSelect: false, isCustom: true};

    // Update the array by adding the new object
    this.setState(prevState => ({
      scheduleType: [...prevState.scheduleType, newOption],
      customScheduleText: '', // Clear the TextInput value after adding to the array
      showCustomTextInput: false,
    }));
  }

  onCloseTaskPress = () => {
    const { editingIndex, scheduleType } = this.state;
  
    if (editingIndex !== null) {
      // Remove the task at the editingIndex
      const newData = scheduleType.filter((_, index) => index !== editingIndex);
  
      // Update the state
      this.setState({
        scheduleType: newData,
        editingIndex: null, // Disable the edit box
        customScheduleText: '',
        showCustomTextInput: false,
      });
    }
    this.setState({showCustomTextInput:false})
  };

  onCloseEditingTaskPress() {
    this.setState(prevState => ({
      editingIndex: null,
    }));
  }

  onCloseCustomeTaskSheet() {
    this.RBSheet.close();
  }

  toggleSelect = index => {
    this.setState(prevState => {
      const updatedArray = prevState.scheduleType.map((item, i) => {
        if (i === index) {
          return {...item, isSelect: !item.isSelect};
        } else {
          return {...item, isSelect: false};
        }
      });

      return {scheduleType: updatedArray};
    });
  };

  handleEdit = index => {
    this.setState({
      editingIndex: index,
      editingText: this.state.scheduleType[index].name,
    });
  };

  handleTextChange = text => {
    this.setState({editingText: text});
  };

  handleTextSubmit = () => {
    const {editingIndex, editingText, scheduleType} = this.state;

    if (editingIndex !== null) {
      const newData = [...scheduleType];
      newData[editingIndex].name = editingText;

      this.setState({
        scheduleType: newData,
        editingIndex: null,
      });
    }
  };

  showFullCalender = () => {
    this.setState({
      showFullCalender: !this.state.showFullCalender,
    });
  };

  //#endregion

  //#region -> View Render
  renderRow(item, index) {
    return (
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => this.selectDay(item)}>
        <Text style={[styles.dropdownItemText]}>{item}</Text>
      </TouchableOpacity>
    );
  }

  renderTaskRow = (item, index) => {
    return (
      <TouchableOpacity
        style={[
          styles.ScheduleItem,
          {
            backgroundColor: item.tasks[0].color,
            flexDirection: 'row',
            justifyContent: 'space-between',
          },
        ]}
        activeOpacity={1}
        onPress={() => this.moveToEditTask(item)}>
        <View>
          <View style={{flex: 1, flexDirection: 'row'}}>
            {/*MP*/}
            <Text style={styles.timer}>{item.time}</Text>
            {item?.tasks[0]?.is_school_clock == true ? (
              <View
                style={{
                  // backgroundColor: Colors.gray,
                  borderRadius: Metrics.screenWidth / 20,
                  height: Metrics.screenWidth / 16,
                  width: Metrics.screenWidth / 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  source={Images.bell}
                  style={{
                    width: Metrics.screenWidth / 22,
                    height: Metrics.screenWidth / 22,
                    resizeMode: 'contain',
                  }}
                />
              </View>
            ) : null}
            {/* <Text style={styles.timer}>{item.task_name}</Text> */}
            {/* {item.status == Constants.TASK_STATUS_COMPLETED ? (
              <TouchableOpacity
                style={[styles.taskRecover, {width: '30%'}]}
                onPress={() => this.callRecoverTask(item)}>
                <Text style={styles.taskRecoverText}>
                  {'Recover'.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ) : null} */}
          </View>
          {/*MP*/}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[
              styles.ScheduleTask,
              {
                width: this.state.isMenuAsParentPortal
                  ? Dimensions.get('window').width / 1.35
                  : Dimensions.get('window').width / 1.25,
              },
            ]}>
            {item.tasks && item.tasks.length > 0
              ? item.tasks.map((data, i) => {
                  return (
                    <TouchableOpacity
                      style={{
                        marginRight: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => this.onPressTask(data, item)}>
                      {/* <Text style={styles.timer}>{data.time_from} {data.start_time_meridiem}-{data.time_to} {data.end_time_meridiem}</Text> */}
                      <View style={{flexDirection: 'row'}}>
                        <Image
                          source={{uri: data.cate_image}}
                          style={[
                            data.status == Constants.TASK_STATUS_COMPLETED
                              ? styles.fadedIcon
                              : styles.icon,
                            {alignSelf: 'center', resizeMode: 'contain'},
                          ]}
                        />
                        {/* {data?.is_school_clock == true ? (
                          <View
                            style={{
                              // backgroundColor: Colors.gray,
                              borderRadius: Metrics.screenWidth / 20,
                              height: Metrics.screenWidth / 16,
                              width: Metrics.screenWidth / 16,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Image
                              source={Images.bell}
                              style={{
                                width: Metrics.screenWidth / 22,
                                height: Metrics.screenWidth / 22,
                                resizeMode: 'contain',
                              }}
                            />
                          </View>
                        ) : null} */}
                      </View>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.timer,
                          {
                            color: Colors.snow,
                            marginBottom: 0,
                            marginTop: 8,
                            textAlign: 'center',
                            width: 80,
                            opacity:
                              data.status == Constants.TASK_STATUS_COMPLETED
                                ? 0.5
                                : 1,
                          },
                        ]}>
                        {data?.task_name}
                      </Text>
                      {item.status == Constants.TASK_STATUS_COMPLETED ? (
                        <TouchableOpacity
                          style={[styles.taskRecover, {width: '30%'}]}
                          onPress={() => this.callRecoverTask(item)}>
                          <Text style={styles.taskRecoverText}>
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
        {this.state.isMenuAsParentPortal && (
          <View
            style={
              {
                // flexDirection: 'column',
                // justifyContent:'center',
              }
            }>
            <TouchableOpacity
              style={{marginBottom: 5, padding: 5}}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              onPress={() => this.onTimeBlockAddPress(item)}>
              <Icon name="plus" size={25} color={Colors.snow} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{marginBottom: 5, padding: 5, zIndex: 10000}}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              onPress={() => this.onTimeBlockEditPress(item)}>
              <Icon name="pencil" size={25} color={Colors.snow} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{marginBottom: 5, padding: 5, zIndex: 10000}}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              onPress={() => this.onTimeBlockDeletePress(item)}>
              <Icon name="trash" size={25} color={Colors.snow} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  renderScheduleTypes = ({item, index}) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
          justifyContent: 'flex-start',
        }}>
        <Icon
          onPress={() => this.toggleSelect(index)}
          name={item?.isSelect ? 'check-square' : 'square'}
          size={25}
          color={item?.isSelect ? Colors.restoreGreen : Colors.frost + 60}
        />
        <Text
          style={[
            styles.mediumButtonText,
            {color: Colors.black, marginLeft: 15},
          ]}>
          {item?.name}
        </Text>
        {item?.isCustom ? (
          <Icon
            name="pencil"
            size={20}
            color={Colors.black + 60}
            style={{position: 'absolute', right: 0}}
            onPress={() => this.handleEdit(index)}
          />
        ) : null}
      </View>
    );
  };

  render() {
    return (
      <View
        style={styles.mainContainer}
        pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        <ImageBackground style={[styles.backgroundImage, styles.scheduleBG]}>
          <TouchableOpacity
            onPress={async () => {
              this.props.navigation.navigate(
                this.state.isMenuAsParentPortal
                  ? 'ParentHomeScreen'
                  : 'HomeScreen',
              );
            }}
            style={{
              backgroundColor: Colors.blue,
              padding: 5,
              width: '20%',
              borderTopRightRadius: 15,
              borderBottomRightRadius: 15,
              flexDirection: 'row',
            }}>
            <Image
              source={Images.navIcon5}
              style={[styles.close, {marginRight: 5}]}
            />
            <Text style={[styles.dropdownButtonText, {color: Colors.snow}]}>
              Clock
            </Text>
          </TouchableOpacity>
          <View style={[styles.container]}>
            <View style={{flex: 1}}>
              {this.state.isLoading ? (
                <View style={styles.notFoundMessage}>
                  <Text style={[styles.waitText, styles.textCenter]}>
                    {Constants.TEXT_FATCHING_TASKS}
                  </Text>
                </View>
              ) : this.state.arrTasks.length > 0 && !this.state.isLoading ? (
                <FlatList
                  data={this.state.arrTasks}
                  extraData={this.state}
                  keyExtractor={(item, index) => index + ''}
                  renderItem={({item, index}) =>
                    this.renderTaskRow(item, index)
                  }
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.notFoundMessage}>
                  <Text style={[styles.waitText, styles.textCenter]}>
                    {Constants.TEXT_NO_TASKS}
                  </Text>
                </View>
              )}
              {this.state.isMenuAsParentPortal ? (
                <View style={[styles.inlineButtonGroup]}>
                  {/* <View style={styles.inlineButton}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.buttonPrimary,
                        {marginBottom: 0},
                      ]}
                      onPress={() => this.moveToAddNewTask()}>
                      <Text style={styles.buttonText}>{'ADD NEW'}</Text>
                    </TouchableOpacity>
                  </View> */}
                  <View style={[styles.inlineButton, {flex: 1}]}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.buttonCarrot,
                        {marginBottom: 0},
                      ]}
                      onPress={() => {
                        this.onPrintTask();
                      }}>
                      {this.state.isPdfLoading ? (
                        <Spinner color={'#FFFFFF'} size={'small'} />
                      ) : (
                        <Text style={styles.buttonText}>{'PRINT'}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>
            <View>
              {/* <View style={[styles.clockHeader, {marginBottom: 20}]}>
                <Text style={[styles.h1, styles.textCenter]}>
                  {'SCHEDULE' + ' (' + this.state.username + ')'}
                </Text>
              </View> */}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={[styles.h1]}>
                  {'SCHEDULE' +
                    ' - ' +
                    this.state.scheduleType.find(item => item.isSelect).name}
                </Text>
                <TouchableOpacity
                  onPress={() => this.RBSheet.open()}
                  hitSlop={{top: 20, bottom: 20, left: 50, right: 50}}>
                  <Icon name="ellipsis-h" size={25} color={'#fff'} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={this.showFullCalender}
                activeOpacity={1}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: 0.5,
                  borderTopColor: Colors.frost + 70,
                  paddingTop: 10,
                  marginTop: 10,
                  backgroundColor: this.state.showFullCalender
                    ? Colors.snow
                    : Colors.transparent,
                  borderRadius: this.state.showFullCalender ? 10 : 0,
                  borderBottomRightRadius: 0,
                  borderBottomLeftRadius: 0,
                  paddingLeft: this.state.showFullCalender ? 10 : 0,
                }}>
                <Text
                  style={[
                    styles.dropdownItemText,
                    {
                      color: this.state.showFullCalender
                        ? Colors.pink
                        : Colors.snow,
                    },
                  ]}>
                  {moment(this.state.selectedDay).format('dddd DD MMMM YYYY')}
                </Text>
                <Icon
                  name={this.state.showFullCalender ? 'sort-up' : 'sort-down'}
                  size={25}
                  color={
                    this.state.showFullCalender ? Colors.pink : Colors.snow
                  }
                  style={{
                    marginTop: this.state.showFullCalender ? 8 : -12,
                    marginLeft: 5,
                  }}
                />
              </TouchableOpacity>

              {this.state.showFullCalender ? (
                <View>
                  <Calendar
                    style={{
                      backgroundColor: Colors.snow,
                      borderRadius: 10,
                      borderTopRightRadius: 0,
                      borderTopLeftRadius: 0,
                    }}
                    theme={{
                      backgroundColor: Colors.snow,
                      calendarBackground: Colors.snow,
                      textSectionTitleColor: '#b6c1cd',
                      selectedDayBackgroundColor: '#00adf5',
                      selectedDayTextColor: '#ffffff',
                      todayTextColor: Colors.snow,
                      dayTextColor: '#2d4150',
                      textDisabledColor: '#D5E2EB',
                      selectedDayBackgroundColor: Colors.blue,
                      todayBackgroundColor: Colors.blue,
                      textSectionTitleColor: Colors.pink,
                    }}
                    headerStyle={{color: Colors.pink}}
                    showSixWeeks={false}
                    hideExtraDays={true}
                    disableMonthChange={true}
                    hideArrows={true}
                    renderHeader={date => {
                      <></>;
                    }}
                    onDayPress={day => {
                      console.log('day===--', day);
                      // this.setState({
                      //   selectedDay: new Date(day.timestamp),
                      // });
                      this.selectDay(day.dateString);
                      this.showFullCalender();
                    }}
                    markedDates={{
                      [this.state.selectedDay]: {
                        selected: true,
                        marked: true,
                        selectedColor: Colors.pink,
                      },
                    }}
                  />
                </View>
              ) : (
                <View style={{flex: 1, marginBottom: 60}}>
                  <CalendarStrip
                    style={{height: 100, paddingTop: 0, paddingBottom: 20}}
                    calendarColor={'transparent'}
                    dateNumberStyle={{color: 'white'}}
                    dateNameStyle={{color: 'white', marginBottom: 10}}
                    iconContainer={{flex: 0.1, display: 'none'}}
                    scrollerPaging={false}
                    scrollable={false}
                    selectedDate={this.state.selectedDay}
                    onDateSelected={e => {
                      // this.setState({selectedDay: new Date(e)});
                      this.selectDay((moment(e).format('YYYY-MM-DD')));
                    }}
                    calendarHeaderContainerStyle={{display: 'none'}}
                    highlightDateContainerStyle={{
                      backgroundColor: Colors.darkYellow,
                      borderRadius: 10,
                      paddingVertical: 5,
                    }}
                    highlightDateNameStyle={{marginBottom: 6}}
                    upperCaseDays={true}
                    iconStyle={{display: 'none'}}
                    minDate={new Date()}
                    useIsoWeekday={false}
                  />
                </View>
              )}

              <View
                style={{
                  width: '100%',
                  height: 1,
                  backgroundColor: Colors.frost,
                  marginTop: 15,
                }}
              />
            </View>
          </View>
          <RBSheet
            ref={ref => {
              this.RBSheet = ref;
            }}
            height={350}
            openDuration={250}
            customStyles={{
              container: {
                paddingVertical: 20,
                paddingHorizontal: 15,
              },
            }}>
            <View>
              <Text
                style={[styles.timer, {color: Colors.black, marginBottom: 20}]}>
                {'All Schedules'.toUpperCase()}
              </Text>
              <FlatList
                data={this.state.scheduleType}
                renderItem={this.renderScheduleTypes}
                keyExtractor={(item, index) => index + ''}
                extraData={this.state}
              />
              {this.state.showCustomTextInput ? (
                <View
                  style={[
                    styles.formControl,
                    {
                      borderWidth: 1,
                      borderRadius: 5,
                      borderColor: Colors.frost,
                      paddingHorizontal: 5,
                      marginTop: 20,
                      marginBottom: 0,
                    },
                  ]}>
                  <TextInput
                    style={[styles.input, {color: Colors.black}]}
                    placeholder={'Enter Schedule Name'}
                    underlineColorAndroid={'transparent'}
                    placeholderTextColor={Colors.placeHolderText}
                    returnKeyType={'done'}
                    onChangeText={customScheduleText =>
                      this.setState({customScheduleText: customScheduleText})
                    }
                    onSubmitEditing={event => {
                      Keyboard.dismiss();
                    }}
                  />
                  <TouchableOpacity
                    style={{marginLeft: 5}}
                    onPress={() =>
                      this.onAddTaskPress(this.state.customScheduleText)
                    }>
                    <Icon
                      name={'check-circle'}
                      size={26}
                      color={Colors.pink}
                      onPress={() =>
                        this.onAddTaskPress(this.state.customScheduleText)
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{marginLeft: 5}}
                    onPress={() => this.onCloseTaskPress()}>
                    <Icon
                      name={'times-circle'}
                      size={26}
                      color={Colors.black}
                      onPress={() => this.onCloseTaskPress()}
                    />
                  </TouchableOpacity>
                </View>
              ) : null}

              {this.state.editingIndex !== null && (
                <View
                  style={[
                    styles.formControl,
                    {
                      borderWidth: 1,
                      borderRadius: 5,
                      borderColor: Colors.frost,
                      paddingHorizontal: 5,
                      marginTop: 20,
                      marginBottom: 0,
                    },
                  ]}>
                  <TextInput
                    style={[styles.input, {color: Colors.black}]}
                    placeholder={'Enter Schedule Name'}
                    underlineColorAndroid={'transparent'}
                    placeholderTextColor={Colors.placeHolderText}
                    returnKeyType={'done'}
                    value={this.state.editingText}
                    onChangeText={this.handleTextChange}
                    onSubmitEditing={event => {
                      Keyboard.dismiss();
                    }}
                  />
                  <TouchableOpacity
                    style={{marginLeft: 5}}
                    onPress={() => this.handleTextSubmit()}>
                    <Icon
                      name={'check-circle'}
                      size={26}
                      color={Colors.pink}
                      onPress={() => this.handleTextSubmit()}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{marginLeft: 5}}
                    onPress={() => this.onCloseTaskPress()}>
                    <Icon
                      name={'times-circle'}
                      size={26}
                      color={Colors.black}
                      onPress={() => this.onCloseTaskPress()}
                    />
                  </TouchableOpacity>
                </View>
              )}

              <Text
                onPress={() => this.setState({showCustomTextInput: true})}
                style={[
                  styles.mediumButtonText,
                  {color: Colors.banner, marginTop: 20},
                ]}>
                {'+' + 'ADD SCHEDULE'}
              </Text>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonPrimary,
                  {marginTop: 10, marginBottom: 0},
                ]}
                onPress={() => this.onCloseCustomeTaskSheet()}>
                <Text style={styles.buttonText}>{'Close'}</Text>
              </TouchableOpacity>
            </View>
          </RBSheet>
        </ImageBackground>

        <TaskModal
          visible={this.state.taskComplete}
          objSelectedChild={this.state?.objSelectedChild}
          objFooterSelectedTask={this.state?.objFooterSelectedTask}
          onStateChange={state => this.setState({taskComplete: state})}
          navigation={this.props.navigation}
          onClose={() => this.setModal()}
          calenderSelectedDay={this.state.selectedDay}
        />
        <TaskListModel
          visible={this.state.showTaskList}
          objSelectedChild={this.state.objSelectedChild}
          objFooterSelectedTask={this.state.item}
          objSelectedDay={Helper.dateFormater(
            this.state.selectedDay,
            'dddd DD MMMM YYYY',
            'YYYY-MM-DD',
          )}
          objSelectedTaskList={this.state.arrTasks}
          onStateChange={state => this.setState({showTaskList: state})}
          onClose={() => this.setModal()}
          navigation={this.props?.navigation}
          calenderSelectedDay={this.state.selectedDay}
        />
      </View>
    );
  }
  //#endregion
}
