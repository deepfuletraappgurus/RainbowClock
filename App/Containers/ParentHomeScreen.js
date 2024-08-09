import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import Swiper from 'react-native-swiper';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import {Colors, Images, Metrics} from '../Themes';
import {PieChart} from 'react-native-svg-charts';
import Api from '../Services/Api';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import CalendarStrip from 'react-native-calendar-strip';
import RBSheet from 'react-native-raw-bottom-sheet';
import {Calendar, LocaleConfig} from 'react-native-calendars';

import Tips from 'react-native-tips';


// Styles
import styles from './Styles/ParentHomeScreenStyles';
import BaseComponent from '../Components/BaseComponent';
import AnalogClock from '../Components/AnalogClock';
import {value} from 'deprecated-react-native-prop-types/DeprecatedTextInputPropTypes';
import images from '../Themes/Images';
// Global Variables
const objSecureAPI = Api.createSecure();
const ScheduleType = [
  {name: 'Regular', isSelect: true},
  {name: 'School Holidays', isSelect: false},
  {name: 'Custom', isSelect: false},
];

export default class ParentHomeScreen extends BaseComponent {
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

    //tips array ,Tips you want to show in home page
    this.homeTips = new Tips.Waterfall(Constants.PARENT_HOME_SCREEN_TIPS, {
      onEnd: async () => {
        try {
          AsyncStorage.setItem(
            Constants.PARENT_HOME_TIPS,
            JSON.stringify(false),
          );
        } catch (error) {}
      },
    });

    this.state = {
      school: false,
      modalVisible: false,
      clockFormateImage: images.am,
      taskComplete: false,
      objSelectedChild: [],
      is_24HrsClock: false,
      showDropdown: false,
      arrWeekDays: [],
      selectedDay: new Date(),
      meridiam: '',
      pieData: [],
      pieDataPM: [],
      pieDataAM: [],
      pieData24Hour: [],
      pieDataAM_School: [],
      pieDataPM_School: [],
      pieData24Hour_School: [],
      arrFooterTasks: [],
      isLoading: false,
      isRewardClaimed: false,
      tipsVisible: null,
      pauseUserInteraction: true,
      pieDataAMPM: [],
      pieDataAMSchool: [],
      scheduleType: ScheduleType,
      customScheduleText: '',
      showCustomTextInput: false,
      editingIndex: null,
      editingText: '',
      showFullCalender: false,
      pieDataPMAM: [],
    };

    this.handleNextTips = this.handleNextTips.bind(this);
  }

  //show next tips
  handleNextTips() {
    const tipsVisible = this.homeTips.next();
    console.log('TIP VISIBLEEEEEEEEEE', tipsVisible);
    if (tipsVisible == 'bell') {
      // this.toggleSchool();
    } else if (tipsVisible == 'rewards') {
      // this.toggleSchool();
    }
    this.setState({tipsVisible});
  }

  //start showing tips in home
  start() {
    this.setState({
      tipsVisible: this.homeTips.start(),
    });
  }

  //#region -> Component Methods
  componentDidMount = async () => {
    super.componentDidMount();
    this.getClockDetail();
    this.getChildDetail();
    var date, TimeType, hour;

    // Creating Date() function object.
    date = new Date();

    // Getting current hour from Date object.
    hour = date.getHours();

    // Checking if the Hour is less than equals to 11 then Set the Time format as AM.
    if (hour <= 11) {
      TimeType = 'AM';
    } else {
      // If the Hour is Not less than equals to 11 then Set the Time format as PM.
      TimeType = 'PM';
    }

    this.state.meridiam = Helper.getCurrentTimeMeridian();
    const upComingDays = Helper.getUpcominSevenDays();
    this.setState({
      arrWeekDays: upComingDays,
      selectedDay: upComingDays[0],
    });

    setTimeout(() => {
      this.setState({pauseUserInteraction: false});
    }, 3000);

    this.navFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        Helper.getChildRewardPoints(this.props.navigation);
      },
    );

    //check tips is already show or not in home if not then start showing tips
    AsyncStorage.getItem(Constants.PARENT_HOME_TIPS, (err, value) => {
      if (err) {
      } else {
        let isShowTime = JSON.parse(value);
        if (isShowTime != null) {
          if (isShowTime) {
            this.start();
          } else {
            this.homeTips.options.disabled = true;
          }
        }
      }
    });
  };
  //#endregion

  //#region -> Class Methods

  getClockDetail = async () => {
    const isTFClock = await AsyncStorage.getItem(Constants.KEY_IS_24HRS_CLOCK);
    if (child != '' && isTFClock == 'true') {
      this.state.is_24HrsClock = true;
    }
  };

  getChildDetail = () => {
    AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
      if (child != '') {
        this.setState({objSelectedChild: JSON.parse(child)}, () =>
          this.getTaskList(),
        );
      }
    });
  };

  toggleSwitch() {
    this.state.is_24HrsClock = !this.state.is_24HrsClock;
    this.setWatchData();
    try {
      AsyncStorage.setItem(
        Constants.KEY_IS_24HRS_CLOCK,
        JSON.stringify(this.state.is_24HrsClock),
      );
    } catch (error) {
      console.log('AsyncStorage Error: ', error);
    }
    this.setState({pieData});
  }

  toggleSchool() {
    if (this.state.is_24HrsClock) {
      this.toggleSwitch();
    }
    this.setState(
      {
        school: !this.state.school,
      },
      () => this.setWatchData(),
    );
  }

  onPressMoveToSetUpTimeBlock = () => {
    this.props.navigation.navigate('SetupTimeBlockScreen', {
      is_school_clock: this.state.school,
    });
  };

  onPressMoveToSchedule = () => {
    this.props.navigation.navigate('ScheduleScreen');
  };

  toggleDropdown() {
    this.setState({showDropdown: !this.state.showDropdown});
  }

  selectDayForClock = day => {
    this.setState({selectedDay: day}, () => {
      this.getTaskList();
      // this.updateMarkedDates();
    });
    this.toggleDropdown();
  };

  setWatchData() {
    pieData = '';
    if (this.state.is_24HrsClock) {
      pieData = this.state.school
        ? this.state.pieData24Hour_School
        : this.state.pieData24Hour;
    } else if (this.state.school) {
      var date, TimeType, hour;
      date = new Date();
      hour = date.getHours();

      if (
        this.state.pieDataAMPM.length == 1 &&
        this.state.pieDataAMPM[0].isEmpty
      ) {
        pieData = this.state?.pieDataAMSchool;
      } else {
        if (hour >= 6) {
          function filterTasks(tasks) {
            let endIndex = -1;
            for (let i = 0; i < tasks.length; i++) {
              const task = tasks[i];
              if (!task.taskId) continue;
              const startTime = moment(task.taskId.split(' - ')[0], 'hh:mm A');
              const endTime = moment(task.taskId.split(' - ')[1], 'hh:mm A');
              const sixPM = moment('06:00 PM', 'hh:mm A');
              if (startTime.isAfter(sixPM)) {
                endIndex = i;
                break;
              }
              if (endTime.isAfter(sixPM)) {
                task.value = sixPM.diff(startTime, 'minutes');
              }
            }
            if (endIndex !== -1) {
              return tasks.slice(0, endIndex);
            } else {
              return tasks;
            }
          }

          // Filter tasks
          const filteredTasks = filterTasks(this.state.pieDataAMPM);

          if (
            (typeof filteredTasks !== 'undefined' ||
              filteredTasks !== undefined) &&
            !this.state.isLoading
          ) {
            console.log('------FILTERRRRRR', filteredTasks);
            this.state.pieDataAMPM = filteredTasks;
            let secondLastTaskEndTime =
              this.state.pieDataAMPM[
                this.state.pieDataAMPM.length - 2
              ]?.taskId.split(' - ')[1];
            if (
              typeof secondLastTaskEndTime !== 'undefined' ||
              secondLastTaskEndTime !== undefined
            ) {
              let endTimeMeridiem =
                this.state.pieDataAMPM[this.state.pieDataAMPM.length - 2]
                  .endTimeMeridiem;

              // Create moment objects for end time and 6:00 PM
              let endTaskTime = moment(
                secondLastTaskEndTime + ' ' + endTimeMeridiem,
                'hh:mm A',
              );
              let sixPMTime = moment('06:00 PM', 'hh:mm A');

              // Calculate the difference between end time and 6:00 PM
              let timeDifference = sixPMTime.diff(endTaskTime, 'minutes');

              // Update the value property of the last task
              this.state.pieDataAMPM[this.state.pieDataAMPM.length - 1].value =
                timeDifference;
            }
            // Extract the end time from the taskId

            const startTime = parseInt(
              this.state.pieDataAMSchool[1]?.taskId.split(' ')[0].split(':')[0],
            );

            // Check if the start time is greater than or equal to 6:00 AM
            if (startTime <= 6) {
              // Update the value property of the first element to 0
              this.state.pieDataAMSchool[0].value = 0;
            } else {
              // Calculate the difference between 6:00 AM and the start time of the second element in minutes
              const differenceInMinutes = (6 - startTime) * 60;
              // Update the value property of the first element with the calculated difference
              this.state.pieDataAMSchool[0].value = Math.abs(
                isNaN(differenceInMinutes)
                  ? 360
                  : differenceInMinutes -
                      this.state.pieDataAMSchool[1]?.taskId
                        .split(' ')[0]
                        .split(':')[1],
              );
            }
            pieData = this.state?.pieDataAMPM.concat(
              this.state.pieDataAMSchool,
            );
          } else {
            console.log('*********');
            this.setState({
              pieDataAMPM: [{isEmpty: true, taskId: 'Blannk2', value: 0}],
            });
            pieData = [{isEmpty: true, taskId: 'Blannk2', value: 0}].concat(
              this.state.pieDataAMSchool,
            );
          }
          // console.log(
          //   '==========',
          //   this.state?.pieDataAMPM.concat(this.state.pieDataAMSchool),
          // );
        } else {
          pieData = this.state?.pieDataAMSchool;
        }
      }
    } else if (this.state.meridiam == 'am') {
      var date, TimeType, hour;
      date = new Date();
      hour = date.getHours();

      if (
        this.state.pieDataAMPM.length == 1 &&
        this.state.pieDataAMPM[0].isEmpty
      ) {
        pieData = this.state?.pieDataAM;
      } else {
        if (hour >= 6) {
          function filterTasks(tasks) {
            let endIndex = -1;
            for (let i = 0; i < tasks.length; i++) {
              const task = tasks[i];
              if (!task.taskId) continue;
              const startTime = moment(task.taskId.split(' - ')[0], 'hh:mm A');
              const endTime = moment(task.taskId.split(' - ')[1], 'hh:mm A');
              const sixPM = moment('06:00 PM', 'hh:mm A');
              if (startTime.isAfter(sixPM)) {
                endIndex = i;
                break;
              }
              if (endTime.isAfter(sixPM)) {
                task.value = sixPM.diff(startTime, 'minutes');
              }
            }
            if (endIndex !== -1) {
              return tasks.slice(0, endIndex);
            } else {
              return tasks;
            }
          }

          // Filter tasks
          const filteredTasks = filterTasks(this.state.pieDataAMPM);
          this.state.pieDataAMPM = filteredTasks;
          let secondLastTaskEndTime =
            this.state.pieDataAMPM[
              this.state.pieDataAMPM.length - 2
            ]?.taskId.split(' - ')[1];
          if (
            typeof secondLastTaskEndTime !== 'undefined' ||
            secondLastTaskEndTime !== undefined
          ) {
            let endTimeMeridiem =
              this.state.pieDataAMPM[this.state.pieDataAMPM.length - 2]
                .endTimeMeridiem;

            // Create moment objects for end time and 6:00 PM
            let endTaskTime = moment(
              secondLastTaskEndTime + ' ' + endTimeMeridiem,
              'hh:mm A',
            );
            let sixPMTime = moment('06:00 PM', 'hh:mm A');

            // Calculate the difference between end time and 6:00 PM
            let timeDifference = sixPMTime.diff(endTaskTime, 'minutes');

            // Update the value property of the last task
            this.state.pieDataAMPM[this.state.pieDataAMPM.length - 1].value =
              timeDifference;
          }
          // Extract the end time from the taskId

          const startTime = parseInt(
            this.state.pieDataAM[1]?.taskId.split(' ')[0].split(':')[0],
          );

          // Check if the start time is greater than or equal to 6:00 AM
          if (startTime <= 6 || startTime == 12) {
            // Update the value property of the first element to 0
            this.state.pieDataAM[0].value = 0;
          } else {
            // Calculate the difference between 6:00 AM and the start time of the second element in minutes
            const differenceInMinutes = (6 - startTime) * 60;
            // Update the value property of the first element with the calculated difference
            this.state.pieDataAM[0].value = Math.abs(
              isNaN(differenceInMinutes)
                ? 360
                : differenceInMinutes -
                    this.state.pieDataAMSchool[1]?.taskId
                      .split(' ')[0]
                      .split(':')[1],
            );
          }
          pieData = this.state?.pieDataAMPM.concat(this.state.pieDataAM);
        } else {
          pieData = this.state?.pieDataAM;
        }
      }
    } else {
      var date, TimeType, hour;
      date = new Date();
      hour = date.getHours();
      if (hour >= 18 && this.state.pieDataPMAM[0].value !== 720) {
        console.log('pieDataPMAM---', this.state.pieDataPMAM);
        const SIX_AM = moment('06:00 AM', 'hh:mm A');
        const tasks = this.state.pieDataPMAM;

        // Step 1: Remove tasks starting after 6 AM
        const filteredTasks = tasks.filter(task => {
          if (task.isEmpty) return true;
          const startTime = moment(task?.taskId?.split(' - ')[0], 'hh:mm A');
          return startTime.isBefore(SIX_AM);
        });

        // Step 2: Remove all tasks after the first task that ends after 6 AM
        let foundEndAfterSix = false;
        const adjustedTasks = filteredTasks.filter(task => {
          if (foundEndAfterSix) return false;
          if (task.isEmpty) return true;

          const endTime = moment(task?.taskId?.split(' - ')[1], 'hh:mm A');
          if (endTime.isAfter(SIX_AM)) {
            foundEndAfterSix = true;
            return true;
          }
          return true;
        });

        // Step 3: Adjust the last task based on the time difference to 6 AM
        let finalTasks = [];
        let lastTask = adjustedTasks?.slice(-1)[0];

        // Find the last task with a time string
        while (lastTask?.isEmpty && adjustedTasks.length > 0) {
          adjustedTasks.pop();
          lastTask = adjustedTasks.slice(-1)[0];
        }

        if (!lastTask?.isEmpty && lastTask?.taskId) {
          const endTime = moment(lastTask?.taskId.split(' - ')[1], 'hh:mm A');
          if (endTime.isAfter(SIX_AM)) {
            const difference = endTime?.diff(SIX_AM, 'minutes');
            lastTask.value -= difference;
            finalTasks = adjustedTasks
              .slice(0, adjustedTasks.length - 1)
              .concat(lastTask);
          } else {
            const difference = SIX_AM.diff(endTime, 'minutes');
            finalTasks = adjustedTasks.concat({
              isEmpty: true,
              taskId: 'Blannk4',
              value: difference,
            });
          }
        } else {
          finalTasks = adjustedTasks;
        }
        console.log('FINAL_TASK===-', finalTasks, adjustedTasks);

        // Helper function to convert time to minutes from 12:00 AM
        function timeToMinutes(time) {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        }

        // Helper function to get the start time in minutes from 12:00 AM
        function getStartTimeInMinutes(taskId) {
          const [startTime, meridiem] = taskId.split(' - ')[0].split(' ');
          let [hours, minutes] = startTime.split(':').map(Number);

          if (meridiem === 'PM' && hours !== 12) {
            hours += 12;
          } else if (meridiem === 'AM' && hours === 12) {
            hours = 0;
          }

          return hours * 60 + minutes;
        }

        // Find the first object with taskId in time form
        const firstTimeTask = this.state.pieDataPM.find(task =>
          /AM|PM/.test(task.taskId),
        );
        if (firstTimeTask) {
          const startTimeMinutes = getStartTimeInMinutes(firstTimeTask?.taskId);
          const sixPMMinutes = timeToMinutes('18:00');

          // Calculate the difference in minutes between the start time and 6 PM
          const differenceInMinutes = startTimeMinutes - sixPMMinutes;

          // Update the first object's value property
          this.state.pieDataPM[0].value = differenceInMinutes;
        }

        console.log('#######--######', this.state?.pieDataPM);

        pieData = finalTasks.concat(this.state?.pieDataPM);
      } else {
        console.log('PIEDATAPM----', this.state?.pieDataPM);
        pieData = this.state?.pieDataPM;
      }
    }
    if (this.state.currentTaskSlot) {
      Helper.getPaginatedArray(
        this.state.currentTaskSlot[0].tasks,
        4,
        arrFooterTasks => {
          this.setState({arrFooterTasks});
        },
      );
    }
    this.setState({
      pieData,
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

  onCloseTaskPress() {
    this.setState(prevState => ({
      customScheduleText: '',
      showCustomTextInput: false,
    }));
  }

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

  renderClockView() {
    data = this.state.pieData;
    const clearColor = Colors.clear;
    var date, TimeType, hour;

    // Creating Date() function object.
    date = new Date();

    // Getting current hour from Date object.
    hour = date.getHours();

    // Checking if the Hour is less than equals to 11 then Set the Time format as AM.
    if (hour <= 11) {
      TimeType = 'AM';
    } else {
      // If the Hour is Not less than equals to 11 then Set the Time format as PM.
      TimeType = 'PM';
    }
    // const pieData = data.map(({value, isEmpty, color}, index) => ({
    //   value,
    //   svg: {
    //     fill:
    //       isEmpty && !color
    //         ? this.state.school
    //           ? Colors.gray
    //           : clearColor
    //         : color,
    //   },
    //   key: `pie-${index}`,
    //   index: index,
    // }));
    if (this.state.school) {
    }
    const pieData = data.map(
      ({value, isEmpty, color, is_school_clock}, index) => ({
        value,
        svg: {
          fill:
            isEmpty && !color
              ? this.state.school
                ? Colors.gray
                : clearColor
              : color,
          // fill: this.state.school ?!color ? Colors.black:Colors.blue:Colors.bloodOrange,
          // fill:color,

          onPress: () => {},
        },
        key: `pie-${index}`,
        // key: `pie-5`,
        index: index,
        is_school_clock: is_school_clock,
      }),
    );
    const pieDataTras = data.map(
      ({taskId, value, isEmpty, is_school_clock}, index) => ({
        value,
        svg: {
          fill: clearColor,
          onPress: () => {
            is_school_clock || this.state.is_24HrsClock
              ? {}
              : this.onPressMoveToSetUpTimeBlock();
          },
        },
        key: `pie-${index}`,
        index: index,
        is_school_clock: is_school_clock,
      }),
    );

    console.log('PARENT PIEDATA', pieData, pieDataTras, data);

    // const clockFormateImage = this.state.is_24HrsClock
    //   ? Images.clockFaceDigit24HRS
    //   : Images.clockFaceDigit;
    if (this.state.is_24HrsClock) {
      this.state.clockFormateImage = Images.clockFaceDigit24HRS;
    } else if (this.state.school) {
      this.state.clockFormateImage = images.am_pm;
    } else if (hour >= 0 && hour < 6) {
      this.state.clockFormateImage = images.am;
    } else if (hour >= 6 && hour < 12) {
      this.state.clockFormateImage = images.am_pm;
    } else if (hour >= 12 && hour < 18) {
      this.state.clockFormateImage = images.pm;
    } else if (hour >= 18 && hour < 24) {
      this.state.clockFormateImage = images.pm_am;
    }

    return (
      <TouchableOpacity
        style={styles.clock}
        activeOpacity={this.state.is_24HrsClock ? 1 : 0}
        onPress={() => {
          if (this.state.is_24HrsClock) {
          } else {
            this.onPressMoveToSetUpTimeBlock();
          }
        }}>
        <Image
          source={this.state.school ? Images.clockPurpleLight : Images.clock}
          style={styles.clockImage}
        />

        <View style={styles.clockTimerView}>
          <PieChart
            style={styles.clockChartView}
            data={
              this.state.is_24HrsClock
                ? pieData
                : this.state.school
                ? pieData.map(obj => {
                    if (obj.is_school_clock === true) {
                      return obj; // If is_school_clock is already 1, leave value unchanged
                    } else {
                      return {...obj, svg: {...obj.svg, fill: '#ffffff'}}; // Otherwise, update value to 0
                    }
                  })
                : pieData.map(obj => {
                    if (obj.is_school_clock !== true) {
                      return obj; // If is_school_clock is already 1, leave value unchanged
                    } else {
                      return {...obj, svg: {...obj.svg, fill: '#ffffff'}}; // Otherwise, update value to 0
                    }
                  })
            }
            innerRadius={0}
            outerRadius={0}
            padAngle={0}
            sort={(a, b) => {
              return a.index > b.index;
            }}
          />
          <Image
            source={this.state.clockFormateImage}
            resizeMode={'contain'}
            style={styles.clockChartView}
          />
          <AnalogClock hourFormate={this.state.is_24HrsClock ? 24 : 12} />

          <PieChart
            style={styles.clockChartView}
            data={
              this.state.is_24HrsClock
                ? pieDataTras
                : this.state.school
                ? pieDataTras.map(obj => {
                    if (obj.is_school_clock !== true) {
                      return {...obj, value: 0}; // If is_school_clock is already 1, leave value unchanged
                    } else {
                      return {...obj, value: 0}; // Otherwise, update value to 0
                    }
                  })
                : pieDataTras.filter(item => item.is_school_clock !== true)
            }
            outerRadius="100%"
            innerRadius="1%"
            padAngle={0}
            sort={(a, b) => {
              return a.index > b.index;
            }}
          />
        </View>
      </TouchableOpacity>
    );
  }

  renderFooterView() {
    const pagesCount = this.state.arrFooterTasks.length;
    const pages = [...new Array(pagesCount)].map((item, index) => {
      return this.renderPage(index);
    });
    return pages;
  }

  renderPage(pageIndex) {
    const itemsCount = this.state.arrFooterTasks[pageIndex].length;
    const item = [...new Array(itemsCount)].map((item, index) => {
      return this.renderFooterItem(pageIndex, index);
    });
    return <View style={styles.footerIconList}>{item}</View>;
  }

  renderFooterItem(pageIndex, index) {
    const task = this.state.arrFooterTasks[pageIndex][index];
    return (
      <TouchableOpacity style={styles.iconTouch}>
        <Image
          source={{uri: task.cate_image}}
          style={
            task.status == Constants.TASK_STATUS_COMPLETED
              ? styles.fadedIcon
              : styles.icon
          }
        />
      </TouchableOpacity>
    );
  }

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
  //#endregion

  //#region -> API Call
  getTaskList = () => {
    this.setState({isLoading: true});
    const aDate = Helper.dateFormater(
      new Date(this.state.selectedDay),
      'dddd DD MMMM YYYY',
      'YYYY-MM-DD',
    );
    var date, TimeType, hour;
    date = new Date();
    hour = date.getHours();
    const next_day = hour >= 18 ? 1 : 0;
    objSecureAPI
      .childTasksList(this.state.objSelectedChild.id, '', aDate, 0, next_day)
      .then(response => {
        if (response.ok) {
          if (response.data.success) {
            let arr = [];
            if (response.data.data.length > 0) {
              const tasks = response.data.data[0].tasks;
              this.state.isRewardClaimed = response.data.data[0].is_claimed;
              this.state.isRewardClaimed == true
                ? this.callClearRewardNotification()
                : null;
              Object.keys(tasks).map(item => {
                arr.push({time: item, tasks: tasks[item]});
              });
              this.setState({arrTasks: arr, arrFilteredTasks: arr});
              const todaysSchoolHours =
                response.data.data[0].school_hours[Helper.getTodaysDay()];
              const schoolHoursFrom = moment(
                todaysSchoolHours ? todaysSchoolHours.FROM : '00:00',
                'hh:mm A',
              );
              const schoolHoursTo = moment(
                todaysSchoolHours ? todaysSchoolHours.TO : '00:00',
                'hh:mm A',
              );
              const schoolHoursFromMeradian = schoolHoursFrom.format('A');
              const schoolHoursToMeradian = schoolHoursTo.format('A');
              Helper.setupTasksBasedOnMeridiem(
                this.state.arrTasks,
                schoolHoursFrom,
                schoolHoursTo,
                (
                  arrAM,
                  arrPM,
                  runningTimeSlot,
                  arrAM_School,
                  arrPM_School,
                  is_school_clock,
                ) =>
                  setTimeout(() => {
                    this.setupTaskData(
                      arrAM,
                      arrPM,
                      runningTimeSlot,
                      arrAM_School,
                      arrPM_School,
                      todaysSchoolHours,
                      schoolHoursFromMeradian,
                      schoolHoursToMeradian,
                      is_school_clock,
                    );
                  }, 200),
              );
            }
          } else {
            Helper.showErrorMessage(response.data.message);
          }
        } else {
          this.setState({isLoading: false});
          Helper.showErrorMessage(response.problem);
        }
      })
      .catch(error => {
        this.setState({isLoading: false});
      });
  };

  setupTaskData(
    arrAM,
    arrPM,
    runningTimeSlot,
    arrAM_School,
    arrPM_School,
    todaysSchoolHours,
    schoolHoursFromMeradian,
    schoolHoursToMeradian,
    is_school_clock,
  ) {
    {
      this.state.isLoading = false;
      const pieDataAM = Helper.generateClockTaskArray(
        arrAM,
        'am',
        undefined,
        false,
      );
      const pieDataPM = Helper.generateClockTaskArray(
        arrPM,
        'pm',
        undefined,
        false,
      );
      const pieDataAMPM = Helper.generateClockTaskArray(arrPM, 'pm', 3, false);
      const pieDataPMAM = Helper.generateClockTaskArray(arrAM, 'am', 1, false);
      const pieDataAMSchool = Helper.generateClockTaskArray(
        arrAM,
        'am',
        2,
        false,
      );

      const pieDataAM24Hour = Helper.generateClockTaskArray(
        arrAM,
        'am',
        1,
        true,
      );
      const pieDataPM24Hour = Helper.generateClockTaskArray(
        arrPM,
        'pm',
        2,
        true,
      );

      // const pieDataAM_School = Helper.generateClockTaskArray(arrAM_School,"am",true);
      // const pieDataPM_School = Helper.generateClockTaskArray(arrPM_School,"pm",true);
      var pieDataAM_School = [];
      var pieDataPM_School = [];
      if (todaysSchoolHours) {
        if (schoolHoursFromMeradian != schoolHoursToMeradian) {
          pieDataAM_School = Helper.generateClockTaskArraySchool(
            arrAM_School,
            'am',
            todaysSchoolHours.FROM,
            '11:59 AM',
            '',
            true,
          );
          pieDataPM_School = Helper.generateClockTaskArraySchool(
            arrPM_School,
            'pm',
            '12:00 PM',
            todaysSchoolHours.TO,
            '',
            true,
          );
        } else {
          pieDataAM_School = Helper.generateClockTaskArraySchool(
            arrAM_School,
            'am',
            todaysSchoolHours.FROM,
            todaysSchoolHours.TO,
            schoolHoursFromMeradian,
          );
          pieDataPM_School = Helper.generateClockTaskArraySchool(
            arrPM_School,
            'pm',
            todaysSchoolHours.FROM,
            todaysSchoolHours.TO,
            schoolHoursFromMeradian,
          );
        }
      }
      this.state.currentTaskSlot = runningTimeSlot;
      pieData24Hour = [...pieDataAM24Hour, ...pieDataPM24Hour];
      pieData24Hour_School = [...pieDataAM_School, ...pieDataPM_School];
      meridian = Helper.getCurrentTimeMeridian();

      this.setState(
        {
          meridian,
          pieDataPM,
          pieDataAM,
          pieData24Hour,
          pieDataAM_School,
          pieDataPM_School,
          pieData24Hour_School,
          pieDataAMPM,
          pieDataAMSchool,
          pieDataPMAM,
        },
        () => this.setWatchData(),
      );
    }
  }

  callClearRewardNotification() {
    objSecureAPI
      .clearRewardNotification(this.state.objSelectedChild.id)
      .then(response => {
        if (response.ok) {
          if (response.data.success) {
          }
        } else {
          this.setState({isLoading: false});
          Helper.showErrorMessage(response.problem);
        }
      })
      .catch(error => {
        this.setState({isLoading: false});
      });
  }
  //#endregion

  //#region -> View Render
  renderRow(item, index) {
    return (
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => this.selectDayForClock(item)}>
        <Text style={styles.dropdownItemText}>{item}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const renderPagination = (index, total, context) => {
      return null;
    };
    return (
      <View
        style={styles.mainContainer}
        pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        <Tips
          contentStyle={{flex: 1}}
          tooltipContainerStyle={[
            styles.tooltipContainerStyle,
            {
              left: 10,
              top: Helper.isIPhoneX() ? 190 : 170,
            },
          ]}
          style={styles.Tips}
          tooltipArrowStyle={styles.tooltipArrowStyle}
          visible={this.state.tipsVisible == 'colorWedge'}
          onRequestClose={this.handleNextTips}
          text="Tap on the clock to start  creating your schedule"
          textStyle={styles.tipstextStyle}
        />

        <Tips
          contentStyle={[
            styles.contentStyle,
            {
              maxWidth: 200,
            },
          ]}
          tooltipContainerStyle={[
            styles.tooltipContainerStyle,
            {
              left: '50%',
              top: Helper.isIPhoneX() ? 190 : 170,
            },
          ]}
          style={[styles.Tips]}
          tooltipArrowStyle={styles.tooltipArrowStyle}
          textStyle={styles.tipstextStyle}
          visible={this.state.tipsVisible === 'bell'}
          onRequestClose={this.handleNextTips}
          text="Tap the bell to setup the school hour tasks"
        />

        <Tips
          contentStyle={[styles.contentStyle, {left: null, right: 0}]}
          visible={this.state.tipsVisible === 'rewards'}
          onRequestClose={this.handleNextTips}
          text="Setup rewards for your child in the menu"
          style={[styles.Tips, {left: null, right: 0}]}
          tooltipArrowStyle={styles.tooltipArrowStyle}
          textStyle={styles.tipstextStyle}
          tooltipContainerStyle={[
            styles.tooltipContainerStyle,
            {
              left: null,
              right: 20,
              top: Helper.isIPhoneX() ? 190 : 170,
            },
          ]}
        />

        <ImageBackground
          source={
            this.state.school ? Images.cyanBackground : Images.blueBackground
          }
          style={styles.backgroundImage}>
          <View style={[styles.container]}>
            <View style={{}}>
              <View style={styles.clockHeader}>
                <View
                  style={[
                    styles.userName,
                    {marginBottom: this.state.school ? -15 : 0, marginTop: 15},
                  ]}>
                  <Text style={styles.userNameText}>
                    {' '}
                    {this.state.objSelectedChild &&
                    this.state.objSelectedChild.name
                      ? // ? this.state.objSelectedChild.name.toUpperCase() + "’S CLOCK"
                        this.state.school
                        ? 'SCHOOL CLOCK'
                        : this.state.objSelectedChild.name.toUpperCase() +
                          '’S CLOCK'
                      : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.clockBody}>{this.renderClockView()}</View>
              <View style={styles.clockBottom}>
                <View style={[styles.clockBottomItem, styles.clockBottomLeft]}>
                  <TouchableOpacity
                    style={styles.bellTouch}
                    onPress={() => this.toggleSchool()}>
                    {!this.state.school ? (
                      <Image source={Images.bell} style={styles.bell} />
                    ) : (
                      <Image source={Images.school} style={styles.school} />
                    )}
                  </TouchableOpacity>
                  {this.state.school ? (
                    <View
                      style={
                        ([
                          styles.clockBottomItem,
                          styles.clockBottomRight,
                          styles.center,
                        ],
                        {alignItems: 'flex-start'})
                      }>
                      <TouchableOpacity
                        onPress={() => this.onPressMoveToSchedule()}>
                        <Image
                          source={Images.navIcon3}
                          style={styles.calendarIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.Switch,
                        this.state.is_24HrsClock
                          ? styles.switch24Hrs
                          : styles.switch12Hrs,
                      ]}
                      onPress={() => this.toggleSwitch()}>
                      {this.state.is_24HrsClock ? (
                        <View style={styles.SwitchButton24Hrs} />
                      ) : null}
                      <Text
                        style={
                          this.state.is_24HrsClock
                            ? styles.SwitchText24Hrs
                            : styles.SwitchText
                        }>
                        {this.state.is_24HrsClock ? '24hr' : '12hr'}
                      </Text>
                      {!this.state.is_24HrsClock ? (
                        <View style={styles.SwitchButton} />
                      ) : null}
                    </TouchableOpacity>
                  )}
                </View>
                {!this.state.school && (
                  <View
                    style={[
                      styles.clockBottomItem,
                      styles.clockBottomRight,
                      styles.center,
                    ]}>
                    <TouchableOpacity
                      onPress={() => this.onPressMoveToSchedule()}>
                      <Image
                        source={Images.navIcon3}
                        style={styles.calendarIcon}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                <View
                  style={[
                    styles.clockBottomItem,
                    styles.clockBottomRight,
                    styles.center,
                  ]}>
                  {this.state.school === true ? (
                    <Image
                      source={Images.schoolBus}
                      style={[styles.alarmClock]}
                    />
                  ) : null}
                </View>
              </View>
            </View>

            <View style={{flex: 1, width: '100%'}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  // flex:1
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
              {console.log('SELECTED DAY_______', this.state.selectedDay)}
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
                      selectedDayBackgroundColor: 'red',
                      selectedDayTextColor: '#ffffff',
                      todayTextColor: Colors.snow,
                      dayTextColor: '#2d4150',
                      textDisabledColor: '#D5E2EB',
                      todayBackgroundColor: Colors.blue,
                      textSectionTitleColor: Colors.pink,
                    }}
                    headerStyle={{color: Colors.pink}}
                    showSixWeeks={false}
                    hideExtraDays={true}
                    disableMonthChange={true}
                    hideArrows={true}
                    renderHeader={date => {
                      return <></>;
                    }}
                    onDayPress={day => {
                      console.log('==---', day);
                      this.selectDayForClock(day.dateString);
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
                      console.log('!!!!!!!!!', e);
                      // {this.setState({selectDay: new Date(e)})
                      this.selectDayForClock(moment(e).format('YYYY-MM-DD'));
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
          <SafeAreaView
            style={[
              {justifyContent: 'center'},
              this.state.currentTaskSlot && this.state.arrFooterTasks.length > 0
                ? {
                    backgroundColor: this.state.is_24HrsClock
                      ? this.state.currentTaskSlot[0].tasks[0].color // Always show background color
                      : this.state.currentTaskSlot[0].tasks[0]
                          .is_school_clock == this.state.school
                      ? this.state.currentTaskSlot[0].tasks[0].color // Show if both conditions are met
                      : null,
                  }
                : null,
            ]}>
            <View
              style={[
                styles.footer,
                {justifyContent: 'center'},
                this.state.currentTaskSlot &&
                this.state.arrFooterTasks.length > 0
                  ? {
                      backgroundColor: this.state.is_24HrsClock
                        ? this.state.currentTaskSlot[0].tasks[0].color // Always show background color
                        : this.state.currentTaskSlot[0].tasks[0]
                            .is_school_clock == this.state.school
                        ? this.state.currentTaskSlot[0].tasks[0].color // Show if both conditions are met
                        : null,
                    }
                  : null,
              ]}>
              {this.state.isLoading ? (
                <View>
                  <Text style={styles.smallWaitText}>
                    {Constants.TEXT_FATCHING_TASKS}
                  </Text>
                </View>
              ) : this.state.currentTaskSlot &&
                this.state.arrFooterTasks.length > 0 ? (
                <Swiper
                  showsButtons={true}
                  key={this.state.currentTaskSlot.length}
                  nextButton={
                    <Image source={Images.next} style={styles.footerArrow} />
                  }
                  prevButton={
                    <Image source={Images.prev} style={styles.footerArrow} />
                  }
                  renderPagination={renderPagination}
                  loop={false}>
                  {this.renderFooterView(this.state.currentTaskSlot)}
                </Swiper>
              ) : (
                <View>
                  <Text style={styles.smallWaitText}>
                    {Constants.TEXT_NO_TASKS}
                  </Text>
                </View>
              )}
            </View>
          </SafeAreaView>
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
      </View>
    );
  }
  //#endregion
}
