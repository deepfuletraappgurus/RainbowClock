import React, {Component} from 'react';
import {
  Image,
  ImageBackground,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ColorPalette from 'react-native-color-palette';
import DatePicker from '@react-native-community/datetimepicker';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import {Colors, Images, Metrics} from '../Themes';
import BaseComponent from '../Components/BaseComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
// Styles
import styles from './Styles/SetupTimeBlockScreenStyles';
import Api from '../Services/Api';
import Spinner from '../Components/Spinner';
import colors from '../Themes/Colors';

let days = [];

let colours = [
  '#f2c745',
  '#E74C3C',
  '#9B59B6',
  '#2980B9',
  '#3498DB',
  '#1ABC9C',
  '#16A085',
  '#27AE60',
  '#2ECC71',
  '#C0392B',
  '#F39C12',
  '#E67E22',
  '#D35400',
  '#de3038',
  '#BDC3C7',
  '#95A5A6',
  '#7F8C8D',
  '#34495E',
  '#2C3E50',
  '#000000',
  '#47363c',
  '#9ee841',
  '#68869b',
  '#2fdf1d',
  '#79bc79',
  '#a24a75',
  '#627f8b',
  '#42675c',
  '#c777fd',
  '#d601d5',
  '#c048fc',
  '#5a9662',
  '#a5a080',
  '#F1C40F',
  '#c33794',
];

const objSecureAPI = Api.createSecure();

export default class SetupTimeBlockScreen extends BaseComponent {
  static navigationOptions = ({navigation}) => ({
    headerStyle: {
      backgroundColor: Colors.navHeaderLight,
      shadowOpacity: 0,
      shadowOffset: {height: 0},
      elevation: 0,
      height: Metrics.navBarHeight,
      borderBottomWidth: 0,
    },
    headerLeft: () => (
      <TouchableOpacity
        activeOpacity={0.2}
        style={styles.leftIcon}
        onPress={() => {
          navigation.dispatch(navigation.goBack());
        }}>
        <Image
          source={Images.circleArrowLeft}
          style={styles.backButton}
          resizeMode="contain"
        />
      </TouchableOpacity>
    ),
  });
  //constructor
  constructor(props) {
    super(props);

    this.state = {
      showDropdown: false,
      taskName: '',
      selectedTask: '',
      timePicker: false,
      time: new Date(Date.now()),
      toTimePicker: false,
      toTimeDate: new Date(Date.now()),
      fromTime: '',
      toTime: '',
      fromTimeFormate: '',
      toTimeFormate: '',
      isLoading: false,
      toggleColorPicker: false,
      taskSelectedColor: '#f2c745',
      childData: '',
      arrChildTaskTime: [],
      taskNameList: [
        'MORNING ROUTINE',
        'MID MORNING ROUTINE',
        'MIDDAY ROUTINE',
        'AFTERNOON ROUTINE',
        'EVENING ROUTINE',
        'NIGHT TIME',
      ],
      isRepeatEveryday: false,
      arrSelectedDates: [],
      arrSelectedTaskDates: [],
      daySelectionCalender: false,
      calenderSelectedDay: new Date(Date.now()),
      is_date: 1,
      is_school_clock: this.props.navigation.getParam('is_school_clock'),
    };
  }

  componentDidMount() {
    console.log(
      'NNNNNN',
      new Date(Date.now()),
      moment('2024-01-29T21:20:29.321Z').format('DD/MM/YYYY'),
      new Date('2024-01-29T21:20:29.321Z').getDate(),
    );
    super.componentDidMount();
    this.getChildDetail();
    // Helper.checkChoosenTimeIsValidOrNot(this.state.fromTime, (aNewDay, isPastSelectedTime, todayIsSunday) => {
    //     this.state.strMinimumDate = aNewDay
    //     this.state.arrSelectedDates[aNewDay] = { selected: true, marked: true, selectedColor: 'white' }
    //     this.state.arrSelectedTaskDates.push(Helper.dateFormater(aNewDay, 'YYYY-MM-DD', 'Y-M-D'))
    //     // this.state.isPastSelectedTimeSlote = isPastSelectedTime
    //     // this.state.isSunday = todayIsSunday
    //     // this.setState({
    //     //     current: aNewDay
    //     // })
    // })
    var startOfWeek = moment().add(0, 'days');
    var endOfWeek = moment().add(6, 'days');
    var day = startOfWeek;
    days = [];
    while (day <= endOfWeek) {
      if (!days.includes(day)) {
        days.push({
          date: moment(day.toDate()).format('YYYY-MM-DD'),
          selected: false,
        });
        day = day.clone().add(1, 'd');
      }
    }

    this.setState(
      {
        arrSelectedDates: days,
      },
      () => {
        console.log('arrSelectedDates===>', this.state.arrSelectedDates);
      },
    );
  }

  getChildDetail = async () => {
    const child = await AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD);

    const tasks = JSON.parse(child).tasks;
    let arr = [];
    Object.keys(tasks).map(item => {
      if (item != '') {
        const timeSlot = item.split('-');
        arr.push({from: timeSlot[0].trim(), to: timeSlot[1].trim()});
      }
    });
    this.setState({childData: JSON.parse(child), arrChildTaskTime: arr});
  };
  //#region -> Class Methods
  moveToScheduleTask = () => {
    this.setState({isLoading: true});
    console.log('dictCreateTask=====>!', this.state.is_school_clock);
    if (this.checkTimeValidation()) {
      Helper.showErrorMessage(Constants.MESSAGE_CREATE_TASK_TIME_VALIDATION);
      this.setState({isLoading: false});
    } else {
      const task_dates = this.state.arrSelectedDates
        ?.filter(data => data.selected)
        .map(datas => datas.date);
      console.log('===111===', task_dates, this.state.calenderSelectedDay);
      Keyboard.dismiss();
      const formattedDate = moment(this.state.calenderSelectedDay).format(
        'YYYY-MM-DD',
      );
      const resultArray = [formattedDate];
      if (this.isValidate(task_dates)) {
        var dictCreateTask = {
          taskName:
            this.state.taskName === ''
              ? this.state.taskNameList[0]
              : this.state.taskName,
          fromTime: this.state.fromTime,
          toTime: this.state.toTime,
          taskColor: this.state.taskSelectedColor,
          task_date: task_dates?.length === 0 ? resultArray : task_dates,
          is_date: this.state.is_date,
          is_school_clock: this.state.is_school_clock,
        };

        const res = objSecureAPI
          .checkTaskAvaibalilty(
            this.state.fromTime,
            this.state.toTime,
            task_dates?.length === 0 ? resultArray.join() : task_dates.join(),
            this.state.childData?.id,
          )
          .then(resJSON => {
            console.log('✅✅✅---CHECKAVAIL', resJSON);
            if (resJSON.ok && resJSON.status == 200) {
              this.setState({isLoading: false});
              if (resJSON.data.success) {
                console.log('✅✅✅', JSON.stringify(resJSON.data.data[0]));
                try {
                  if (resJSON?.data?.show_popup) {
                    Helper.showConfirmationMessageActions(
                      resJSON.data.message,
                      'No',
                      'Yes',
                      this.onActionNo,
                      () => this.onActionYes(dictCreateTask),
                    );
                  } else {
                    this.props.navigation.navigate('SelectTaskScreen', {
                      dictCreateTask: dictCreateTask,
                    });
                  }
                } catch (error) {
                  console.log('AsyncStorage Error: ', error);
                }
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

        console.log(
          'dictCreateTask=====>!',
          dictCreateTask,
          this.state.fromTimeFormate,
        );
        // this.props.navigation.navigate('ScheduleTaskScreen', { dictCreateTask: dictCreateTask })
      } else {
        this.setState({isLoading: false});
      }
    }
  };

  onActionYes = dictCreateTask => {
    console.log('yes');
    this.setState({isLoading: false});
    this.props.navigation.navigate('SelectTaskScreen', {
      dictCreateTask: dictCreateTask,
    });
  };
  onActionNo = () => {
    console.log('No');
    this.setState({isLoading: false});
  };

  checkTimeValidation = () => {
    const [fromHours, fromMinutes, fromPeriod] =
      this.state.fromTime.split(/[:\s]/);
    const [toHours, toMinutes, toPeriod] = this.state.toTime.split(/[:\s]/);

    let fromHour = parseInt(fromHours, 10);
    let toHour = parseInt(toHours, 10);

    // Adjust hours if it's PM
    if (fromPeriod === 'PM' && fromHour !== 12) {
      fromHour += 12;
    }

    if (toPeriod === 'PM' && toHour !== 12) {
      toHour += 12;
    }

    const fromTimeInMinutes = fromHour * 60 + parseInt(fromMinutes, 10);
    const toTimeInMinutes = toHour * 60 + parseInt(toMinutes, 10);

    // Calculate the difference in minutes
    const timeDifference = Math.abs(toTimeInMinutes - fromTimeInMinutes);

    // Check if the difference is not more than 24 hours or not less than 15 minutes
    if (timeDifference <= 24 * 60 && timeDifference >= 15) {
      return false;
    } else {
      return true;
    }
  };

  checkTimeAvailability = () => {};

  setToggleColorPicker = () => {
    Keyboard.dismiss();
    this.setState({toggleColorPicker: !this.state.toggleColorPicker});
  };

  isValidate = task_dates => {
    if (this.state.taskName == '' && this.state.selectedTask == '+CUSTOM') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_TASK_NAME);
      return false;
    } else if (this.state.fromTime.trim() == '') {
      Helper.showErrorMessage(Constants.MESSAGE_SELECT_FROM_TIME);
      return false;
    } else if (this.state.toTime.trim() == '') {
      Helper.showErrorMessage(Constants.MESSAGE_SELECT_TO_TIME);
      return false;
    } else if (
      moment(this.state.fromTime, 'hh:mm A') >=
      moment(this.state.toTime, 'hh:mm A')
    ) {
      Helper.showErrorMessage(Constants.MESSAGE_FROM_LESSTHAN_TO);
      return false;
      // } else if (!Helper.chooseTime(this.state.arrChildTaskTime, { from: this.state.fromTime, to: this.state.toTime })) {
      //     Helper.showErrorMessage(Constants.MESSAGE_CAN_NOT_CHOOSE_TIME);
      //     return false;
    }
    return true;
  };
  //#endregion
  toggleDropdown() {
    this.setState({showDropdown: !this.state.showDropdown});
  }
  selectTaskName = name => {
    this.setState({
      selectedTask: name,
      taskName: name === '+CUSTOM' ? '' : name,
    });
    this.toggleDropdown();
  };

  clickRepeatTask = () => {
    this.setState({isRepeatEveryday: true});
  };
  renderRow(item, index) {
    return (
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => this.selectTaskName(item)}>
        <Text style={[styles.dropdownItemText]}>{item}</Text>
      </TouchableOpacity>
    );
  }

  renderDays(item, index) {
    let formatDate = moment(item.date).format('dd');
    formatDate = formatDate.slice(0, 1);
    return (
      <TouchableOpacity
        style={[{alignItems: 'center', justifyContent: 'center'}]}
        onPress={() => this.selectedDay(item?.date)}>
        <View
          style={[
            item?.selected ? styles.daySelected : styles.dayUnSelected,
            {width: 25, height: 25},
          ]}>
          {this.state.isRepeatEveryday ? (
            <Image source={Images.tick} style={styles.tickRepeatTask} />
          ) : null}
        </View>
        <Text style={[styles.label, styles.textCenter, {marginTop: 5}]}>
          {formatDate}
        </Text>
      </TouchableOpacity>
    );
  }

  renderColours(item, index) {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: item,
          width: 40,
          height: 40,
          borderRadius: 40,
          marginRight: 15,
          borderColor:
            this.state.taskSelectedColor === item ? colors.BgLateEvening : null,
          borderWidth: this.state.taskSelectedColor === item ? 3 : 0,
        }}
        onPress={() => {
          this.setState({
            taskSelectedColor: item,
            toggleColorPicker: false,
          });
        }}></TouchableOpacity>
    );
  }
  selectedDay = date => {
    this.setState({is_date: 0});
    let temp = this.state.arrSelectedDates.map(obj => {
      if (date === obj.date) {
        return {...obj, selected: !obj.selected};
      }
      return obj;
    });
    this.setState({
      arrSelectedDates: temp,
    });
  };

  showTimePicker() {
    this.setState({timePicker: true, toTimePicker: false});
  }

  onTimeSelected(event, value) {
    if (this.state.is_school_clock) {
      const selectedTime = new Date(value);
      const minTime = new Date();
      minTime.setHours(6, 0, 0, 0); // 6:00 AM

      const maxTime = new Date();
      maxTime.setHours(18, 0, 0, 0);
      if (selectedTime < minTime) {
        // If selected time is before the minimum time, set it to the minimum time
        Alert.alert(
          Constants.APP_NAME,
          Constants.MESSAGE_SCHOOL_DAY_VALIDATION,
        );
      } else if (selectedTime > maxTime) {
        // If selected time is after the maximum time, set it to the maximum time
        Alert.alert(
          Constants.APP_NAME,
          Constants.MESSAGE_SCHOOL_DAY_VALIDATION,
        );
      }
    }
    if (value instanceof Date) {
      // If value is already a Date object, use it directly
      this.setState({
        time: value,
        fromTime: Helper.dateFormater(value, 'hh:mm A', 'hh:mm A').toString(),
        fromTimeFormate: Helper.dateFormater(value, 'hh:mm a', 'A'),
      });
    } else {
      // If value is not a Date object, try converting it to a Date
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        // Check if the conversion was successful
        this.setState({
          time: dateValue,
          fromTime: Helper.dateFormater(
            dateValue,
            'hh:mm A',
            'hh:mm A',
          ).toString(),
          fromTimeFormate: Helper.dateFormater(dateValue, 'hh:mm a', 'A'),
        });
      } else {
        // Handle the case where the conversion fails
        console.error('Invalid date format for toTime:', value);
      }
    }
    if (Platform.OS === 'android') {
      if (event.type === 'set') {
        this.setState({timePicker: false});
      }
    } else {
      if (event.type === 'dismissed') {
        this.setState({timePicker: false});
      }
    }
  }

  showToTimePicker() {
    this.setState({toTimePicker: true, timePicker: false});
    this.state.toTimePicker = true;
  }

  onToTimeSelected(event, value) {
    if (this.state.is_school_clock) {
      const selectedTime = new Date(value);
      const minTime = new Date();
      minTime.setHours(6, 0, 0, 0); // 6:00 AM

      const maxTime = new Date();
      maxTime.setHours(18, 0, 0, 0);
      if (selectedTime < minTime) {
        // If selected time is before the minimum time, set it to the minimum time
        Alert.alert(
          Constants.APP_NAME,
          Constants.MESSAGE_SCHOOL_DAY_VALIDATION,
        );
      } else if (selectedTime > maxTime) {
        // If selected time is after the maximum time, set it to the maximum time
        Alert.alert(
          Constants.APP_NAME,
          Constants.MESSAGE_SCHOOL_DAY_VALIDATION,
        );
      }
    }
    if (value instanceof Date) {
      // If value is already a Date object, use it directly
      this.setState({
        toTimeDate: value,
        toTime: Helper.dateFormater(value, 'hh:mm A', 'hh:mm A').toString(),
        toTimeFormate: Helper.dateFormater(value, 'hh:mm a', 'A'),
      });
    } else {
      // If value is not a Date object, try converting it to a Date
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        // Check if the conversion was successful
        this.setState({
          toTimeDate: dateValue,
          toTime: Helper.dateFormater(
            dateValue,
            'hh:mm A',
            'hh:mm A',
          ).toString(),
          toTimeFormate: Helper.dateFormater(dateValue, 'hh:mm a', 'A'),
        });
      } else {
        // Handle the case where the conversion fails
        console.error('Invalid date format for toTime:', value);
      }
    }

    console.log('aaaa', event.type);
    if (Platform.OS === 'android') {
      if (event.type === 'set') {
        this.setState({toTimePicker: false});
      }
    } else {
      if (event.type === 'dismissed') {
        this.setState({toTimePicker: false});
      }
    }
  }

  onDaySelectationCalenderPress() {
    console.log('``````');
    this.setState({daySelectionCalender: !this.state.daySelectionCalender});
  }

  daySelectionCalenderPicker(event, value) {
    console.log('------', event.type, value);
    this.handleResetSelection();

    if (Platform.OS === 'android') {
      if (event.type === 'set') {
        if (value instanceof Date) {
          // If value is already a Date object, use it directly
          this.setState({
            calenderSelectedDay: value,
          });
        } else {
          // If value is not a Date object, try converting it to a Date
          const dateValue = new Date(value);
          if (!isNaN(dateValue.getTime())) {
            // Check if the conversion was successful
            this.setState({
              calenderSelectedDay: dateValue,
            });
          } else {
            // Handle the case where the conversion fails
            console.error('Invalid date format for toTime:', value);
          }
        }
        this.setState({daySelectionCalender: false});
      } else {
        this.setState({daySelectionCalender: false});
      }
    } else {
      if (value instanceof Date) {
        // If value is already a Date object, use it directly
        this.setState({
          calenderSelectedDay: value,
        });
      } else {
        // If value is not a Date object, try converting it to a Date
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime())) {
          // Check if the conversion was successful
          this.setState({
            calenderSelectedDay: dateValue,
          });
        } else {
          // Handle the case where the conversion fails
          console.error('Invalid date format for toTime:', value);
        }
      }
    }
  }

  handleResetSelection = () => {
    const resetDates = this.state.arrSelectedDates.map(dateObj => ({
      ...dateObj,
      selected: false,
    }));
    this.setState({arrSelectedDates: resetDates});
    this.setState({is_date: 1});
  };

  //#region -> View Render
  render() {
    const selectedDays = this.state.arrSelectedDates
      .filter(dateObj => dateObj.selected)
      .map(dateObj => moment(dateObj.date).format('ddd'));

    const allSelected = this.state.arrSelectedDates.every(
      dateObj => dateObj.selected,
    );
    return (
      <View style={styles.mainContainer}>
        <KeyboardAvoidingView
          style={styles.mainContainer}
          behavior={Helper.isIPhoneX() ? 'padding' : null}>
          <ImageBackground
            source={Images.blueBackground}
            style={styles.backgroundImage}>
            <ScrollView contentContainerStyle={styles.ScrollView}>
              <View style={[styles.container, styles.justifySpaceBetween]}>
                <View style={styles.topHeader}>
                  <Text style={[styles.h1, styles.textCenter]}>
                    {'SETUP TIME BLOCK'.toUpperCase()}
                  </Text>
                </View>
                <View
                  style={{
                    flexGrow: 1,
                    flexDirection: 'column-reverse',
                    width: '100%',
                  }}>
                  <View
                    style={[
                      styles.justifyFooter,
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                      },
                    ]}>
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={() => this.props.navigation.goBack()}>
                      <Image
                        source={Images.circleArrowLeft}
                        style={styles.circleArrow}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={() => this.moveToScheduleTask()}>
                      {this.state.isLoading ? (
                        <View
                          style={{
                            backgroundColor: colors.yellow,
                            borderRadius: 55,
                            width: 55,
                            height: 55,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <ActivityIndicator
                            color={colors.white}
                            size={30}
                            style={{zIndex: 1000}}
                          />
                        </View>
                      ) : (
                        <Image
                          source={Images.circleArrowRight}
                          style={styles.circleArrow}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.form, {flexGrow: 1}]}>
                    <View
                      style={[
                        styles.formControl,
                        {zIndex: 999, marginBottom: 25},
                      ]}>
                      {/* <TextInput
                                                style={styles.input}
                                                autoCapitalize='characters'
                                                value={this.state.taskName.toUpperCase()}
                                                placeholder={'Name'.toUpperCase()}
                                                underlineColorAndroid={'transparent'}
                                                placeholderTextColor={'#fff'}
                                                returnKeyType={'done'}
                                                onChangeText={(taskName) => this.setState({ taskName })}
                                                onSubmitEditing={(event) => { Keyboard.dismiss(); }}
                                            /> */}
                      {!this.state.is_school_clock && (
                        <View
                          style={[
                            styles.dropdownContainer,
                            {justifyContent: 'center', zIndex: 999},
                          ]}>
                          <TouchableOpacity
                            style={[
                              styles.dropdownButton,
                              styles.dropdownButtonLarge,
                              this.state.showDropdown
                                ? styles.bottomRadiusNull
                                : null,
                            ]}
                            onPress={() => this.toggleDropdown()}>
                            <Text
                              style={[
                                styles.dropdownButtonText,
                                styles.dropdownLargeButtonText,
                              ]}>
                              {this.state.selectedTask == ''
                                ? this.state.taskNameList[0]
                                : this.state.selectedTask}
                            </Text>
                            <Image
                              source={Images.downarrow}
                              style={styles.downarrow}
                            />
                          </TouchableOpacity>
                          {this.state.showDropdown ? (
                            <View
                              style={[styles.dropdown, styles.dropdownLarge]}>
                              <FlatList
                                keyboardShouldPersistTaps={'always'}
                                data={this.state.taskNameList}
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
                      )}
                    </View>
                    {this.state.selectedTask === '+CUSTOM' ? (
                      <View style={[styles.formControl]}>
                        <TextInput
                          style={styles.input}
                          autoCapitalize="characters"
                          value={this.state.taskName.toUpperCase()}
                          placeholder={'Name'.toUpperCase()}
                          underlineColorAndroid={'transparent'}
                          placeholderTextColor={'#fff'}
                          returnKeyType={'done'}
                          onChangeText={taskName => this.setState({taskName})}
                          onSubmitEditing={event => {
                            Keyboard.dismiss();
                          }}
                        />
                      </View>
                    ) : null}

                    <View style={[styles.frm, {marginTop: 0}]}>
                      <Text style={styles.label}>{'TIME'.toUpperCase()}</Text>
                      <View style={styles.frmRow}>
                        <View style={styles.frmInline}>
                          <Text
                            style={{
                              color: Colors.titleColor,
                              paddingTop: 10,
                              width: '100%',
                              paddingHorizontal: 10,
                              borderRadius: 5,
                              height: 40,
                              position: 'absolute',
                              paddingHorizontal: 10,
                              backgroundColor: '#fff',
                            }}>
                            {this.state.fromTime}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              this.showTimePicker();
                            }}
                            style={{
                              width: '100%',
                              height: 40,
                            }}></TouchableOpacity>
                        </View>
                        <Text style={styles.coloun}>-</Text>
                        <View style={styles.frmInline}>
                          <Text
                            style={{
                              color: Colors.titleColor,
                              paddingTop: 10,
                              width: '100%',
                              paddingHorizontal: 10,
                              borderRadius: 5,
                              height: 40,
                              position: 'absolute',
                              paddingHorizontal: 10,
                              backgroundColor: '#fff',
                            }}>
                            {this.state.toTime}
                          </Text>
                          <TouchableOpacity
                            style={[{width: '100%', height: 40}]}
                            // <TouchableOpacity style={[styles.inputView, {paddingHorizontal:0, overflow:'hidden'}]}
                            onPress={() => {
                              this.showToTimePicker();
                            }}></TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.frm, {marginBottom: 10}]}>
                      <View style={[styles.frmRow, styles.frmRowMinus]}>
                        {this.state.timePicker && (
                          <DatePicker
                            value={this.state.time}
                            placeholder={'HH:mm'}
                            mode={'time'}
                            display={
                              Platform.OS === 'ios' ? 'spinner' : 'default'
                            }
                            is24Hour={false}
                            style={{width: '100%', height: '100%'}}
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            showIcon={false}
                            // onChange={(event,data) => { this.setState({timePicker: true},()=> {
                            //     this.onTimeSelected(event,data)
                            //     console.log('onChangeForTime', this.state.time)
                            // })}}
                            onChange={(event, value) => {
                              this.onTimeSelected(event, value);
                              console.log('onChangeForTime', this.state.time);
                            }}
                            customStyles={{
                              dateInput: {
                                marginLeft: 0,
                                borderWidth: 0,
                                width: '100%',
                                alignItems: 'flex-start',
                                paddingLeft: 10,
                              },
                              btnTextConfirm: {
                                color: 'gray',
                              },
                              dateText: {
                                color: Colors.titleColor,
                              },
                            }}
                          />
                        )}
                        {this.state.toTimePicker && (
                          <DatePicker
                            value={this.state.toTimeDate}
                            placeholder={'HH:mm'}
                            mode={'time'}
                            display={
                              Platform.OS === 'ios' ? 'spinner' : 'default'
                            }
                            is24Hour={false}
                            style={{width: '100%', height: '100%'}}
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            showIcon={false}
                            onChange={(event, data) => {
                              this.onToTimeSelected(event, data);
                              console.log(
                                'onChangeForTime',
                                this.state.toTimeDate,
                              );
                            }}
                            customStyles={{
                              dateInput: {
                                marginLeft: 0,
                                borderWidth: 0,
                                width: '100%',
                                alignItems: 'flex-start',
                                paddingLeft: 10,
                              },
                              btnTextConfirm: {
                                color: 'gray',
                              },
                              dateText: {
                                color: Colors.titleColor,
                              },
                            }}
                          />
                        )}
                      </View>
                    </View>

                    <View
                      style={{
                        marginTop: 0,
                        paddingTop: 25,
                        borderTopColor: Colors.snow,
                        borderTopWidth: 0.5,
                        width: '100%',
                        // justifyContent: 'center',
                        // alignItems: 'center',
                      }}>
                      <Text style={[styles.label, {textAlign: 'left'}]}>
                        {'Select day/s below if you would like this time block to repeat.'.toUpperCase()}
                      </Text>
                      <View
                        style={{
                          alignSelf: 'flex-start',
                          // marginHorizontal: 15,
                          width: '100%',
                          flex: 1,
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <>
                          {allSelected ? (
                            <Text style={[styles.label, {marginBottom: 0}]}>
                              Every day of the week.
                            </Text>
                          ) : selectedDays.length > 0 ? (
                            <Text
                              style={[
                                styles.label,
                                {marginBottom: 0},
                              ]}>{`Every ${selectedDays.join(',')}`}</Text>
                          ) : (
                            <Text
                              style={[
                                styles.label,
                                {marginBottom: 0},
                              ]}>{`On ${moment(
                              this.state.calenderSelectedDay,
                            ).format('DD MMM YYYY')} - ${moment(
                              this.state.calenderSelectedDay,
                            ).format('dddd')}`}</Text>
                          )}
                        </>
                        <TouchableOpacity
                          onPress={() => this.onDaySelectationCalenderPress()}>
                          <Image
                            source={
                              this.state.daySelectionCalender
                                ? Images.tick
                                : Images.navIcon3
                            }
                            style={[styles.bell, {resizeMode: 'contain'}]}
                          />
                        </TouchableOpacity>
                      </View>
                      {this.state.daySelectionCalender && (
                        <DatePicker
                          value={this.state.calenderSelectedDay}
                          placeholder={'HH:mm'}
                          mode={'date'}
                          display={
                            Platform.OS === 'ios' ? 'spinner' : 'default'
                          }
                          // style={{width: '100%', height: '100%'}}
                          confirmBtnText="Confirm"
                          cancelBtnText="Cancel"
                          showIcon={false}
                          onChange={(event, data) => {
                            this.daySelectionCalenderPicker(event, data);
                            console.log(
                              'onChangeForTime--',
                              this.state.calenderSelectedDay,
                            );
                          }}
                          customStyles={{
                            dateInput: {
                              marginLeft: 0,
                              borderWidth: 0,
                              width: '100%',
                              alignItems: 'flex-start',
                              paddingLeft: 10,
                            },
                            btnTextConfirm: {
                              color: 'gray',
                            },
                            dateText: {
                              color: Colors.titleColor,
                            },
                          }}
                        />
                      )}

                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          flex: 1,
                        }}>
                        <FlatList
                          data={this.state.arrSelectedDates}
                          extraData={this.state}
                          keyExtractor={(item, index) => index}
                          renderItem={({item, index}) =>
                            this.renderDays(item, index)
                          }
                          horizontal={true}
                          contentContainerStyle={{
                            flex: 1,
                            justifyContent: 'space-between',
                            marginTop: 10,
                          }}
                        />
                      </View>

                      <View
                        style={{
                          alignSelf: 'flex-start',
                          // marginHorizontal: 15,
                          width: '100%',
                          flex: 1,
                          justifyContent: 'space-between',
                          borderTopColor: Colors.snow,
                          borderTopWidth: 0.5,
                          paddingVertical: 15,
                          marginVertical: 15,
                          paddingTop: 25,
                        }}>
                        <Text style={[styles.label, {textAlign: 'left'}]}>
                          {'Colours'.toUpperCase()}
                        </Text>

                        <FlatList
                          data={colours}
                          extraData={this.state}
                          keyExtractor={(item, index) => index}
                          renderItem={({item, index}) =>
                            this.renderColours(item, index)
                          }
                          horizontal={true}
                          showsHorizontalScrollIndicator={false}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </ImageBackground>
        </KeyboardAvoidingView>
      </View>
    );
  }
}
