import AsyncStorage from '@react-native-async-storage/async-storage';
import Moment from 'moment';
import {Alert, Dimensions, Platform} from 'react-native';
import Constants from '../Components/Constants';
import {Colors, Images} from '../Themes';
import Api from '../Services/Api';
import * as Helper from './Helper';
import {StackActions, NavigationActions} from 'react-navigation';
import EventEmitter from './EventEmitter';
import moment from 'moment';

export async function storeItem(key, item) {
  try {
    //we want to wait for the Promise returned by AsyncStorage.setItem()
    //to be resolved to the actual value before returning the value
    var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
  }
}

export function resetNavigationToScreen(navigation, screenName) {
  const navigateAction = StackActions.reset({
    index: 0,
    key: null,
    actions: [
      NavigationActions.navigate({
        routeName: screenName,
      }),
    ],
  });
  navigation.dispatch(navigateAction);
}

export function resetNavigationToScreenWithStack(
  navigation,
  screenName,
  stackName,
) {
  navigation.dispatch(
    StackActions.reset({
      index: 0,
      key: null,
      actions: [
        NavigationActions.navigate({
          routeName: stackName,
          action: NavigationActions.navigate({routeName: screenName}),
        }),
      ],
    }),
  );
}

export async function retrieveItem(key) {
  try {
    const retrievedItem = await AsyncStorage.getItem(key);
    const item = JSON.parse(retrievedItem);
    return item;
  } catch (error) {
  }
  return;
}

export function getCurrentLocation() {
  navigator.geolocation.getCurrentPosition(
    position => {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      error = null;
    },
    error => (error = error.message),
    {enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
  );
}

export function getMyCurrentLocation() {
  return new Promise((resolve, errorObj) => {
    navigator.geolocation.getCurrentPosition(
      position => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        error = null;
        resolve(true);
      },
      error => {
        errorObj(error);
      },
      {enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
    );
  });
}

export function getMaxDateForDOB(dateString, yearsToSubtract) {
  var today = new Date();
  today.setFullYear(today.getFullYear() - yearsToSubtract);
  return today;
}

export function checkNull(value) {
  return value ? value : '';
}

export function validateEmail(email) {
  var re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export function validatePassword(password) {
  //MP
  var re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
  return re.test(password);
} //MP

export function validateUsername(username) {
  var re = /^[a-zA-Z0-9]+[\w-@.]+[a-zA-Z0-9]$/;
  return re.test(username);
}

export function validateChildName(childName) {
  var re = /^[a-zA-Z]*$/;
  return re.test(childName);
}

export function showSnackBar(msg) {
  Snackbar.show({
    title: msg,
    duration: Snackbar.LENGTH_SHORT,
  });
}

export function showErrorMessage(msg) {
  Alert.alert(Constants.APP_NAME, msg);
}

export function showConfirmationMessage(
  msg,
  btnFirstName = 'NO',
  btnSecondName = 'YES',
) {
  return new Promise(resolve => {
    Alert.alert(Constants.APP_NAME, msg, [
      {
        text: btnFirstName,
        onPress: () => {
          resolve(false);
        },
        style: 'cancel',
      },
      {
        text: btnSecondName,
        onPress: () => {
          resolve(true);
        },
      },
    ]);
  });
}

// export function showConfirmationMessageActions(msg, btnFirstName = 'Yes', btnSecondName = 'No', action1, action2) {
//     return new Promise(resolve => {
//         Alert.alert(
//             Constants.APP_NAME,
//             msg,
//             [
//                 { text: btnSecondName, onPress: () => { action2(); resolve(true) } },
//                 { text: btnFirstName, onPress: () => { action1(); resolve(false) }, style: 'cancel' },
//             ]
//         )
//     })
// }
export const showConfirmationMessageActions = (
  msg,
  btnFirstName = 'Yes',
  btnSecondName = 'No',
  action1 = () => {},
  action2 = () => {},
) =>
  Alert.alert(Constants.APP_NAME, msg, [
    {
      text: btnSecondName,
      onPress: () => action2(),
      style: 'cancel',
    },
    {
      text: btnFirstName,
      onPress: () => action1(),
    },
  ]);

export const showConfirmationMessageSingleAction = (
  msg,
  btnName = 'Yes',
  action = () => {},
) =>
  Alert.alert(Constants.APP_NAME, msg, [
    {
      text: btnName,
      onPress: () => action(),
    },
  ]);

export function showConfirmationMessagesignleAction(msg, btnFirstName = 'YES') {
  return new Promise(resolve => {
    Alert.alert(Constants.APP_NAME, msg, [
      {
        text: btnFirstName,
        onPress: () => {
          resolve(true);
        },
      },
    ]);
  });
}

export function getUserImage() {
  AsyncStorage.getItem(Constants.KEY_USER_IMAGE, (err, imageURL) => {
    if (imageURL != '') {
      return imageURL;
    } else {
      return '';
    }
  });
}

export function showMessageWithAction(msg) {
  return new Promise(resolve => {
    Alert.alert(Constants.APP_NAME, msg, [
      {
        text: 'OK',
        onPress: () => {
          resolve(true);
        },
      },
    ]);
  });
}

//#region -> Moment Methods

export function getLocalTimefromUTC(time, toFormat) {
  var utcDate = Moment.utc(time, 'YYYY-MM-DD HH:mm:ss').toDate();
  const localDate = Moment(utcDate).local().format(toFormat); // converted in to local time
  return localDate;
}

export function getCurrentUTCTime(toFormat) {
  var utcDate = Moment.utc().format(toFormat);
  return utcDate;
}

export function getDayName() {
  var dayName = Moment().format('dddd');
  return dayName.toUpperCase();
}

export function getFormatedCurrentTime(withFormate) {
  var aTime = Moment().format(withFormate);
  return aTime;
}

export function getCurrentTime() {
  var currentTime = Moment().format('HH:mm a');
  return currentTime.toUpperCase();
}

export function getDaysFromWeek() {
  var day = Moment();
  var endOfWeek = Moment().endOf('isoWeek');

  var days = [];

  while (day <= endOfWeek) {
    days.push(day.format('dddd DD MMMM YYYY')); //Monday 12 October 2018
    day = day.clone().add(1, 'd');
  }
  return days;
}

export function getUpcominSevenDays() {
  var day = Moment();
  var endOfWeek = Moment().endOf('isoWeek');

  var days = [];

  for (let index = 0; index < 7; index++) {
    // const element = array[index];
    days.push(day.format('dddd DD MMMM YYYY')); //Monday 12 October 2018
    day = day.clone().add(1, 'd');
  }

  // while (day <= endOfWeek) {
  //     days.push(day.format('dddd DD MMMM YYYY')); //Monday 12 October 2018
  //     day = day.clone().add(1, 'd');
  // }
  return days;
}

export function getMinimumTime(fromTime) {
  var minimumTime = Moment(fromTime, 'hh:mm A')
    .add(5, 'minutes')
    .format('hh:mm A');
  return minimumTime;
}

export function getMinimumDateForCalender() {
  var today = Moment().format('YYYY-MM-DD');
  return today;
}

export function dateFormater(fromDate, fromDateFormate, toDateFormate) {
  var newDate = Moment(fromDate, fromDateFormate).format(toDateFormate);
  return newDate;
}

export function getBackgroudImageTwelveHrsOnly(callbackFunction) {
  var format = 'HHmm';
  var currentTime = parseInt(Moment().format(format));
  var bgImg = Images.BgEvening;
  var navColor = Colors.BgEvening;

  if (currentTime < 500 || currentTime > 1900) {
    bgImg = Images.BgLateEvening;
    navColor = Colors.BgLateEvening;
  } else if (currentTime < 600) {
    bgImg = Images.BgEarlyMorning;
    navColor = Colors.BgEarlyMorning;
  } else if (currentTime < 1700) {
    bgImg = Images.BgDay;
    navColor = Colors.BgDay;
  }
  callbackFunction(bgImg, navColor);
}

export function getBackgroudImage(callbackFunction) {
  let format = 'HHmm';
  let currentTime = parseInt(Moment().format(format));
  let bgImg = Images.BGTwentyFourHrs;
  let navColor = Colors.navHeader;
  // AsyncStorage.getItem(Constants.KEY_IS_24HRS_CLOCK, (err, result) => {
  //     if (result != 'true') {
  if (currentTime >= 501 && currentTime <= 699) {
    bgImg = Images.BgEarlyMorning;
    navColor = Colors.BgEarlyMorning;
  } else if (currentTime >= 700 && currentTime <= 1700) {
    bgImg = Images.BgDay;
    navColor = Colors.BgDay;
  } else if (currentTime >= 1701 && currentTime <= 1899) {
    bgImg = Images.BgEvening;
    navColor = Colors.BgEvening;
  } else if (currentTime >= 1900 && currentTime <= 500) {
    bgImg = Images.BgEvening;
    navColor = Colors.BgEvening;
  } else {
    bgImg = Images.BgLateEvening;
    navColor = Colors.BgLateEvening;
  }
  // }
  callbackFunction(bgImg, navColor);
  // })
}

export function getPlanetImageForTheDay(arrWeekDays, index) {
  var aDay = this.dateFormater(
    arrWeekDays[index],
    'dddd DD MMMM YYYY',
    'dddd',
  ).toLowerCase();

  var aPlanetDict = {image: Images.sunday, message: Constants.SUNDAY_MESSAGE};
  switch (aDay) {
    case 'monday':
      aPlanetDict = {image: Images.monday, message: Constants.MONDAY_MESSAGE};
      break;
    case 'tuesday':
      aPlanetDict = {image: Images.tuesday, message: Constants.TUESDAY_MESSAGE};
      break;
    case 'wednesday':
      aPlanetDict = {
        image: Images.wednesday,
        message: Constants.WEDNESDAY_MESSAGE,
      };
      break;
    case 'thursday':
      aPlanetDict = {
        image: Images.thursday,
        message: Constants.THURSDAY_MESSAGE,
      };
      break;
    case 'friday':
      aPlanetDict = {image: Images.friday, message: Constants.FRIDAY_MESSAGE};
      break;
    case 'saturday':
      aPlanetDict = {
        image: Images.saturday,
        message: Constants.SATURDAY_MESSAGE,
      };
      break;
    default:
    // code block
  }
  return aPlanetDict;
}

export function isIPhoneX() {
  const X_WIDTH = 375;
  const X_HEIGHT = 812;
  const {height: D_HEIGHT, width: D_WIDTH} = Dimensions.get('window');

  if (
    Platform.OS === 'ios' &&
    ((D_HEIGHT === X_HEIGHT && D_WIDTH === X_WIDTH) ||
      (D_HEIGHT === X_WIDTH && D_WIDTH === X_HEIGHT))
  )
    return true;

  return false;
}

export async function getChildRewardPoints(navigation) {
  var specialReward = 0,
    standardReward = 0;

  const isLogin = await AsyncStorage.getItem(Constants.KEY_IS_LOGIN);
  if (isLogin === '1') {
    let child = await AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD);

    const childId = JSON.parse(child).id;
    this.setRewardIcon(navigation);
    const mApi = Api.createSecure();
    mApi
      .childRewardPoints(childId)
      .then(response => {
        if (response.ok) {
          if (response.data.success) {
            Constants.standardReward = response.data.data.standard;
            Constants.specialReward = response.data.data.special;
            navigation ? Helper.setNavigationRewardCoins(navigation) : null;
            EventEmitter.emit(Constants.EVENT_REWARD_COIN_UPDATE);
          }
        }
      })
      .catch(error => {
      });
  }
}

export function setNavigationRewardCoins(navigation) {
  navigation.setParams({
    specialReward: Constants.specialReward + '',
    standardReward: Constants.standardReward + '',
    standardRewardIcon: Constants.standardRewardIcon,
  });
}

export async function setRewardIcon(navigation) {
  let child = await AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD);
  let rewardIcon = JSON.parse(child).icon.split('/').slice(-1)[0].split('.')[0];

  switch (rewardIcon) {
    case 'star':
      Constants.standardRewardIcon = Images.reward_star;
      break;
    case 'bomb':
      Constants.standardRewardIcon = Images.reward_bomb;
      break;
    case 'diamond':
      Constants.standardRewardIcon = Images.reward_diamond;
      break;
    case 'duck':
      Constants.standardRewardIcon = Images.reward_duck;
      break;
    case 'flower':
      Constants.standardRewardIcon = Images.reward_flower;
      break;
    case 'leaf':
      Constants.standardRewardIcon = Images.reward_leaf;
      break;
    case 'settings':
      Constants.standardRewardIcon = Images.reward_settings;
      break;
    default:
    // code block
  }
  this.setNavigationRewardCoins(navigation);
}

export function chooseTime(arrTakenTime, newTime) {
  const format = 'hh:mm A';
  var requestedStart = Moment(newTime.from, format);
  var requestedEnd = Moment(newTime.to, format);
  for (let i = 0; i < arrTakenTime.length; i++) {
    if (
      Moment(arrTakenTime[i].from, format) < requestedEnd &&
      requestedStart < Moment(arrTakenTime[i].to, format)
    ) {
      return false;
    }
  }
  return true;
}

//Filter data here for school or non school task
export function setupTasksBasedOnMeridiem(
  objArrTasks,
  schoolStartTime,
  schoolEndTime,
  callbackFunction,
) {
  var arrStartWithAM = [];
  var arrStartWithPM = [];
  var arrFilteredData_AM = [];
  var arrFilteredData_PM = [];
  var currentRunningTaskSlot = '';
  var is_school_clock = [];

  arrStartWithPM = objArrTasks.filter(item => {

    return item.tasks[0].start_time_meridiem == 'PM';
  });

  arrStartWithPM.reverse();

  is_school_clock = objArrTasks.map(item => {
    return item.tasks[0].is_school_clock;
  });


  arrStartWithAM = objArrTasks.filter(item => {
    if (
      item.tasks[0].start_time_meridiem == 'AM' &&
      item.tasks[0].end_time_meridiem == 'PM'
    ) {
      arrStartWithPM.push(item);
    }
    return item.tasks[0].start_time_meridiem == 'AM';
  });

  arrStartWithPM.reverse();
  currentRunningTaskSlot = objArrTasks.filter(item => {
    var startTime = Moment(item.time.split('-')[0], 'hh:mm A');
    var endTime = Moment(item.time.split('-')[1], 'hh:mm A');
    var now = new Date();
    return now < endTime && now > startTime ? item : '';
  });

  const startTime = parseInt(schoolStartTime.format('hhmm'));
  const endTime = parseInt(schoolEndTime.format('hhmm'));

  arrFilteredData_PM = arrStartWithPM.filter(item => {
    const taskStartPosition = parseInt(
      Moment(item.tasks[0].time_from, 'hh:mm A').format('hhmm'),
    );
    const taskEndPosition = parseInt(
      Moment(item.tasks[0].time_to, 'hh:mm A').format('hhmm'),
    );

    //|| taskStartPosition <= 1259 add
    if (taskStartPosition <= endTime) {
      return true;
    }
    return false;
  });

  currentRunningTaskSlot =
    currentRunningTaskSlot.length > 0 ? currentRunningTaskSlot : '';

  callbackFunction(
    arrStartWithAM,
    arrStartWithPM,
    currentRunningTaskSlot,
    arrFilteredData_AM,
    arrFilteredData_PM,
    is_school_clock,
  );
}

export function getTimeSlot(hour, timeMeridiem) {
  var timeSlot = 0;
  if (hour >= 0 && hour < 6) {
    timeSlot = 1;
  }
  if (hour >= 6 && hour < 12) {
    timeSlot = 2;
  }
  if (hour >= 12 && hour < 18) {
    timeSlot = 3;
  }
  if (hour >= 18 && hour < 24) {
    timeSlot = 4;
  }
  return timeSlot;
}

export function generateClockTaskArray(
  arrTask,
  valueToCompare,
  currentTimeSlot,
  is24Hour,
) {
  const school = {FROM: '00:00 AM', TO: '00:00 AM'};
  todaysSchoolHours = school;
  var remender = 720;
  if (!arrTask || arrTask.length == 0) {
    const dicValue = {
      taskId: 'D',
      value: remender,
      isEmpty: true,
    };
    const data = [dicValue];
    return data;
  }
  const data = [];
  var date, TimeType, hour;

  // Creating Date() function object.
  date = new Date();

  // Getting current hour from Date object.
  hour = date.getHours();
  if (hour <= 11) {
    TimeType = 'AM';
  } else {
    // If the Hour is Not less than equals to 11 then Set the Time format as PM.
    TimeType = 'PM';
  }
  if (currentTimeSlot == undefined) {
    currentTimeSlot = getTimeSlot(hour, TimeType).toString();
  }

  arrTask.forEach(baseTask => {
    var task;
    var startTimeSlot = getTimeSlot(
      Moment(baseTask.tasks[0].time_from, 'hh:mm A').format('HH'),
      baseTask.tasks[0].start_time_meridiem,
    ).toString();
    var endTimeSlot = getTimeSlot(
      Moment(baseTask.tasks[0].time_to, 'hh:mm A').format('HH'),
      baseTask.tasks[0].end_time_meridiem,
    ).toString();

    
    //school and task start
    var check = 0;
    if (currentTimeSlot == startTimeSlot || startTimeSlot != endTimeSlot) {
      task = baseTask;
      check = 1;
    } else {
      task = baseTask;
    }
    var taskTimeStart = Moment(task.tasks[0].time_from, 'hh:mm A');
    var schoolTimeStart = Moment(todaysSchoolHours.FROM, 'hh:mm A');
    let isTaskStartBeforeSchoolStart = false;
    let isTaskValueToCompare = false;

    //school and task end time
    var taskTimeEnd = Moment(task.tasks[0].time_to, 'hh:mm A');
    var TimeEnd = Moment('11:59 AM', 'hh:mm A');
    let isEndStartAfterSchoolEnd = false;

    // check task is starting after or before school time
    if (schoolTimeStart.isAfter(taskTimeStart)) {
      isTaskStartBeforeSchoolStart = true;
    }

    // check task is ending after or before school time
    if (taskTimeEnd.isAfter(TimeEnd)) {
      isEndStartAfterSchoolEnd = true;
    }
    if (
      task.tasks[0].start_time_meridiem == 'AM' &&
      task.tasks[0].end_time_meridiem == 'PM' &&
      valueToCompare == 'am'
    ) {
      isTaskValueToCompare = true;
    }

    var startTime = isTaskStartBeforeSchoolStart
      ? Moment(todaysSchoolHours.FROM, 'hh:mm A')
      : Moment(task.tasks[0].time_from, 'hh:mm A');

    //do some stuff here for clock time duration
    var endTime = Moment(task.tasks[0].time_to, 'hh:mm A');
    // var startTime = Moment(task.tasks[0].time_from, 'hh:mm A')
    

    var color = task.tasks[0].color;
    var duration = null;


    if (isTaskValueToCompare) {
      duration = TimeEnd.diff(
        Moment(task.tasks[0].time_from, 'hh:mm A'),
        'minutes',
      );
      // duration = (duration + (duration > 0 ? 1 : 0))
    } else {
      if (valueToCompare == 'am' && task.tasks[0].end_time_meridiem == 'AM') {
        if (currentTimeSlot == 2) {
          if (
            startTime.isBefore(
              moment().set({hour: 6, minute: 0, second: 0, millisecond: 0}),
            )
          ) {
            duration = endTime.diff(
              Moment(Moment('06:00 AM', 'hh:mm A'), 'hh:mm A'),
              'minutes',
            );
          } else {
            duration = endTime.diff(
              Moment(task.tasks[0].time_from, 'hh:mm A'),
              'minutes',
            );
          }
        } else {
          duration = endTime.diff(
            Moment(task.tasks[0].time_from, 'hh:mm A'),
            'minutes',
          );
        }
        // duration = endTime.diff(Moment('12:00 AM', 'hh:mm A'), 'minutes');
        
      } else if (
        valueToCompare == 'am' &&
        task.tasks[0].start_time_meridiem == 'AM' &&
        task.tasks[0].end_time_meridiem == 'PM'
      ) {
        duration = endTime.diff(
          Moment(task.tasks[0].time_from, 'hh:mm A'),
          'minutes',
        );
        // duration = endTime.diff(Moment(task.tasks[0].time_from, 'hh:mm A'), 'minutes');
        
      } else if (
        valueToCompare == 'pm' &&
        task.tasks[0].start_time_meridiem == 'AM' &&
        task.tasks[0].end_time_meridiem == 'PM'
      ) {
        if (moment(endTime, 'hh:mm A').hours() > 12) {
          duration = endTime.diff(
            Moment(task.tasks[0].time_from, 'hh:mm A'),
            'minutes',
          );
        } else {
          duration = endTime.diff(
            Moment(Moment('06:00 PM', 'hh:mm A'), 'hh:mm A'),
            'minutes',
          );
        }
        duration = endTime.diff(Moment('12:00 PM', 'hh:mm A'), 'minutes');
        // duration = endTime.diff(Moment(task.tasks[0].time_from, 'hh:mm A'), 'minutes');
        
      } else if (
        valueToCompare == 'pm' &&
        task.tasks[0].start_time_meridiem == 'PM' &&
        task.tasks[0].end_time_meridiem == 'PM'
      ) {
        if (currentTimeSlot > 3) {
          if (moment(startTime, 'hh:mm A').hours() > 18) {
            duration = endTime.diff(
              Moment(task.tasks[0].time_from, 'hh:mm A'),
              'minutes',
            );
          } else {
            duration = endTime.diff(
              Moment(Moment('06:00 PM', 'hh:mm A'), 'hh:mm A'),
              'minutes',
            );
          }
        } else {
          duration = endTime.diff(
            Moment(task.tasks[0].time_from, 'hh:mm A'),
            'minutes',
          );
        }
        // duration = endTime.diff(Moment('06:00 PM', 'hh:mm A'), 'minutes');

        
      } else {
        duration = endTime.diff(startTime, 'minutes');
        // duration = endTime.diff(Moment(task.tasks[0].time_from, 'hh:mm A'), 'minutes');
        
      }
      // if (valueToCompare=="am" && task.tasks[0].start_time_meridiem == "AM" && task.tasks[0].end_time_meridiem == "AM") {
      //     duration = endTime.diff(Moment(task.tasks[0].time_from, 'hh:mm A'), 'minutes');
      // } else if (valueToCompare=="pm" && task.tasks[0].start_time_meridiem == "AM" && task.tasks[0].end_time_meridiem == "PM") {
      //     duration = endTime.diff(Moment('12:00 PM', 'hh:mm A'), 'minutes');
      //     // duration = endTime.diff(Moment(task.tasks[0].time_from, 'hh:mm A'), 'minutes');
      // }
      // else if (task.tasks[0].start_time_meridiem == "PM" && task.tasks[0].end_time_meridiem == "PM") {
      //     duration = endTime.diff(Moment('12:00 PM', 'hh:mm A'), 'minutes');
      //     // duration = endTime.diff(Moment(task.tasks[0].time_from, 'hh:mm A'), 'minutes');
      // }
      // else{
      //     duration = endTime.diff(startTime, 'minutes');
      //     // duration = endTime.diff(Moment(task.tasks[0].time_from, 'hh:mm A'), 'minutes');

      // }

    }

    // var duration = endTime.diff(startTime, 'minutes');
    if (is24Hour) {
      if (duration > 0) {
        const dicValue = {
          taskId: task.time,
          color: color,
          value: duration,
          isEmpty: false,
          startPosition:
            task.tasks[0].start_time_meridiem == 'AM' &&
            task.tasks[0].end_time_meridiem == 'PM'
              ? currentTimeSlot < 3
                ? parseInt(
                    Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
                  )
                : parseInt(
                    Moment(Moment('12:00 PM', 'hh:mm A'), 'hhmm').format(
                      'hhmm',
                    ),
                  )
              : task.tasks[0].start_time_meridiem == 'PM' &&
                task.tasks[0].end_time_meridiem == 'PM'
              ? currentTimeSlot > 3
                ? moment(startTime, 'hh:mm A').hours() > 18
                  ? parseInt(
                      Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
                    )
                  : parseInt(
                      Moment(Moment('06:00 AM', 'hh:mm A')).format('hhmm'),
                    )
                : parseInt(
                    Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
                  )
              : task.tasks[0].start_time_meridiem == 'AM' &&
                task.tasks[0].end_time_meridiem == 'AM'
              ? currentTimeSlot == 2
                ? startTime.isBefore(
                    moment().set({
                      hour: 6,
                      minute: 0,
                      second: 0,
                      millisecond: 0,
                    }),
                  )
                  ? parseInt(
                      Moment(Moment('06:00 AM', 'hh:mm A')).format('hhmm'),
                    )
                  : parseInt(
                      Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
                    )
                : parseInt(
                    Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
                  )
              : parseInt(
                  Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
                ),
          // startPosition: parseInt(
          //   Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
          // ),
          startTimeMeridiem: task.tasks[0].start_time_meridiem,
          endPosition: parseInt(
            Moment(task.tasks[0].time_to, 'hhmm').format('hhmm'),
          ),
          endTimeMeridiem: isTaskValueToCompare
            ? 'AM'
            : task.tasks[0].end_time_meridiem,
          // endTimeMeridiem:task.tasks[0].end_time_meridiem,
          StartTimeSlote: startTimeSlot,
          CurruntTimeSlote: currentTimeSlot,
          is_school_clock: task.tasks[0].is_school_clock,
        };

        // if (valueToCompare == 'pm' && dicValue.startTimeMeridiem.toLowerCase() == 'am') {
        //     // duration = Helper.convertDiffrenceInTimeToMinutes(dicValue.endPosition, 0, valueToCompare, dicValue.endTimeMeridiem)
        //     dicValue.startPosition = 1200
        //     dicValue.startTimeMeridiem = valueToCompare
        //     dicValue.value = duration   //here some staff add wrong value
        // }
        remender -= duration;
        
        // if(check==1){

        data.push(dicValue);
      }
    } else {
      if (currentTimeSlot <= startTimeSlot || currentTimeSlot <= endTimeSlot) {
        if (duration > 0) {
          const dicValue = {
            taskId: task.time,
            color: color,
            value: duration,
            isEmpty: false,
            startPosition:
              task.tasks[0].start_time_meridiem == 'AM' &&
              task.tasks[0].end_time_meridiem == 'PM'
                ? currentTimeSlot < 3
                  ? parseInt(
                      Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
                    )
                  : parseInt(
                      Moment(Moment('12:00 PM', 'hh:mm A'), 'hhmm').format(
                        'hhmm',
                      ),
                    )
                : task.tasks[0].start_time_meridiem == 'PM' &&
                  task.tasks[0].end_time_meridiem == 'PM'
                ? currentTimeSlot > 3
                  ? moment(startTime, 'hh:mm A').hours() > 18
                    ? parseInt(
                        Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
                      )
                    : parseInt(
                        Moment(Moment('06:00 AM', 'hh:mm A')).format('hhmm'),
                      )
                  : parseInt(
                      Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
                    )
                : task.tasks[0].start_time_meridiem == 'AM' &&
                  task.tasks[0].end_time_meridiem == 'AM'
                ? currentTimeSlot == 2
                  ? startTime.isBefore(
                      moment().set({
                        hour: 6,
                        minute: 0,
                        second: 0,
                        millisecond: 0,
                      }),
                    )
                    ? parseInt(
                        Moment(Moment('06:00 AM', 'hh:mm A')).format('hhmm'),
                      )
                    : parseInt(
                        Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
                      )
                  : parseInt(
                      Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
                    )
                : parseInt(
                    Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
                  ),
            // startPosition: parseInt(
            //   Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
            // ),
            startTimeMeridiem: task.tasks[0].start_time_meridiem,
            endPosition: parseInt(
              Moment(task.tasks[0].time_to, 'hhmm').format('hhmm'),
            ),
            endTimeMeridiem: isTaskValueToCompare
              ? 'AM'
              : task.tasks[0].end_time_meridiem,
            // endTimeMeridiem:task.tasks[0].end_time_meridiem,
            StartTimeSlote: startTimeSlot,
            CurruntTimeSlote: currentTimeSlot,
            is_school_clock: task.tasks[0].is_school_clock,
          };

          // if (valueToCompare == 'pm' && dicValue.startTimeMeridiem.toLowerCase() == 'am') {
          //     // duration = Helper.convertDiffrenceInTimeToMinutes(dicValue.endPosition, 0, valueToCompare, dicValue.endTimeMeridiem)
          //     dicValue.startPosition = 1200
          //     dicValue.startTimeMeridiem = valueToCompare
          //     dicValue.value = duration   //here some staff add wrong value
          // }
          remender -= duration;
          
          // if(check==1){

          data.push(dicValue);
        }
      }
    }
  });
  const sortedData = data.sort(
    Helper.compareValues('startPosition', valueToCompare),
  );
 
  const fullSortedData = Helper.compareMissingValues(data.sort((a, b) => {
    // Extracting the start time from taskId using moment
    const timeA = moment(a.taskId.split(" - ")[0], "hh:mm A");
    const timeB = moment(b.taskId.split(" - ")[0], "hh:mm A");
    
    // Comparing the times
    return timeA.diff(timeB);
  }), valueToCompare);

  return fullSortedData;
}

export function compareMissingValues(sortedData, valueToCompare) {
  var arrFullData = [];
  var remainingTimeVal = 720;

  for (let [i, element] of sortedData.entries()) {
    if (element.startTimeMeridiem.toLowerCase() != valueToCompare) {
      const value = Helper.convertDiffrenceInTimeToMinutes(
        element.endPosition,
        0,
        element.startTimeMeridiem,
        'empty',
      );

      if (valueToCompare == 'pm') {
        if (value <= 720 && value > 0) {
          const dicValue = {
            taskId: element.taskId,
            color: element.color,
            value: value,
            isEmpty: element.isEmpty,
            startPosition: 1200,
            startTimeMeridiem: 'PM',
            endPosition: element.endPosition,
            endTimeMeridiem: element.endTimeMeridiem,
            is_school_clock: element.is_school_clock,
          };
          remainingTimeVal -= value;
          arrFullData.push(dicValue);
        }

        const nextElement = sortedData[i + 1];
        if (nextElement) {
          var endTime = element.endPosition;
          var startTime = nextElement.startPosition;
          const diff = Helper.convertDiffrenceInTimeToMinutes(
            startTime,
            endTime,
            nextElement.startTimeMeridiem,
            element.endTimeMeridiem,
          );
          if (endTime != startTime) {
            remainingTimeVal -= diff;
            arrFullData.push({
              taskId: 'Blannk1 ' + i,
              value: diff,
              isEmpty: true,
              color: '#ffffff',
            });
          }
        }
      }
    } else {
      //do some staff here for timing
      if (i == 0 && element.startPosition != 1200) {
        var diff = 0;
        var endTime = element.startPosition;
        diff = Helper.convertDiffrenceInTimeToMinutes(
          endTime,
          1200,
          element.startTimeMeridiem,
          valueToCompare,
        );
        if (diff < 0) {
          diff = Helper.convertDiffrenceInTimeToMinutes(
            endTime,
            0,
            element.startTimeMeridiem,
            valueToCompare,
          );
        }

        remainingTimeVal -= diff;
        arrFullData.push({
          taskId: 'Blannk2',
          value: diff,
          isEmpty: true,
        });
      }
      if (element.startTimeMeridiem.toLowerCase() == valueToCompare) {
        if (element.endTimeMeridiem.toLowerCase() != valueToCompare) {
          diff = Helper.convertDiffrenceInTimeToMinutes(
            1200,
            element.startPosition,
            'pm',
            element.startTimeMeridiem,
          );
          remainingTimeVal -= diff;
          element.value = diff;
        } else {
          remainingTimeVal -= element.value;
        }
        arrFullData.push(element);
        const nextElement = sortedData[i + 1];
        if (nextElement) {
          var endTime = element.endPosition;
          var startTime = nextElement.startPosition;
          const diff = Helper.convertDiffrenceInTimeToMinutes(
            startTime,
            endTime,
            nextElement.endTimeMeridiem,
            element.startTimeMeridiem,
          );
          if (endTime != startTime && diff > 0 && diff <= 720) {
            remainingTimeVal -= diff;
            arrFullData.push({
              taskId: 'Blannk3 ' + i,
              value: diff,
              isEmpty: true,
              color: '#ffffff',
            });
          }
        }
      }
    }
  }
  if (remainingTimeVal > 0) {
    arrFullData.push({
      taskId: 'Blannk4',
      value: remainingTimeVal,
      isEmpty: true,
    });
  }
  return arrFullData;
}

export function compareMissingValuesForSchool(sortedData, valueToCompare) {

  var arrFullData = [];
  var remainingTimeVal = 720;

  for (let [i, element] of sortedData.entries()) {
    if (element.startTimeMeridiem.toLowerCase() != valueToCompare) {
      const value = Helper.convertDiffrenceInTimeToMinutes(
        element.endPosition,
        0,
        element.startTimeMeridiem,
        'empty',
      );
      if (valueToCompare == 'pm') {
        if (value <= 720) {
          const dicValue = {
            taskId: element.taskId,
            color: element.color,
            value: value,
            isEmpty: element.isEmpty,
            startPosition: 1200,
            startTimeMeridiem: 'PM',
            endPosition: element.endPosition,
            endTimeMeridiem: element.endTimeMeridiem,
          };
          remainingTimeVal -= value;
          arrFullData.push(dicValue);
        }

        const nextElement = sortedData[i + 1];
        if (nextElement) {
          var endTime = element.endPosition;
          var startTime = nextElement.startPosition;
          const diff = Helper.convertDiffrenceInTimeToMinutes(
            startTime,
            endTime,
            nextElement.startTimeMeridiem,
            element.endTimeMeridiem,
          );
          if (endTime != startTime && diff > 0) {
            remainingTimeVal -= diff;
            arrFullData.push({
              taskId: 'Blannk1 ' + i,
              value: diff,
              isEmpty: true,
              color: '#ffffff',
            });
          }
        }
      }
    } else {
      if (i == 0 && element.startPosition != 1200) {
        var diff = 0;
        var endTime = element.startPosition;
        diff = Helper.convertDiffrenceInTimeToMinutes(
          endTime,
          1200,
          element.startTimeMeridiem,
          valueToCompare,
        );
        if (diff < 0) {
          diff = Helper.convertDiffrenceInTimeToMinutes(
            endTime,
            0,
            element.startTimeMeridiem,
            valueToCompare,
          );
        }
        if (diff > 0) {
          remainingTimeVal -= diff;
          arrFullData.push({
            taskId: 'Blannk2',
            value: diff,
            isEmpty: true,
            color: 'white',
          });
        }
      }
      if (element.startTimeMeridiem.toLowerCase() == valueToCompare) {
        if (element.endTimeMeridiem.toLowerCase() != valueToCompare) {
          diff = Helper.convertDiffrenceInTimeToMinutes(
            1200,
            element.startPosition,
            'pm',
            element.startTimeMeridiem,
          );
          remainingTimeVal -= diff;
          element.value = diff;
        } else {
          remainingTimeVal -= element.value;
        }
        arrFullData.push(element);
        const nextElement = sortedData[i + 1];
        if (nextElement) {
          var endTime = element.endPosition;
          var startTime = nextElement.startPosition;
          const diff = Helper.convertDiffrenceInTimeToMinutes(
            startTime,
            endTime,
            nextElement.endTimeMeridiem,
            element.startTimeMeridiem,
          );
          if (endTime != startTime && diff > 0 && diff <= 720) {
            remainingTimeVal -= diff;
            arrFullData.push({
              taskId: 'Blannk3 ' + i,
              value: diff,
              isEmpty: true,
              color: Colors.gray,
            });
          }
        }
      }
    }
  }
  if (remainingTimeVal > 0) {
    arrFullData.push({
      taskId: 'Blannk4',
      value: remainingTimeVal,
      isEmpty: true,
    });
  }
  return arrFullData;
}

export function convertDiffrenceInTimeToMinutes(
  startTime,
  endTime,
  meradianStart,
  meradianEnd,
) {
  const diffrenceInTime =
    Helper.getRelativeTimeInMinutes(startTime, meradianStart) -
    Helper.getRelativeTimeInMinutes(endTime, meradianEnd);
  return diffrenceInTime;
}

export function getRelativeTimeInMinutes(time, meradian) {
  if (time > 99) {
    if (time >= 1200 && time <= 1259) {
      return time - 1200;
    }
    const deviderInCentury = parseInt(time / 100);
    const remender = time % 100;
    const diffrenceInMinutes = deviderInCentury * 60 + remender;

    return diffrenceInMinutes;
  } else {
    return time;
  }
}

// function for dynamic sorting
export function compareValues(key, valueToCompare, order = 'asc') {
  return function (a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
    const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (a.startTimeMeridiem.toLowerCase() != valueToCompare) {
      comparison = 0;
    } else {
      valueA = varA;
      valueB = varB;
      if (varA >= 1200 && varA <= 1259) {
        valueA = varA - 1200;
      }
      if (varB >= 1200 && varB <= 1259) {
        valueB = varB - 1200;
      }
      if (
        valueA > valueB &&
        a.startTimeMeridiem.toLowerCase() == valueToCompare
      ) {
        comparison = 1;
      } else if (valueA < valueB) {
        comparison = -1;
      }
    }
    const valToReturn = order == 'desc' ? comparison * -1 : comparison;
    return valToReturn;
  };
}

export function getCurrentTimeMeridian() {
  const meridiam = Moment().format('a').toLowerCase();
  return meridiam;
}

export function getTodaysDay() {
  const meridian = Moment().format('ddd').toUpperCase();
  return meridian;
}

export function getPaginatedArray(
  originalArray,
  item_per_page,
  setPaginatedArray,
) {
  var paginatedArray = [];
  for (var i = 0, len = originalArray.length; i < len; i += item_per_page)
    paginatedArray.push(originalArray.slice(i, i + item_per_page));
  setPaginatedArray(paginatedArray);
}

export function getRemainTimeForTask(objTask) {
  var remaingTime = '';
  if (objTask.start_time == '') {
    remaingTime = objTask.task_time;
    return remaingTime;
  }
  let aLocalTime = Helper.getLocalTimefromUTC(objTask.start_time, 'hh:mm A');
  let aStartTime = Moment(aLocalTime, 'hh:mm A');
  let aCurrentTime = Moment();
  let currentTime = Moment(aCurrentTime, 'hh:mm A');
  let aRemainTime = objTask.task_time - currentTime.diff(aStartTime, 'minutes');
  remaingTime = aRemainTime > 0 ? aRemainTime : 0;

  return remaingTime;
}

export function getPercentageArrForTask(objTask) {
  var arrOfPercentage = [];
  var aRemainTime = Helper.getRemainTimeForTask(objTask);
  var aRemainTimeObj =
    ((objTask.task_time - aRemainTime) * 100) / objTask.task_time;
  arrOfPercentage.push(aRemainTimeObj);
  arrOfPercentage.push(100 - aRemainTimeObj);
  return arrOfPercentage;
}

export function checkTaskTimeAndDate(objTask) {
  
  var isFutureTask = false;
  var taskStartTime = Moment(objTask.time_from, 'HH:mm a')
    .format('HH:mm a')
    .toUpperCase();
  var taskEndTime = Moment(objTask.time_to, 'HH:mm a')
    .format('HH:mm a')
    .toUpperCase();

  if (
    objTask.task_date !== this.getMinimumDateForCalender() ||
    (this.getCurrentTime() < taskStartTime &&
      this.getCurrentTime() < taskEndTime)
  ) {
    isFutureTask = true;
  }
  return isFutureTask;
}

export function checkChoosenTimeIsValidOrNot(selectedTime, callbackFunction) {
  var isPastSelectedTime = false;
  var aNewDay = Helper.getMinimumDateForCalender();
  var todayIsSunday = getTodaysDay() == 'SUN' ? true : false;
  var taskStartTime = Moment(selectedTime, 'HH:mm a')
    .format('HH:mm a')
    .toUpperCase();

  if (taskStartTime < this.getCurrentTime()) {
    isPastSelectedTime = true;
    aNewDay = Moment().add(1, 'days').format('YYYY-MM-DD');
  }

  callbackFunction(aNewDay, isPastSelectedTime, todayIsSunday);
}

export function getTimeFromSelectTimeSlot(objTime) {
  var endTime = Moment(objTime.split('-')[1], 'hh:mm A');
  var startTime = Moment(objTime.split('-')[0], 'hh:mm A');
  var duration = endTime.diff(startTime, 'minutes');
  return duration;
}

/* **************************************************************************************************************************** */
/* **************************************************************************************************************************** */
/* **************************************************************************************************************************** */

export function generateClockTaskArraySchool(
  arrTask,
  meridianValueToCompare,
  schoolHoursFrom,
  schoolHoursTo,
  schoolMeridian,
  isDualSchool = false,
) {
  
  var data = [];
  var remender = 720;
  var schoolStartTime = Moment(schoolHoursFrom, 'hh:mm a').format('hhmm');
  var schoolEndTime = Moment(schoolHoursTo, 'hh:mm a').format('hhmm');
  var clockBlankColor = 'white'; // not in school time
  var clockStartTime = '';
  var clockEndTime = '';

  var durationFromSchoolStart = '';
  var durationFromSchoolEnd = '';

  if (isDualSchool) {
    clockStartTime = meridianValueToCompare == 'pm' ? '1200' : '0';
    clockEndTime = meridianValueToCompare == 'pm' ? '0' : '1159';

    

    durationFromSchoolStart = Helper.convertDiffrenceInTimeToMinutes(
      schoolStartTime,
      clockStartTime,
      meridianValueToCompare,
      meridianValueToCompare,
    );
    durationFromSchoolEnd = Helper.convertDiffrenceInTimeToMinutes(
      schoolEndTime,
      clockEndTime,
      meridianValueToCompare,
      meridianValueToCompare,
    );
    
  } else {
    //DO NOT CHANGE PM
    clockStartTime = meridianValueToCompare == 'pm' ? '0' : '1200';
    clockEndTime = meridianValueToCompare == 'pm' ? '1159' : '1159';
    if (schoolMeridian.toLowerCase() == meridianValueToCompare) {
      durationFromSchoolStart = Helper.convertDiffrenceInTimeToMinutes(
        schoolStartTime,
        clockStartTime,
        meridianValueToCompare,
        meridianValueToCompare,
      );
      durationFromSchoolEnd = Helper.convertDiffrenceInTimeToMinutes(
        clockEndTime,
        schoolEndTime,
        meridianValueToCompare,
        meridianValueToCompare,
      );
      
    } else {
      durationFromSchoolStart = 0;
      durationFromSchoolEnd = 0;
      const fullClock = {
        taskId: '0A',
        color: clockBlankColor,
        value: remender,
        isEmpty: true,
        startPosition: parseInt(clockStartTime),
        startTimeMeridiem: meridianValueToCompare,
        endPosition: parseInt(clockEndTime),
        // endPosition: parseInt(schoolStartTime),
        endTimeMeridiem: meridianValueToCompare,
      };
      data.push(fullClock);
      remender -= remender;
    }
  }
  // also check here  duration is not grater then total duration

  
  //&& schoolStartTime <= 720 remove native value
  if (durationFromSchoolStart > 0) {
    
    const startValue = {
      taskId: '0A0',
      color: clockBlankColor,
      value: durationFromSchoolStart,
      isEmpty: true,
      startPosition: parseInt(clockStartTime),
      startTimeMeridiem: meridianValueToCompare,
      endPosition: parseInt(schoolStartTime),
      endTimeMeridiem: meridianValueToCompare,
    };

    data.push(startValue);
    remender -= durationFromSchoolStart;
    
  }

  // if (durationFromSchoolStart == 0){
  //     if (!arrTask || arrTask.length == 0) {
  //         const endValue = {
  //             taskId: '66S',
  //             color: 'white',
  //             value: remender,
  //             isEmpty: true,
  //             startPosition: parseInt(schoolStartTime),
  //             startTimeMeridiem: meridianValueToCompare,
  //             endPosition: parseInt(schoolEndTime),
  //             endTimeMeridiem: meridianValueToCompare
  //         }
  //         data.push(endValue)
  //         remender = 0
  //     }
  // }

  arrTask.forEach(task => {
    var taskTimeStart = Moment(task.tasks[0].time_from, 'hh:mm A');
    var taskTimeEnd = Moment(task.tasks[0].time_to, 'hh:mm A');
    var schoolTimeStart = Moment(schoolHoursFrom, 'hh:mm A');
    var schollTimeEnd = Moment(schoolHoursTo, 'hh:mm A');
    let isTaskStartBeforeSchoolStart = false;
    let isEndStartAfterSchoolEnd = false;

    // check task is start after or before school time
    if (schoolTimeStart.isAfter(taskTimeStart)) {
      isTaskStartBeforeSchoolStart = true;
    }
    // check task is end after or before school time
    if (taskTimeEnd.isAfter(schollTimeEnd)) {
      isEndStartAfterSchoolEnd = true;
    }

    var endTime = isEndStartAfterSchoolEnd
      ? Moment(schoolHoursTo, 'hh:mm A')
      : Moment(task.tasks[0].time_to, 'hh:mm A');
    var startTime = isTaskStartBeforeSchoolStart
      ? Moment(schoolHoursFrom, 'hh:mm A')
      : Moment(task.tasks[0].time_from, 'hh:mm A');
    var color = task.tasks[0].color;
    var duration = endTime.diff(startTime, 'minutes');

    //here some logic add to remove task time and add in school time

    const dicValue = {
      taskId: task.time,
      color: color,
      value: duration,
      isEmpty: false,
      startPosition: parseInt(
        Moment(task.tasks[0].time_from, 'hhmm').format('hhmm'),
      ),
      startTimeMeridiem: task.tasks[0].start_time_meridiem,
      endPosition: parseInt(
        Moment(task.tasks[0].time_to, 'hhmm').format('hhmm'),
      ),
      endTimeMeridiem: task.tasks[0].end_time_meridiem,
    };

    if (
      meridianValueToCompare == 'pm' &&
      dicValue.startTimeMeridiem.toLowerCase() == 'am'
    ) {
      duration = Helper.convertDiffrenceInTimeToMinutes(
        dicValue.endPosition,
        0,
        meridianValueToCompare,
        dicValue.endTimeMeridiem,
      );
      dicValue.startPosition = 1200;
      dicValue.startTimeMeridiem = meridianValueToCompare;
      dicValue.value = duration;
    }

    //check task is under school time
    let isValidValue = Helper.isCheckTaskValid(
      schoolHoursFrom,
      schoolHoursTo,
      Moment(task.tasks[0].time_to, 'hh:mm A').format('hh:mm A'),
      Moment(task.tasks[0].time_from, 'hh:mm A').format('hh:mm A'),
    );
    if (isValidValue) {
      remender -= duration;
      data.push(dicValue);
    }
  });
  if (durationFromSchoolEnd >= 0) {
    const endValue = {
      taskId: '1B',
      color: clockBlankColor,
      value: durationFromSchoolEnd,
      isEmpty: true,
      startPosition: parseInt(schoolEndTime),
      startTimeMeridiem: meridianValueToCompare,
      endPosition: parseInt(clockEndTime),
      endTimeMeridiem: meridianValueToCompare,
    };
    data.push(endValue);
    remender -= durationFromSchoolEnd;
    
  }
  if (
    durationFromSchoolEnd == 0 &&
    (!arrTask || arrTask.length == 0) &&
    remender > 0
  ) {
    const endValue = {
      taskId: '99L',
      color: 'white',
      value: remender,
      isEmpty: true,
      startPosition: parseInt(schoolStartTime),
      startTimeMeridiem: meridianValueToCompare,
      endPosition: parseInt(schoolEndTime),
      endTimeMeridiem: meridianValueToCompare,
    };
    data.push(endValue);
  }
  // const sortedData = data.sort(Helper.compareValues('startPosition', valueToCompare))
  const fullSortedData = Helper.compareMissingValuesForSchool(
    data,
    meridianValueToCompare,
  );
  return fullSortedData;
}

/* **************************************************************************************************************************** */
/* **************************************************************************************************************************** */
/* **************************************************************************************************************************** */

//#endregion
// check task is valid or not like tast is under school time
export function isCheckTaskValid(
  SchoolstartTime,
  SchoolEndTime,
  taskEnd,
  taskStart,
) {
  

  var isValidValue = false;
  var format = 'hh:mm A';
  var startTimeSchool = Moment(SchoolstartTime, format),
    EndTimeSchool = Moment(SchoolEndTime, format),
    EndTask = Moment(taskEnd, format),
    StartTask = Moment(taskStart, format);
  if (
    startTimeSchool.isSameOrBefore(StartTask) &&
    EndTimeSchool.isSameOrAfter(EndTask)
  ) {
    isValidValue = true;
  } else {
    if (
      startTimeSchool.isBetween(StartTask, EndTask) ||
      EndTimeSchool.isBetween(StartTask, EndTask)
    ) {
      isValidValue = true;
    } else {
      isValidValue = false;
    }
  }
  return isValidValue;
}

export function isNullOrUndefinedOrEmpty(value) {
  return value === null || value === undefined || value === '';
}

// Example usage:
export const checkEmptyValue = (value) => {
  if (isNullOrUndefinedOrEmpty(value)) {
    return true;
  } else {
    return false;
  }
};
