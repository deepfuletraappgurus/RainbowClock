import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Platform,
  Dimensions,
} from 'react-native';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import {Images, Colors, mat, Metrics} from '../Themes';
import {PieChart} from 'react-native-svg-charts';
import Api from '../Services/Api';
import Swiper from 'react-native-swiper';
import moment from 'moment';
import TaskModal from '../Components/TaskModal';
import {CachedImage, ImageCacheProvider} from 'react-native-cached-image';
import AnalogClock from '../Components/AnalogClock';
import Tips from 'react-native-tips';
import * as Animatable from 'react-native-animatable';
import Svg, {G, Path} from 'react-native-svg';

// Styles
import styles from './Styles/HomeScreenStyles';
import BaseComponent from '../Components/BaseComponent';
import images from '../Themes/Images';
import TaskListModel from '../Components/TaskListModel';

const constDigitColor = 'blue';
// Global Variables
const objSecureAPI = Api.createSecure();
const {width, height} = Dimensions.get('window');

export default class HomeScreen extends BaseComponent {
  handleViewRef = ref => (this.view = ref);
  //constructor event
  constructor(props) {
    super(props);

    //tips array ,Tips you want to show in home page
    this.homeTips = new Tips.Waterfall(Constants.CHILD_HOME_TIPS, {
      onEnd: async () => {
        try {
          AsyncStorage.setItem(Constants.HOME_TIPS, JSON.stringify(false));
        } catch (error) {}
      },
    });

    //tips array, Tips you want to show in Task page
    this.tasksTips = new Tips.Waterfall(Constants.CHILD_TASK_TIPS, {
      onEnd: async () => {
        try {
          AsyncStorage.setItem(Constants.TASK_TIPS, JSON.stringify(false));
        } catch (error) {}
      },
    });

    this.state = {
      school: false,
      modalVisible: false,
      clockFormateImage: images.am,
      taskComplete: false,
      objSelectedChild: [],
      arrWeekDays: [],
      selectedDay: '',
      is_24HrsClock: false,
      isAnswerOfJokeVisible: false,
      imageBg: Images.BgDay,
      isPlanetIconVisible: false,
      jokeData: {},
      arrTasks: [],
      arrFilteredTasks: [],
      currentTaskSlot: '',
      selectedTaskSlot: {},
      pieData: [],
      pieDataPM: [],
      pieDataAM: [],
      pieData24Hour: [],
      pieDataAM_School: [],
      pieDataPM_School: [],
      pieData24Hour_School: [],
      meridiam: '',
      arrFooterTasks: [],
      objFooterSelectedTask: {},
      isLoading: true,
      currentIndex: 0,
      swiperData: [],
      dicPieData: {},
      objRestoreTask: {},
      tipsVisible: false,
      taskTips: false,
      isQAVisible: true,
      tickCount: 0,
      animationRef: '',
      needToChangeFooterObj: true,
      showRecoverModel: false,
      refresh: false,
      piedataSchool: [],
    };
    this.handleNextTips = this.handleNextTips.bind(this);
  }

  //show next tips
  handleNextTips() {
    if (!this.state.isLoading) {
      if (this.state.modalVisible) {
        const taskTips = this.tasksTips.next();
        this.setState({taskTips});
      } else {
        const tipsVisible = this.homeTips.next();
        if (tipsVisible == 'house') {
          this.toggleSchool();
        } else if (tipsVisible == 'rewards') {
          this.toggleSchool();
        }
        this.setState({tipsVisible});
      }
    }
  }

  //start showing tips in home
  start() {
    this.setState({
      tipsVisible: this.homeTips.start(),
    });
  }

  //start showing tips in Task
  startTask() {
    this.setState({
      taskTips: this.tasksTips.start(),
    });
  }

  incrementCount() {
    this.setState(prevState => ({tickCount: prevState.tickCount + 1}));
  }

  resetCount() {
    this.setState = {
      tickCount: 0,
    };
  }
  //#region -> Component Methods
  componentDidMount() {
    super.componentDidMount();
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
    //     currentTime > 12 AM && currentTime <= 6 AM
    // currentTime > 6 AM && currentTime <= 12 PM
    // currentTime > 12 PM && currentTime <= 6 PM
    // currentTime > 6 PM && currentTime <= 12 AM
    this.getJokeOfTheDay(this.state.currentIndex);

    //this.getJokeOfTheDay(this.state.currentIndex)

    // the 'start' method will set the first Tips key into your state.

    this.state.arrWeekDays = Helper.getUpcominSevenDays();
    this.state.selectedDay = this.state.arrWeekDays[this.state.currentIndex];

    // this.state.meridiam = Helper.getCurrentTimeMeridian() //MP
    this.state.meridiam = TimeType; //MP
    this.getImageBg();
    //this.getJokeOfTheDay(this.state.currentIndex)
    this.getClockDetail();
    this.getChildDetail();
    setTimeout(() => {
      this.getTaskList(this.state.currentIndex);
    }, 2000);
    this.navFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        Helper.getChildRewardPoints(this.props.navigation);
      },
    );
    // AsyncStorage.getItem(Constants.KEY_LAST_APP_ACCESS_DAY, (err, result) => {
    //   if (result) {
    //     if (moment().format('DD-MM-YYYY') != result) {
    //       // this.setState({ is_JokeAvailableForToday: true })
    //     }
    //   }
    //   AsyncStorage.setItem(Constants.KEY_LAST_APP_ACCESS_DAY, moment().format('DD-MM-YYYY'))
    // })

    // AsyncStorage.getItem(Constants.KEY_IS_24HRS_CLOCK, (err, result) => {
    //   if (result == "true") {
    //     this.setState({ is_24HrsClock: true });
    //   }
    // });

    //check tips is already show or not in home if not then start showing tips
    // AsyncStorage.getItem(Constants.HOME_TIPS, (err, result) => {
    //   if (result == "true") {
    //     this.homeTips.options.disabled = true
    //   } else {
    //     this.start();
    //   }
    // });

    AsyncStorage.getItem(Constants.HOME_TIPS, (err, value) => {
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
  }

  componentWillUnmount() {
    this.navFocusListener.remove();
  }
  //#endregion

  //#region -> Class Methods
  getImageBg = () => {
    // Helper.getBackgroudImage((image, navHeaderColor) => {
    //   this.props.navigation.setParams({ navHeaderColor });
    //   this.setState({ imageBg: image });
    // });
    AsyncStorage.getItem(Constants.BACKGROUND_IMAGE, (err, result) => {
      if (result) {
        this.setState({imageBg: result});
      }
    });
    AsyncStorage.getItem(Constants.NAV_COLOR, (err, result) => {
      if (result) {
        this.props.navigation.setParams({navHeaderColor: result});
      }
    });
  };

  getChildDetail = async () => {
    const isTFClock = await AsyncStorage.getItem(Constants.KEY_IS_24HRS_CLOCK);
    // this.state.is_24HrsClock = (isTFClock == "true")
    const child = await AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD);
    if (child != '') {
      this.state.objSelectedChild = JSON.parse(child);
      this.createSwiperDataForWeek();
    }
  };

  getClockDetail = async () => {
    // Removed switch to change clock hour
    const child = await AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD);
    const isTFClock = await AsyncStorage.getItem(Constants.KEY_IS_24HRS_CLOCK);
    if (child != '' && isTFClock == 'true') {
      // this.state.is_24HrsClock = true
    }
  };

  setWatchData(currentIndex) {
    var pieData = '';
    var stateData = this.state.dicPieData;

    if (!stateData) {
      pieData = [];
    }
    if (!this.state.isLoading) {
      if (this.state.is_24HrsClock) {
        pieData = stateData?.pieData24Hour;
      } else if (this.state.school) {
        var date, TimeType, hour;
        date = new Date();

        // Getting current hour from Date object.
        hour = date.getHours();
        console.log('22--222', stateData?.pieDataAMPM);
        if (
          stateData?.pieDataAMPM?.length == 1 &&
          stateData.pieDataAMPM[0].isEmpty
        ) {
          pieData = stateData?.pieDataAMSchool;
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
          const filteredTasks = filterTasks(stateData?.pieDataAMPM);
          console.log('!!!!---!!!!!',filteredTasks)
          if (
            (typeof filteredTasks !== 'undefined' ||
              filteredTasks !== undefined) &&
            !this.state.isLoading &&
            filteredTasks[0]?.isEmpty !== true
          ) {
            stateData.pieDataAMPM = filteredTasks;
            let secondLastTaskEndTime =
              stateData.pieDataAMPM[
                stateData?.pieDataAMPM?.length - 2
              ]?.taskId?.split(' - ')[1];
            console.log('1---1', stateData.pieDataAMPM);
            let endTimeMeridiem =
              stateData.pieDataAMPM[stateData?.pieDataAMPM?.length - 2]
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
            stateData.pieDataAMPM[stateData?.pieDataAMPM?.length - 1].value =
              timeDifference;
            // Extract the end time from the taskId
            if (
              !this.state.isLoading &&
              stateData?.pieDataAMSchool !== undefined
            ) {
              const startTime = parseInt(
                stateData?.pieDataAMSchool[1]?.taskId
                  .split(' ')[0]
                  .split(':')[0],
              );
              console.log('--44---', stateData?.pieDataAMSchool, startTime);
              // Check if the start time is greater than or equal to 6:00 AM
              if (startTime <= 6) {
                // Update the value property of the first element to 0
                stateData.pieDataAMSchool[0].value = 0;
              } else {
                // Calculate the difference between 6:00 AM and the start time of the second element in minutes
                const differenceInMinutes = (6 - startTime) * 60;
                console.log('===11===', differenceInMinutes);
                // Update the value property of the first element with the calculated difference
                stateData.pieDataAMSchool[0].value = Math.abs(
                  isNaN(differenceInMinutes)
                    ? 360
                    : differenceInMinutes -
                        stateData?.pieDataAMSchool[1]?.taskId
                          .split(' ')[0]
                          .split(':')[1],
                );
              }
            }
          } else {
            stateData.pieDataAMPM = [{"isEmpty": true, "taskId": "Blannk2", "value": 0}]
            console.log('ERROR');
          }
          console.log(
            '555====5555',
            stateData?.pieDataAMPM.concat(stateData.pieDataAMSchool),
          );
          pieData = stateData?.pieDataAMPM.concat(stateData.pieDataAMSchool);
        }

        //MP
      } else if (this.state.meridiam == 'AM') {
        var date, TimeType, hour;
        date = new Date();

        // Getting current hour from Date object.
        hour = date.getHours();
        console.log(
          'STATEDATAAMPM',
          stateData?.pieDataAMPM,
          stateData?.pieDataAM,
        );
        if (
          stateData?.pieDataAMPM?.length == 1 &&
          stateData.pieDataAMPM[0].isEmpty
        ) {
          pieData = stateData?.pieDataAM;
        } else {
          if (hour >= 6) {
            function filterTasks(tasks) {
              let endIndex = -1;
              for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];
                if (!task.taskId) continue;
                const startTime = moment(
                  task.taskId.split(' - ')[0],
                  'hh:mm A',
                );
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
            const filteredTasks = filterTasks(stateData.pieDataAMPM);
            stateData.pieDataAMPM = filteredTasks;
            let secondLastTaskEndTime =
              stateData.pieDataAMPM[
                stateData?.pieDataAMPM?.length - 2
              ]?.taskId.split(' - ')[1];
            if (
              typeof secondLastTaskEndTime !== 'undefined' ||
              secondLastTaskEndTime !== undefined
            ) {
              let endTimeMeridiem =
                stateData.pieDataAMPM[stateData?.pieDataAMPM?.length - 2]
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
              stateData.pieDataAMPM[stateData?.pieDataAMPM?.length - 1].value =
                timeDifference;
            }
            // Extract the end time from the taskId

            const startTime = parseInt(
              stateData.pieDataAM[1]?.taskId.split(' ')[0].split(':')[0],
            );

            // Check if the start time is greater than or equal to 6:00 AM
            if (startTime <= 6 || startTime == 12) {
              // Update the value property of the first element to 0
              stateData.pieDataAM[0].value = 0;
            } else {
              // Calculate the difference between 6:00 AM and the start time of the second element in minutes
              const differenceInMinutes = (6 - startTime) * 60;
              // Update the value property of the first element with the calculated difference
              stateData.pieDataAM[0].value = Math.abs(
                isNaN(differenceInMinutes)
                  ? 360
                  : differenceInMinutes -
                      stateData.pieDataAM[1]?.taskId
                        .split(' ')[0]
                        .split(':')[1],
              );
            }
            pieData = stateData?.pieDataAMPM.concat(stateData.pieDataAM);
          } else {
            pieData = stateData?.pieDataAM;
          }
        }

        //MP
      } else if (this.state.meridiam == 'PM') {
        //MP
        pieData = stateData?.pieDataPM;
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
      this.state.pieData = pieData;
      this.state.swiperData[currentIndex] = this.renderSwiperView();
      this.setState({pieData});
    }
  }

  setPlanetIcon = () => {
    this.state.isPlanetIconVisible ? '' : this.startCounter();
    this.state.isPlanetIconVisible = true;
    this.state.swiperData[this.state.currentIndex] = this.renderSwiperView();
    this.setState({});
  };

  handlePlanetIcon = () => {
    // alert('helllo');
    this.state.isPlanetIconVisible = false;
    this.state.swiperData[this.state.currentIndex] = this.renderSwiperView();
    this.setState({isPlanetIconVisible: false});
  };

  startCounter = () => {
    this._timer = setTimeout(
      function () {
        this.state.isPlanetIconVisible = false;
        // this.state.swiperData[this.state.currentIndex] =
        //   this.renderSwiperView();
        this.setState({});
      }.bind(this),
      10000,
    );
  };

  toggleSwitch() {
    this.state.is_24HrsClock = !this.state.is_24HrsClock;
    this.setWatchData(this.state.currentIndex);
    try {
      AsyncStorage.setItem(
        Constants.KEY_IS_24HRS_CLOCK,
        JSON.stringify(this.state.is_24HrsClock),
      );
      this.createSwiperDataForWeek();
    } catch (error) {}
    this.getImageBg();
    // this.setState({ pieData });
  }

  toggleSchool() {
    // if (this.state.is_24HrsClock) {
    //   this.toggleSwitch();
    //   this.setState({school: true}); //MP
    // } else {
    //   //MP
    //   this.setState({school: false});
    // }
    this.setState(
      {
        school: !this.state.school,
      },
      () => {
        // this.createSwiperDataForWeek();
        if (!this.state.isLoading) {
          // setTimeout(() => {
          // }, 1000);
          this.setWatchData(this.state.currentIndex);
        }
      },
    );
  }

  setModalVisible(visible, timeSlot = '') {
    const objSelectdTasks = this.state.arrFilteredTasks.filter(item => {
      return item.time == timeSlot;
    });
    // const tasks = timeSlot;
    // let arr = []
    // Object.keys(tasks).map((item) => {
    //     if (item != '') {
    //         const s = item.split('-')
    //         arr.push({ from: s[0].trim(), to: s[1].trim() })
    //     }
    // })
    if (objSelectdTasks.length > 0) {
      this.state.selectedTaskSlot = objSelectdTasks[0].tasks;
      this.setState({
        modalVisible: visible,
      });
    }

    //Check task tips already show or not if not then start showing tips
    AsyncStorage.getItem(Constants.TASK_TIPS, (err, value) => {
      if (err) {
      } else {
        let isShowTime = JSON.parse(value);
        if (isShowTime != null) {
          if (isShowTime) {
            this.startTask();
          } else {
            this.homeTips.options.disabled = true;
          }
        }
      }
    });
  }

  createSwiperDataForWeek() {
    const pagesCount = this.state.arrWeekDays.length;
    const pages = [...new Array(pagesCount)].map((item, index) => {
      return this.renderSwiperView(index);
    });
    this.setState({
      swiperData: pages,
    });
  }

  seeAnswerOfJoke() {
    if (this.state.tickCount === 2) {
      this.setState({tickCount: 0}, () => {
        this.handleStateUpdates();
      });
    } else {
      this.setState(
        prevState => ({tickCount: prevState.tickCount + 1}),
        () => {
          this.handleStateUpdates();
        },
      );
    }
  }

  handleStateUpdates = () => {
    const isQAVisible = this.state.tickCount !== 2;
    const isAnswerOfJokeVisible = this.state.tickCount === 1;

    const currentIndex = this.state.currentIndex;
    const swiperData = [...this.state.swiperData];
    swiperData[currentIndex] = this.renderSwiperView();

    if (!isQAVisible) {
      // Handle state updates or any other logic
    }
    if (this.state.tickCount === 1) {
      // Handle state updates or any other logic
      this.startAnswerCounter(); // Assuming this is a method to handle some counter
    }

    // Updating states that are not directly dependent on previous state
    this.setState({
      isQAVisible: isQAVisible,
      isAnswerOfJokeVisible: isAnswerOfJokeVisible,
      swiperData: swiperData,
    });
  };

  startAnswerCounter() {
    this._timer = setTimeout(
      function () {
        this.setState(
          prevState => ({tickCount: 2}),
          () => {
            this.hideAwnswer();
          },
        );
      }.bind(this),
      10000,
    );
  }
  onPressMoveToSchedule = () => {
    this.props.navigation.navigate('ScheduleScreen');
  }; //MP

  hideAwnswer() {
    this.state.isAnswerOfJokeVisible = false;
    this.state.isQAVisible = false;
    // this.state.swiperData[this.state.currentIndex] = this.renderSwiperView();
    this.createSwiperDataForWeek();
    this.setState({
      isQAVisible: false,
      isAnswerOfJokeVisible: false,
      tickCount: 2,
    });
  }
  renderSwiperView = (currentIndex = this.state.currentIndex) => {
    const date = Helper.dateFormater(
      this.state.arrWeekDays[currentIndex],
      'dddd DD MMMM YYYY',
      'dddd',
    ).toUpperCase();

    _onPress = () => {
      this.state.animationRef.pulse();
    };

    const swiperData = (
      <View style={styles.container} key={date}>
        <View style={styles.clockHeader}>
          <Text style={[styles.title, styles.textCenter]}>
            {this.state.objSelectedChild &&
            this.state.objSelectedChild.name &&
            !this.state.school
              ? this.state.objSelectedChild.name.toUpperCase() + '’S CLOCK'
              : this.state.objSelectedChild.name.toUpperCase() +
                '’S SCHOOL CLOCK'}
          </Text>
          <TouchableOpacity
            onPress={() => this.setPlanetIcon()}
            style={{zIndex: 1000}}>
            {/* <Text > */}
            <Animatable.Text
              ref={this.handleViewRef} //MP
              animation="pulse"
              easing="ease-in-out"
              iterationCount={4}
              style={[styles.heading1, styles.textCenter]}>
              {date}
            </Animatable.Text>
            {/* </Text> */}
          </TouchableOpacity>
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
          }}>
          {this.renderClockView()}
        </View>
        <View style={styles.clockBottom}>
          <View style={styles.clockBottomLeft}>
            <TouchableOpacity
              disabled={this.state.isLoading}
              style={[styles.bellTouch, {zIndex: 10000}]}
              onPress={() => this.toggleSchool()}>
              {!this.state.school ? (
                <Image source={Images.bell} style={styles.bell} />
              ) : (
                <Image source={Images.school} style={styles.school} />
              )}
            </TouchableOpacity>
            {/* MP Added Schedule Icon */}
            <TouchableOpacity
              onPress={() => this.onPressMoveToSchedule()}
              style={{zIndex: 1000}}>
              <Image source={Images.navIcon3} style={styles.calendarIcon} />
            </TouchableOpacity>
            {/* MP Added Schedule Icon */}
            {
              this.state.school ? null : ( //Switch icon start (Have made this icon invisible as per client request)
                <TouchableOpacity
                  style={[
                    styles.SwitchHide,
                    this.state.is_24HrsClock
                      ? styles.switch24Hrs
                      : styles.switch12Hrs,
                  ]}
                  // onPress={() => this.toggleSwitch()}
                >
                  {this.state.is_24HrsClock ? (
                    <View style={styles.SwitchButton24Hrs}></View>
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
                    <View style={styles.SwitchButton}></View>
                  ) : null}
                </TouchableOpacity>
              ) //Switch icon end
            }
          </View>
          <View style={styles.clockBottomRight}>
            <TouchableOpacity activeOpacity={0.7}>
              {!this.state.school ? (
                this.state.isPlanetIconVisible ? (
                  <View style={styles.shapeContainer}>
                    <View style={styles.shapeView}>
                      <Image
                        source={Images.shapeRight}
                        style={styles.shapeRight}
                      />
                      <View style={styles.shape}>
                        <Text style={styles.shapeText}>
                          {
                            Helper.getPlanetImageForTheDay(
                              this.state.arrWeekDays,
                              currentIndex,
                            ).message
                          }
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => this.handlePlanetIcon()}
                      style={{zIndex: 100000}}>
                      <Image
                        source={
                          Helper.getPlanetImageForTheDay(
                            this.state.arrWeekDays,
                            currentIndex,
                          ).image
                        }
                        style={styles.alarmClock}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.shapeContainer}>
                    {
                      // this.state.isQAVisible ? <View style={[styles.shapeView]}>
                      //   <Image source={Images.shapeRight} style={[styles.shapeRight, { tintColor: Colors.darkPink }]} />
                      //   <TouchableOpacity style={styles.shapeJoke} onPress={() => {
                      //     this.hideAwnswer()
                      //   }}>
                      //     <Text style={styles.shapeText}>{this.state.isAnswerOfJokeVisible ? this.state.jokeData.answer : this.state.jokeData.question}</Text>
                      //   </TouchableOpacity>
                      // </View> : null
                      this.state.tickCount !== 3 ? (
                        <View style={[styles.shapeView]}>
                          <Image
                            source={Images.shapeRight}
                            style={[
                              styles.shapeRight,
                              {tintColor: Colors.darkPink},
                            ]}
                          />
                          {console.log('RENDER JOKE', this.state.jokeData)}
                          {this.state.tickCount == 2 ? null : (
                            <View style={styles.shapeJoke}>
                              <Text style={styles.shapeText}>
                                {this.state.tickCount == 1
                                  ? this.state.jokeData.answer
                                  : this.state.jokeData.question}
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : null
                    }
                    {/* <View style={[styles.shapeView, { display: this.state.isQAVisible ? 'flex' : 'none' }]}>
                      <Image source={Images.shapeRight} style={[styles.shapeRight, { tintColor: Colors.darkPink }]} />
                      <TouchableOpacity style={styles.shapeJoke} onPress={() => {
                        this.hideAwnswer()
                        }}>
                        <Text style={styles.shapeText}>{this.state.isAnswerOfJokeVisible ? this.state.jokeData.answer : this.state.jokeData.question}</Text>
                      </TouchableOpacity>
                    </View> */}
                    <TouchableOpacity
                      hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                      onPress={() => this.seeAnswerOfJoke()}
                      style={{zIndex: 1000000}}>
                      <Image
                        source={Images.alarmClock}
                        style={styles.alarmClock}
                      />
                    </TouchableOpacity>
                  </View>
                )
              ) : (
                <Image source={Images.schoolBus} style={styles.schoolBus} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );

    return swiperData;
  };

  handlePress = taskId => {
    this.setModalVisible(true, taskId);
  };

  transformPieData(data) {
    const {is_24HrsClock, school} = this.state;

    return data.map(obj => {
      if (is_24HrsClock) {
        return obj;
      } else if (school) {
        return obj.is_school_clock
          ? obj
          : {...obj, svg: {...obj.svg, fill: '#ffffff'}};
      } else {
        return !obj.is_school_clock
          ? obj
          : {...obj, svg: {...obj.svg, fill: '#ffffff'}};
      }
    });
  }

  renderClockView() {
    const {pieData: data, is_24HrsClock, school} = this.state;
    const date = new Date();
    const hour = date.getHours();
    const clearColor = Colors.clear;

    // Set clock format image based on the time and state
    this.state.clockFormateImage = is_24HrsClock
      ? Images.clockFaceDigit24HRS
      : school
      ? images.am_pm
      : hour >= 0 && hour < 6
      ? images.am
      : hour >= 6 && hour < 12
      ? images.am_pm
      : hour >= 12 && hour < 18
      ? images.pm
      : images.pm_am;

    const sanitizedData = data.map(entry => ({
      ...entry,
      value: entry.value < 0 ? 0 : entry.value, // Convert negative values to 0
    }));

    const radius =
      Platform.OS === 'ios'
        ? Math.min(width, height) / 2.7
        : Math.min(width, height) / 3.1;
    const cx = width / 2;
    const cy = height / 2;
    const totalValue = sanitizedData.reduce(
      (acc, entry) => acc + entry.value,
      0,
    );
    let cumulativeAngle = 0;

    const transformedPieData = sanitizedData.map((entry, index) => {
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + (entry.value / totalValue) * 360;
      cumulativeAngle = endAngle;

      const d = createPieSlicePath(cx, cy, radius, startAngle, endAngle);

      return {
        ...entry,
        svg: {
          ...entry.svg,
          fill:
            entry.isEmpty && !entry.color
              ? entry.is_school_clock
                ? Colors.gray
                : clearColor
              : entry.color,
          onPress: () => this.handlePress(entry.taskId),
        },
        d,
        key: `pie-${index}`,
      };
    });

    const finalPieData = this.transformPieData(transformedPieData);

    cumulativeAngle = 0; // Reset cumulative angle for the second pie chart
    const pieDataTrans = data.map((entry, index) => {
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + (entry.value / totalValue) * 360;
      cumulativeAngle = endAngle;

      const d = createPieSlicePath(cx, cy, radius, startAngle, endAngle);

      return {
        value: entry.value,
        svg: {
          fill: clearColor,
          onPress: () => this.handlePress(entry.taskId),
        },
        d,
        key: `pie-${index}`,
      };
    });


    return (
      <View style={[styles.clock]}>
        <Image
          source={school ? Images.clockPurpleLight : Images.clock}
          style={styles.clockImage}
        />

        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            zIndex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Svg width={width} height={height} style={{position: 'absolute'}}>
            <G>
              {finalPieData.map(slice => (
                <Path
                  key={slice.key}
                  d={slice.d}
                  fill={slice.svg.fill}
                  onPress={slice.svg.onPress}
                />
              ))}
            </G>
          </Svg>
          <Image
            source={this.state.clockFormateImage}
            resizeMode={'contain'}
            style={styles.clockChartView}
          />
          <AnalogClock hourFormate={is_24HrsClock ? 24 : 12} />
          <Svg
            width={width}
            height={height}
            style={{position: 'absolute', zIndex: 1}}>
            <G>
              {pieDataTrans.map(slice => (
                <Path
                  key={slice.key}
                  d={slice.d}
                  fill={slice.svg.fill}
                  onPress={slice.svg.onPress}
                />
              ))}
            </G>
          </Svg>
        </View>
      </View>
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
      <TouchableOpacity
        style={styles.iconTouch}
        onPress={() => this.onPressFooterTask(task)}
        key={'keyFooter' + index}>
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

  renderTaskRow = (data, index) => {
    return (
      <TouchableOpacity
        style={{
          paddingVertical: 10,
          alignItems: 'center',
          flexDirection: 'row',
          borderBottomWidth: 0.3,
          borderBottomColor: Colors.snow,
          width: '100%',
        }}
        onPress={() => this.onPressFooterTask(data)}>
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
              opacity: data.status == Constants.TASK_STATUS_COMPLETED ? 0.5 : 1,
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
  };

  onPressFooterTask(objTask) {
    console.log('objTask', objTask);
    if (objTask.status != Constants.TASK_STATUS_COMPLETED) {
      this.state.modalVisible = false;
      this.setState({
        taskComplete: true,
        objRestoreTask: '',
        showRecoverModel: false,
      });
      // if (this.state.needToChangeFooterObj) {
      this.setState({
        objFooterSelectedTask: objTask,
      });
      // }
    } else {
      this.setState({
        objFooterSelectedTask: objTask,
      });
      this.setState({objRestoreTask: objTask});
      this.setModalVisible(true, `${objTask.time_from} - ${objTask.time_to}`);
    }
    Helper.getChildRewardPoints(this.props.navigation);
  }
  //#endregion
  getJokeOfTheDay(index) {
    //MP
    // this.setState({
    //   isLoading: true
    // })
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);

    objSecureAPI
      .getJokeOfTheDay(day)
      .then(response => {
        if (response.ok) {
          if (response.data.success) {
            console.log('joke ', response.data.data.jokes);
            this.setState({
              jokeData: response.data.data.jokes,
              isLoading: false,
            });
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
  //#region -> API Call
  getTaskList = index => {
    this.setState({piedata: {}});
    Helper.getChildRewardPoints(this.props.navigation);
    // if (this.state.isLoading) {
    //   return;
    // }
    const currentIndex = index;
    // this.setState({
    //   isLoading: true,
    // });
    // this.state.isLoading = true;
    // __DEV__ ? '2019-07-03' :
    const aDate = Helper.dateFormater(
      this.state.arrWeekDays[index],
      'dddd DD MMMM YYYY',
      'YYYY-MM-DD',
    );
    objSecureAPI
      .childTasksList(this.state.objSelectedChild.id, '', aDate)
      .then(response => {
        if (response.ok) {
          this.setState({isLoading: false});
          if (response.data.success) {
            let arr = [];
            if (response.data.data.length > 0) {
              const tasks = response.data.data[0].tasks;

              Object.keys(tasks).map(item => {
                arr.push({time: item, tasks: tasks[item]});
              });
              this.setState({arrTasks: arr, arrFilteredTasks: arr});
              const todaysSchoolHours =
                this.state.objSelectedChild.school_hours[Helper.getTodaysDay()];

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
                      index,
                      is_school_clock,
                    );
                  }, 200),
              );
            }
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
    currentIndex,
    is_school_clock,
  ) {
    {
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
      const pieDataAMSchool = Helper.generateClockTaskArray(
        arrAM,
        'am',
        2,
        false,
      );
      // const pieDataAM_School = Helper.generateClockTaskArray(arrAM_School,"am",true);
      // const pieDataPM_School = Helper.generateClockTaskArray(arrPM_School,"pm",true);
      var pieDataAM_School = [];
      var pieDataPM_School = [];
      if (todaysSchoolHours) {
        // todaysSchoolHours ={
        //   FROM:"00:00",
        //   TO:"00:00"
        // }
        // schoolHoursFromMeradian = "am"
        // schoolHoursToMeradian =  "am"

        if (schoolHoursFromMeradian != schoolHoursToMeradian) {
          //here change arrAM_School to arrAM
          pieDataAM_School = Helper.generateClockTaskArraySchool(
            arrAM,
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
      pieData24Hour = [...pieDataAM, ...pieDataAMPM];
      pieData24Hour_School = [...pieDataAM_School, ...pieDataPM_School];
      meridian = Helper.getCurrentTimeMeridian();

      this.state.currentIndex = currentIndex;
      this.state.dicPieData = {
        meridian,
        pieDataPM,
        pieDataAM,
        pieData24Hour,
        pieDataAM_School,
        pieDataPM_School,
        pieData24Hour_School,
        pieDataAMPM,
        pieDataAMSchool,
      };
      this.setWatchData(currentIndex);
    }
  }
  callRecoverTask(objTask) {
    console.log('!!!!!!!!-----!!!!!!!!', objTask);
    this.state.isLoading = true;
    objSecureAPI
      .restoreTask(objTask.sub_task_id, this.state.objSelectedChild.id)
      .then(response => {
        if (response.ok) {
          if (response.data.success) {
            const objIndex = this.state.selectedTaskSlot.findIndex(
              obj => obj.id == objTask.id,
            );
            this.state.selectedTaskSlot[objIndex].status = '';
            this.state.selectedTaskSlot[objIndex].start_time = '';
            this.state.objRestoreTask = {};
            console.log('response.data.data', response.data.data);
            this.setState({
              isLoading: false,
            });
            this.setState({
              selectedTaskSlot: response.data.data.tasks,
            });
            this.setState({
              needToChangeFooterObj: false,
            });
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

  indexChange = index => {
    this.setState({isLoading: true});
    this._timer ? clearInterval(this._timer) : null;
    this._timer_task ? clearTimeout(this._timer_task) : null;
    this.state.isPlanetIconVisible = false;
    this.state.swiperData[index] = this.renderSwiperView(index);
    this.setState({currentIndex: index}, () => {
      // this,_timer_task = setTimeout(() => {
      // this.getJokeOfTheDay(index);
      this.getTaskList(index);
      // }, 10000);
    });
  };

  //#endregion

  //#region -> View Render
  renderSwiperData() {
    const pagesCount = this.state.swiperData.length;
    const pages = [...new Array(pagesCount)].map((item, index) => {
      return this.state.swiperData[index];
    });
    return pages;
  }

  setModal() {
    this.setState({modalVisible: false, objRestoreTask: ''});
    super.componentDidMount();
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
    //     currentTime > 12 AM && currentTime <= 6 AM
    // currentTime > 6 AM && currentTime <= 12 PM
    // currentTime > 12 PM && currentTime <= 6 PM
    // currentTime > 6 PM && currentTime <= 12 AM
    if (this.state.school) {
      this.state.clockFormateImage = images.am_pm;
    } else if (hour >= 0 && hour < 6) {
      this.state.clockFormateImage = images.am;
    }
    if (hour >= 6 && hour < 12) {
      this.state.clockFormateImage = images.am_pm;
    }
    if (hour >= 12 && hour < 18) {
      this.state.clockFormateImage = images.pm;
    }
    if (hour >= 18 && hour < 24) {
      this.state.clockFormateImage = images.pm_am;
    }
    this.getJokeOfTheDay(this.state.currentIndex);

    // the 'start' method will set the first Tips key into your state.

    this.state.arrWeekDays = Helper.getUpcominSevenDays();
    this.state.selectedDay = this.state.arrWeekDays[this.state.currentIndex];

    // this.state.meridiam = Helper.getCurrentTimeMeridian() //MP
    this.state.meridiam = TimeType; //MP
    this.getImageBg();
    this.getClockDetail();
    this.getChildDetail();
    setTimeout(() => {
      this.getTaskList(this.state.currentIndex);
    }, 2000);
    this.navFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        Helper.getChildRewardPoints(this.props.navigation);
        this.getJokeOfTheDay(this.state.currentIndex);
      },
    );
    AsyncStorage.getItem(Constants.HOME_TIPS, (err, value) => {
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
              left: 10, // Adjust this value as needed
              top: Helper.isIPhoneX() ? 190 : 170,
            },
          ]}
          style={styles.Tips}
          tooltipArrowStyle={styles.tooltipArrowStyle}
          visible={this.state.tipsVisible === 'colorWedge'}
          onRequestClose={this.handleNextTips}
          text={'Tap on a colour wedge\n to access your tasks'}
          textStyle={styles.tipstextStyle}
        />

        {/* <Tips
          contentStyle={[styles.contentStyle, {
            maxWidth: 200
          }]}
          tooltipContainerStyle={[styles.tooltipContainerStyle, {
            left: 100,
            top: Metrics.screenHeight / 1.3,
          }]}
          style={[styles.Tips]}
          tooltipArrowStyle={styles.tooltipArrowStyle}
          textStyle={styles.tipstextStyle}
          visible={this.state.tipsVisible === "hourSwitch"}
          onRequestClose={this.handleNextTips}
          text="Switch to the 24 hour clock to see your whole day"
        /> */}

        <Tips
          contentStyle={styles.contentStyle}
          visible={this.state.tipsVisible === 'bell'}
          onRequestClose={this.handleNextTips}
          text="Tap the bell to see your school clock"
          style={[styles.Tips]}
          tooltipArrowStyle={styles.tooltipArrowStyle}
          textStyle={styles.tipstextStyle}
          tooltipContainerStyle={[
            styles.tooltipContainerStyle,
            {
              left: 70,
              top: Helper.isIPhoneX()
                ? Metrics.screenHeight / 1.5
                : Metrics.screenHeight / 1.6,
            },
          ]}
        />

        <Tips
          contentStyle={[
            styles.contentStyle,
            {
              left: null,
              right: 0,
            },
          ]}
          visible={this.state.tipsVisible === 'rewards'}
          onRequestClose={this.handleNextTips}
          text="You can access and claim your rewards from the menu"
          style={[
            styles.Tips,
            {
              left: null,
              right: 0,
            },
          ]}
          tooltipArrowStyle={styles.tooltipArrowStyle}
          textStyle={styles.tipstextStyle}
          tooltipContainerStyle={[
            styles.tooltipContainerStyle,
            {
              left: null,
              right: 15,
              top: Helper.isIPhoneX() ? 75 : 60,
            },
          ]}
        />

        <Tips
          contentStyle={[
            styles.contentStyle,
            {
              left: null,
              right: 0,
            },
          ]}
          visible={this.state.tipsVisible === 'house'}
          onRequestClose={this.handleNextTips}
          text="Tap the house to return to your daily clock"
          style={[
            styles.Tips,
            {
              left: null,
              right: 0,
            },
          ]}
          tooltipArrowStyle={styles.tooltipArrowStyle}
          textStyle={styles.tipstextStyle}
          tooltipContainerStyle={[
            styles.tooltipContainerStyle,
            {
              left: null,
              right: 100,
              top: Helper.isIPhoneX()
                ? Metrics.screenHeight / 1.35
                : Metrics.screenHeight / 1.4,
            },
          ]}
        />

        <ImageBackground
          source={
            this.state.school ? Images.cyanBackground : this.state.imageBg
          }
          style={styles.backgroundImage}>
          {this.state.pieData ? (
            <Swiper
              loop={false}
              showsButtons={false}
              index={this.state.currentIndex}
              renderPagination={renderPagination}
              onIndexChanged={index => this.indexChange(index)}
              loadMinimal={Platform.OS === 'ios' ? false : true}
              scrollEnabled={!this.state.isLoading}>
              {this.renderSwiperData()}
            </Swiper>
          ) : null}

          <SafeAreaView
            style={[
              {justifyContent: 'center'},
              this.state.currentTaskSlot && this.state.arrFooterTasks.length > 0
                ? {
                    backgroundColor:
                      this.state.currentTaskSlot[0].tasks[0].is_school_clock ==
                      this.state.school
                        ? this.state.currentTaskSlot[0].tasks[0].color
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
                          .is_school_clock == this.state.school
                          ? this.state.currentTaskSlot[0].tasks[0].color
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
                this.state.arrFooterTasks.length &&
                this.state.currentTaskSlot[0].tasks[0].is_school_clock ==
                  this.state.school ? (
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
        </ImageBackground>

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => this.setModalVisible(false)}>
          <View style={styles.modal}>
            <SafeAreaView style={styles.SafeAreaView}>
              <TouchableOpacity
                style={styles.modalCloseTouch}
                onPress={() => {
                  this.setState({modalVisible: false, objRestoreTask: ''});
                  Helper.getChildRewardPoints(this.props.navigation);
                  this.setModal();
                }}>
                <Image source={Images.close} style={styles.close} />
              </TouchableOpacity>
              <View style={styles.modalBody}>
                <Text style={[styles.title, styles.textCenter]}>
                  {'Tasks'.toLocaleUpperCase()}
                </Text>

                {/* <Tips
                  contentStyle={styles.contentStyle}
                  tooltipContainerStyle={[styles.tooltipContainerStyle, {
                    left: 15,
                    top: Helper.isIPhoneX() ? 190 : 170,
                  }]}
                  style={styles.Tips}
                  tooltipArrowStyle={styles.tooltipArrowStyle}
                  visible={this.state.taskTips === "complate"}
                  onRequestClose={this.handleNextTips}
                  text="Once a task is complate drag your task onto the pig"
                  textStyle={styles.tipstextStyle} /> */}

                <Tips
                  contentStyle={styles.contentStyle}
                  // visible={this.state.tipsVisible === "hourSwitch"}
                  tooltipContainerStyle={[
                    styles.tooltipContainerStyle,
                    {
                      left: 10,
                      top: Helper.isIPhoneX() ? 190 : 170,
                    },
                  ]}
                  style={styles.Tips}
                  tooltipArrowStyle={styles.tooltipArrowStyle}
                  visible={this.state.taskTips === 'information'}
                  onRequestClose={this.handleNextTips}
                  text="Click on the task to see more information"
                  textStyle={styles.tipstextStyle}
                />

                {this.state.selectedTaskSlot ? (
                  <FlatList
                    data={this.state.selectedTaskSlot}
                    keyExtractor={(item, index) => index + ''}
                    renderItem={({item, index}) =>
                      this.renderTaskRow(item, index)
                    }
                    extraData={this.state}
                    // numColumns={3}
                    contentContainerStyle={{
                      width: '100%',
                    }}
                  />
                ) : null}
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
        </Modal>

        <TaskModal
          visible={this.state.taskComplete}
          objSelectedChild={this.state.objSelectedChild}
          objFooterSelectedTask={this.state.objFooterSelectedTask}
          onStateChange={state => this.setState({taskComplete: state})}
          closeParentModal={() => this.setModal()}
          navigation={this.props.navigation}
        />
        {/* <TaskListModel
          visible={this.state.showRecoverModel}
          objSelectedChild={this.state.objSelectedChild}
          objFooterSelectedTask={this.state.objFooterSelectedTask}
          onStateChange={state => this.setState({showRecoverModel: state})}
          closeParentModal={() => this.setModal()}
        /> */}
      </View>
    );
  }

  //#endregion
}

const createPieSlicePath = (cx, cy, radius, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'L',
    cx,
    cy,
    'Z',
  ].join(' ');

  return d;
};

const polarToCartesian = (cx, cy, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};
