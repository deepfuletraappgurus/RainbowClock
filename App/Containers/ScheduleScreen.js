import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  Text,
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

// Styles
// import styles from './Styles/HomeScreenStyles';
import styles from './Styles/ScheduleScreenStyles';
import Spinner from '../Components/Spinner';
import moment from 'moment';

// Global Variables
const mApi = Api.createSecure();

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
      selectedDay: '',
      isMenuAsParentPortal: false,
      taskComplete: false,
      objFooterSelectedTask: {},
      isLoading: false,
      showTaskList: false,
      item: '',
      username: '',
      isPdfLoading: false,
    };
  }

  //#region -> Component Methods
  componentDidMount() {
    super.componentDidMount();
    const upComingDays = Helper.getUpcominSevenDays();
    this.setState({
      arrWeekDays: upComingDays,
      selectedDay: upComingDays[0],
    });
    this.getMenuAccessRole();
    this.getChildId();
    this.navFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        this.getChildId();
      },
    );
  }

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
      this.state.selectedDay,
      'dddd DD MMMM YYYY',
      'YYYY-MM-DD',
    );
    mApi
      .childTasksList(this.state.objSelectedChild.id, '', aDate)
      .then(response => {
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
      });
  };
  callRecoverTask(objTask) {
    this.state.isLoading = true;
    mApi
      .restoreTask(objTask.id, this.state.objSelectedChild.id)
      .then(response => {
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

  parentViewEditTask = item => {
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
    if (this.state.isMenuAsParentPortal) {
      this.parentViewEditTask(objTask);
    } else {
      // if (
      //   objTask.status != Constants.TASK_STATUS_COMPLETED &&
      //   !this.state.isMenuAsParentPortal
      // ) {
      //   this.setState({
      //     showTaskList: true,
      //     item: item,
      //   });
      // } else {

      //   this.setState({
      //     objFooterSelectedTask: objTask,
      //     taskComplete: true,
      //   });
      // }
      this.setState({
        showTaskList: true,
        item: item,
      });
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
        if (response.ok) {
          if (response.data.success) {
            // let arr = []
            // if (response.data.data.length > 0) {
            const tasks = response.data.data.pdf;

            this.props.navigation.navigate('PrintPdfScreen', {pdfUrl: tasks});
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
      });
  }

  setModal() {
    this.setState({showTaskList: false});
    this.getChildId();
  }

  onTimeBlockDeletePress(dictCreateTask) {
    const currentTime = moment();
    const startTime = moment(dictCreateTask?.time.split('-')[0], 'hh:mm A');
    const endTime = moment(dictCreateTask?.time.split('-')[1], 'hh:mm A');

    if (currentTime.isBetween(startTime, endTime)) {
      Helper.showErrorMessage(
        'You can not Delete the task because you are already in this time block.',
      );
    } else {
      dictCreateTask = dictCreateTask.tasks[0];
      Helper.showConfirmationMessageActions(
        "Are You Sure, You Want to Delete This Time Block.It's also remove All Task In This Time Block.",
        'No',
        'Yes',
        () => {},
        () => this.onActionYes(dictCreateTask),
      );
    }
  }

  onActionYes = dictCreateTask => {
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
      Helper.showErrorMessage(
        'You can not update the task because you are already in this time block.',
      );
    } else {
      this.props.navigation.navigate('EditScheduleScreen', {
        scheduleDetails: item.tasks[0],
      });
    }
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
    };
    this.props.navigation.navigate('SelectTaskScreen', {
      dictCreateTask: dictCreateTask,
    });
  }

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

            {/* <Text style={styles.timer}>{item.task_name}</Text> */}
            {item.status == Constants.TASK_STATUS_COMPLETED ? (
              <TouchableOpacity
                style={[styles.taskRecover, {width: '30%'}]}
                onPress={() => this.callRecoverTask(item)}>
                <Text style={styles.taskRecoverText}>
                  {'Recover'.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ) : null}
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
                      style={{marginRight: 12,justifyContent: 'center',alignItems:'center'}}
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
                        {data?.is_school_clock == true ? (
                          <View
                            style={{
                              // backgroundColor: Colors.gray,
                              borderRadius: Metrics.screenWidth / 20,
                              height: Metrics.screenWidth / 16,
                              width: Metrics.screenWidth / 16,
                              justifyContent:'center',
                              alignItems:'center'
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
                            width:70,
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
              <Image
                source={Images.add}
                style={[styles.scheduleEditImage, {resizeMode: 'contain'}]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{marginBottom: 5, padding: 5, zIndex: 10000}}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              onPress={() => this.onTimeBlockEditPress(item)}>
              <Image
                source={Images.edit}
                style={[styles.scheduleEditImage, {resizeMode: 'contain'}]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{marginBottom: 5, padding: 5, zIndex: 10000}}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              onPress={() => this.onTimeBlockDeletePress(item)}>
              <Image
                source={Images.delete}
                style={[styles.scheduleEditImage, {resizeMode: 'contain'}]}
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <View
        style={styles.mainContainer}
        pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        <ImageBackground style={[styles.backgroundImage, styles.scheduleBG]}>
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
              <View style={[styles.clockHeader, {marginBottom: 20}]}>
                <Text style={[styles.h1, styles.textCenter]}>
                  {'SCHEDULE' + ' (' + this.state.username + ')'}
                </Text>
              </View>
              {this.state.showDropdown ? (
                <TouchableOpacity
                  style={styles.bodyClose}
                  onPress={() => this.toggleDropdown()}></TouchableOpacity>
              ) : null}
              <View
                style={[styles.dropdownContainer, {justifyContent: 'center'}]}>
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    styles.dropdownButtonLarge,
                    this.state.showDropdown ? styles.bottomRadiusNull : null,
                  ]}
                  onPress={() => this.toggleDropdown()}>
                  <Text
                    style={[
                      styles.dropdownButtonText,
                      styles.dropdownLargeButtonText,
                    ]}>
                    {this.state.selectedDay == ''
                      ? 'SELECT CATEGORY'
                      : this.state.selectedDay}
                  </Text>
                  <Image source={Images.downarrow} style={styles.downarrow} />
                </TouchableOpacity>
                {this.state.showDropdown ? (
                  <View style={[styles.dropdown, styles.dropdownLarge]}>
                    <FlatList
                      keyboardShouldPersistTaps={'always'}
                      data={this.state.arrWeekDays}
                      extraData={this.state}
                      keyExtractor={(item, index) => index}
                      renderItem={({item, index}) =>
                        this.renderRow(item, index)
                      }
                      contentContainerStyle={{padding: 15}}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </ImageBackground>

        <TaskModal
          visible={this.state.taskComplete}
          objSelectedChild={this.state.objSelectedChild}
          objFooterSelectedTask={this.state.objFooterSelectedTask}
          onStateChange={state => this.setState({taskComplete: state})}
          navigation={this.props.navigation}
          onClose={() => this.setModal()}
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
        />
      </View>
    );
  }
  //#endregion
}
