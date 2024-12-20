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
  ScrollView,
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
import {Swipeable} from 'react-native-gesture-handler';
import Tips from 'react-native-tips';
import {Animated} from 'react-native';

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
    this.swipeableRef = React.createRef();

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
      futurearrTask: [],
      futurearrFilteredTasks: [],
      futuredicPieData: {},
      markedDates: {},
      isSwiped: false,
      selectedMonth: new Date().getMonth(), // Tracks the selected month
      selectedYear: new Date().getFullYear(),
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
    setTimeout(() => {
      if (this.swipeableRef.current) {
        this.swipeableRef.current.openRight(); // Programmatically swipe to open right actions

        // After 1 second, unswipe (close) the row
        setTimeout(() => {
          if (this.swipeableRef.current) {
            this.swipeableRef.current.close(); // Programmatically close the swipe action
          }
        }, 1000); // Delay to unswipe (1 second after opening)
      }
    }, 3000);
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
            setTimeout(() => {
              this.start();
            }, 2000);
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
      selectedDate: this.state.selectedDay,
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
    var futureStateData = this.state.futuredicPieData;
    if (this.state.is_24HrsClock) {
      var date, TimeType, hour;
      date = new Date();
      hour = date.getHours();
      console.log('24 HOUR -----', futureStateData);
      pieData = this.state.school
        ? hour >= 18
          ? futureStateData.pieData24Hour_School
          : this.state.pieData24Hour_School
        : hour >= 18
        ? futureStateData.pieData24Hour
        : this.state.pieData24Hour;
    } else if (this.state.school) {
      var date, TimeType, hour;
      date = new Date();
      hour = date.getHours();
      let schoolPieDataAMPM =
        hour >= 18 ? futureStateData.pieDataAMPM : this.state.pieDataAMPM;
      let schoolPieDataAMSchool =
        hour >= 18
          ? futureStateData.pieDataAMSchool
          : this.state.pieDataAMSchool;
      if (schoolPieDataAMPM?.length == 1 && schoolPieDataAMPM[0].isEmpty) {
        pieData = schoolPieDataAMSchool;
      } else {
        function filterTasks(tasks) {
          let endIndex = -1;
          for (let i = 0; i < tasks?.length; i++) {
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
        const filteredTasks = filterTasks(schoolPieDataAMPM);
        console.log('!!!!---!!!!!', filteredTasks);
        if (
          (typeof filteredTasks !== 'undefined' ||
            filteredTasks !== undefined) &&
          !this.state.isLoading &&
          filteredTasks.length !== 1
        ) {
          schoolPieDataAMPM = filteredTasks;
          let secondLastTaskEndTime =
            schoolPieDataAMPM[schoolPieDataAMPM?.length - 2]?.taskId?.split(
              ' - ',
            )[1];
          console.log('1---1', schoolPieDataAMPM);
          let endTimeMeridiem =
            schoolPieDataAMPM[schoolPieDataAMPM?.length - 2].endTimeMeridiem;

          // Create moment objects for end time and 6:00 PM
          let endTaskTime = moment(
            secondLastTaskEndTime + ' ' + endTimeMeridiem,
            'hh:mm A',
          );
          let sixPMTime = moment('06:00 PM', 'hh:mm A');

          // Calculate the difference between end time and 6:00 PM
          let timeDifference = sixPMTime.diff(endTaskTime, 'minutes');

          // Update the value property of the last task
          schoolPieDataAMPM[schoolPieDataAMPM?.length - 1].value =
            timeDifference;
          // Extract the end time from the taskId
          if (!this.state.isLoading && schoolPieDataAMSchool !== undefined) {
            const startTime = parseInt(
              schoolPieDataAMSchool[1]?.taskId.split(' ')[0].split(':')[0],
            );
            console.log('--44---', schoolPieDataAMSchool, startTime);
            // Check if the start time is greater than or equal to 6:00 AM
            if (startTime <= 6) {
              // Update the value property of the first element to 0
              schoolPieDataAMSchool[0].value = 0;
            } else {
              // Calculate the difference between 6:00 AM and the start time of the second element in minutes
              const differenceInMinutes = (6 - startTime) * 60;
              console.log('===11===', differenceInMinutes);
              // Update the value property of the first element with the calculated difference
              schoolPieDataAMSchool[0].value = Math.abs(
                isNaN(differenceInMinutes)
                  ? 360
                  : differenceInMinutes <= 0
                  ? 0
                  : differenceInMinutes -
                    schoolPieDataAMSchool[1]?.taskId
                      .split(' ')[0]
                      .split(':')[1],
              );
            }
          }
        } else {
          schoolPieDataAMPM = [{isEmpty: true, taskId: 'Blannk2', value: 0}];
          console.log('ERROR');
        }
        console.log(
          '555====5555',
          schoolPieDataAMPM.concat(schoolPieDataAMSchool),
        );
        pieData = schoolPieDataAMPM.concat(schoolPieDataAMSchool);
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

  onCloseTaskPress = () => {
    const {editingIndex, scheduleType} = this.state;

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
    this.setState({showCustomTextInput: false});
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

  renderRightActions = (progress, dragX, index) => {
    return (
      <View
        style={{
          backgroundColor: 'red', // Red background for delete action
          justifyContent: 'center',
          alignItems: 'center',
          width: 80, // Width of the swipe area
          height: '100%', // Full height of the swiped item
        }}>
        <TouchableOpacity onPress={() => this.handleDelete(index)}>
          <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  renderScheduleTypes = ({item, index}) => {
    return (
      <Swipeable
        ref={this.swipeableRef} // Attach the ref to the Swipeable component
        renderRightActions={(progress, dragX) =>
          this.renderRightActions(progress, dragX, index)
        }
        overshootRight={false}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
            justifyContent: 'flex-start',
            backgroundColor: 'white', // Row background
          }}>
          <TouchableOpacity onPress={() => console.log('Selected!')}>
            <Text>{item?.name}</Text>
          </TouchableOpacity>
        </View>
      </Swipeable>
    );
  };

  handleDelete = index => {
    const updatedList = this.state.scheduleType.filter((_, i) => i !== index);
    this.setState({scheduleType: updatedList});
  };

  handleEdit = index => {
    const itemToEdit = this.state.scheduleType[index];
    this.setState({
      editingIndex: index, // Set the index of the item being edited
      editingText: itemToEdit.name, // Set the value to be edited
      showCustomTextInput: false, // Ensure custom input is closed while editing
    });
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
              this.setMarkedDates(response.data.data[0].tasks);
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

    if (hour >= 18) {
      objSecureAPI
        .childTasksList(this.state.objSelectedChild.id, '', aDate, 0, 0)
        .then(response => {
          if (response.ok) {
            this.setState({isLoading: false});
            if (response.data.success) {
              console.log(
                'CLOCK RESPONSE-----6666-',
                JSON.stringify(response.data.data),
              );
              let arr = [];
              if (response.data.data.length > 0) {
                const tasks = response.data.data[0].tasks;

                Object.keys(tasks).map(item => {
                  arr.push({time: item, tasks: tasks[item]});
                });
                this.setState({
                  futurearrTask: arr,
                  futurearrFilteredTasks: arr,
                });
                const todaysSchoolHours =
                  this.state.objSelectedChild.school_hours[
                    Helper.getTodaysDay()
                  ];

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
                  this.state.futurearrTask,
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
                      this.futuresetupTaskData(
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
                this.setState({scrollable: true});
              }
            } else {
              this.setState({scrollable: true});
              Helper.showErrorMessage(response.data.message);
            }
          } else {
            this.setState({scrollable: true});
            this.setState({
              isLoading: false,
            });
            Helper.showErrorMessage(response.problem);
          }
        })
        .catch(error => {
          this.setState({scrollable: true});
          this.setState({
            isLoading: false,
          });
        });
    }
  };

  getDatesForDays(days) {
    const today = moment();
    const next7Days = [];

    days.forEach(day => {
      for (let i = 0; i < 7; i++) {
        const currentDay = today.clone().add(i, 'days');
        if (currentDay.format('dddd') === day) {
          next7Days.push(currentDay.format('YYYY-MM-DD'));
        }
      }
    });

    return next7Days;
  }

  setMarkedDates(taskData) {
    const newMarkedDates = {};

    // Loop through task data and mark dates where is_date is 0
    Object.values(taskData).forEach(timeSlots => {
      timeSlots.forEach(task => {
        if (task.is_date === 0) {
          const daysArray = task.days.split(',');
          const datesToMark = this.getDatesForDays(daysArray);

          datesToMark.forEach(date => {
            newMarkedDates[date] = {
              customStyles: {
                container: {
                  backgroundColor: 'red', // Red background for specific day
                  borderRadius: 50,
                  borderWidth: 2,
                  borderColor: 'red',
                },
                text: {
                  color: 'white',
                  fontWeight: 'bold',
                },
              },
            };
          });
        }
      });
    });

    // Update state with marked dates
    this.setState({markedDates: newMarkedDates});
  }

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
    var date, TimeType, hour;
    date = new Date();
    hour = date.getHours();
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
        hour >= 18 ? 2 : undefined,
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

  futuresetupTaskData(
    arrAM,
    arrPM,
    runningTimeSlot,
    arrAM_School,
    arrPM_School,
    todaysSchoolHours,
    schoolHoursFromMeradian,
    schoolHoursToMeradian,
    currentIndex,
    is_school_clock,
  ) {
    var date, TimeType, hour;
    date = new Date();
    hour = date.getHours();
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
        hour >= 18 ? 2 : undefined,
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

      this.state.futuredicPieData = {
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
      };
      if (this.state.is_24HrsClock) {
        this.setWatchData();
      }
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

  handleMonthChange = month => {
    this.setState({
      selectedMonth: month.month - 1, // react-native-calendars gives months 1-12
      selectedYear: month.year,
    });
  };

  renderHeader = () => {
    const {selectedMonth, selectedYear} = this.state;
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return (
      <View style={{alignItems: 'center'}}>
        <Text style={{fontSize: 18, fontWeight: 'bold', color: 'pink'}}>
          {`${monthNames[selectedMonth]} ${selectedYear}`}
        </Text>
      </View>
    );
  };

  renderArrow = direction => {
    const {selectedMonth, selectedYear} = this.state;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Hide the back arrow if in the current month and year
    if (
      direction === 'left' &&
      selectedYear === currentYear &&
      selectedMonth === currentMonth
    ) {
      return null;
    }

    // Show the arrow
    return (
      <Text style={{fontSize: 20, color: 'pink'}}>
        {direction === 'left' ? '<' : '>'}
      </Text>
    );
  };

  handlePressArrowLeft = subtractMonth => {
    const {selectedMonth, selectedYear} = this.state;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Only allow going back if it's not the current month and year
    if (!(selectedYear === currentYear && selectedMonth === currentMonth)) {
      subtractMonth();
    }
  };

  render() {
    const renderPagination = (index, total, context) => {
      return null;
    };
    const {markedDates, selectedMonth, selectedYear} = this.state;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

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
          contentStyle={styles.contentStyle}
          tooltipContainerStyle={[
            styles.tooltipContainerStyle,
            {
              left: 70,
              top: Helper.isIPhoneX()
                ? Metrics.screenHeight / 1.2
                : Metrics.screenHeight / 1.3,
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
              top: Helper.isIPhoneX() ? 75 : 60,
            },
          ]}
        />

        <Tips
          contentStyle={styles.contentStyle}
          tooltipContainerStyle={[
            styles.tooltipContainerStyle,
            {
              left: Metrics.screenWidth / 2 - 100, // Adjust for horizontal centering
              top: Metrics.screenHeight / 2 - 50, // Adjust for vertical centering
            },
          ]}
          style={styles.Tips}
          tooltipArrowStyle={styles.tooltipArrowStyle}
          textStyle={styles.tipstextStyle}
          visible={this.state.tipsVisible === 'adminPortal'} // Ensure you set this state value when showing this tip
          onRequestClose={this.handleNextTips}
          text="Select from the menu admin portal, to start creating your child's schedule"
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
                        ? this.state.objSelectedChild.name.toUpperCase() +
                          '’S SCHOOL CLOCK'
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
                  disabled
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
              {console.log(
                'SELECTED DAY_______',
                JSON.stringify(this.state.markedDates),
              )}
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
                    showSixWeeks={true}
                    hideExtraDays={true}
                    disableMonthChange={false}
                    renderHeader={this.renderHeader}
                    renderArrow={this.renderArrow}
                    onMonthChange={this.handleMonthChange}
                    onPressArrowLeft={subtractMonth =>
                      this.handlePressArrowLeft(subtractMonth)
                    }
                    onPressArrowRight={addMonth => addMonth()} // Keep the default functionality for the right arrow
                    onDayPress={day => {
                      const {dateString} = day;
                      const updatedMarkedDates = {
                        ...markedDates,
                        [dateString]: {
                          customStyles: {
                            container: {
                              backgroundColor: 'blue',
                              borderRadius: 50,
                              borderWidth: 2,
                              borderColor: 'blue',
                            },
                            text: {
                              color: 'white',
                              fontWeight: 'bold',
                            },
                          },
                        },
                      };
                      this.setState({markedDates: updatedMarkedDates});
                      this.selectDayForClock(day.dateString);
                      this.showFullCalender();
                      // if (markedDates[dateString]) {
                      //   this.showFullCalender();
                      //   this.props.navigation.navigate('ScheduleScreen', {
                      //     selectedDay: dateString,
                      //   });
                      // } else {
                      //   const updatedMarkedDates = {
                      //     ...markedDates,
                      //     [dateString]: {
                      //       customStyles: {
                      //         container: {
                      //           backgroundColor: 'blue',
                      //           borderRadius: 50,
                      //           borderWidth: 2,
                      //           borderColor: 'blue',
                      //         },
                      //         text: {
                      //           color: 'white',
                      //           fontWeight: 'bold',
                      //         },
                      //       },
                      //     },
                      //   };
                      //   this.setState({markedDates: updatedMarkedDates});
                      //   this.selectDayForClock(day.dateString);
                      //   this.showFullCalender();
                      // }
                    }}
                    markedDates={markedDates}
                    markingType={'custom'}
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
                    backgroundColor:
                      this.state.currentTaskSlot[0].tasks[0].is_school_clock ==
                        this.state.school &&
                      !this.state.isLoading &&
                      moment(this.state.selectedDay).isSame(moment(), 'day')
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
                      backgroundColor:
                        this.state.currentTaskSlot[0].tasks[0]
                          .is_school_clock == this.state.school &&
                        !this.state.isLoading &&
                        moment(this.state.selectedDay).isSame(moment(), 'day')
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
                this.state.arrFooterTasks.length > 0 &&
                this.state.currentTaskSlot[0].tasks[0].is_school_clock ==
                  this.state.school &&
                moment(this.state.selectedDay).isSame(moment(), 'day') ? (
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
            <ScrollView showsVerticalScrollIndicator={false}>
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
            </ScrollView>
          </RBSheet>
        </ImageBackground>
      </View>
    );
  }
  //#endregion
}
