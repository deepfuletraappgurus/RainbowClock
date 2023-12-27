import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
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

  toggleDropdown() {
    this.setState({showDropdown: !this.state.showDropdown});
  }

  moveToAddNewTask = () => {
    this.props.navigation.navigate('SetupTimeBlockScreen');
  };

  moveToEditTask = item => {
    console.log('send task ' + JSON.stringify(item));
    if (this.state.isMenuAsParentPortal) {
      this.props.navigation.navigate('EditScheduleScreen', {
        scheduleDetails: item.tasks[0],
      });
    } else {
      this.setState({
        showTaskList: true,
        item: item,
      });
    }
  };

  selectDay = day => {
    this.setState({selectedDay: day}, () => this.getTaskList());
    this.toggleDropdown();
  };

  onPressTask(objTask) {
    if (
      objTask.status != Constants.TASK_STATUS_COMPLETED &&
      !this.state.isMenuAsParentPortal
    ) {
      this.setState({
        objFooterSelectedTask: objTask,
        taskComplete: true,
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
        console.log('PDF LIST ✅✅✅', JSON.stringify(response));
        if (response.ok) {
          if (response.data.success) {
            // let arr = []
            // if (response.data.data.length > 0) {
            const tasks = response.data.data.pdf;

            console.log('PDF ✅✅✅', tasks);
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
        console.log(error);
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
    console.log('-------ITEM', item);
    return (
      <TouchableOpacity
        style={[styles.ScheduleItem, {backgroundColor: item.tasks[0].color}]}
        onPress={() => this.moveToEditTask(item)}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          {/*MP*/}
          <Text style={styles.timer}>{item.time}</Text>
          <Image
            source={Images.bell}
            style={{
              width: Metrics.screenWidth / 16,
              height: Metrics.screenWidth / 16,
              resizeMode: 'contain',
            }}
          />
          <Text style={styles.timer}>{item.task_name}</Text>
        </View>
        {/*MP*/}
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
                          : styles.icon
                      }
                    />
                    <Text style={[styles.linkText,{color:Colors.snow}]}>{data?.task_name}</Text>
                  </TouchableOpacity>
                );
              })
            : null}
        </View>
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
                  data={this.state.arrTasks.sort((a, b) =>
                    a.time.localeCompare(b.time),
                  )}
                  extraData={this.state}
                  keyExtractor={(item, index) => index + ''}
                  renderItem={({item, index}) =>
                    this.renderTaskRow(item, index)
                  }
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
                  <View style={styles.inlineButton}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.buttonPrimary,
                        {marginBottom: 0},
                      ]}
                      onPress={() => this.moveToAddNewTask()}>
                      <Text style={styles.buttonText}>{'ADD NEW'}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inlineButton}>
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
                {console.log('arrWeekDays', this.state.arrWeekDays)}
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
        />
      </View>
    );
  }
  //#endregion
}
