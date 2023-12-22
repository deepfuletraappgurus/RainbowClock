import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from '../Components/Spinner';
import React, {Component, useState} from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from '@react-native-community/datetimepicker';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import {Colors, Images, Metrics} from '../Themes';
// Styles
import styles from './Styles/SchoolHoursScreenStyles';
import BaseComponent from '../Components/BaseComponent';
import moment from 'moment';
import {Positions} from 'react-native-calendars/src/expandableCalendar';

// Global Variables
const objSecureAPI = Api.createSecure();

export default class SchoolHoursScreen extends BaseComponent {
  builder() {
    this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
  }

  forceUpdateHandler() {
    this.forceUpdate();
  }

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

  // const [datePicker, setDatePicker] = useState(false);

  // const [date, setDate] = useState(new Date());
  //constructor
  constructor(props) {
    super(props);
    this.state = {
      timePicker: false,
      time: new Date(Date.now()),
      toTimePicker: false,
      toTimeDate: new Date(Date.now()),
      objSelectedChild: [],
      schoolHours: JSON.parse(Constants.WEEK_DAYS),
      username: '',
      profilePic: '',
      image: '',
      isLoading: false,
      fromTime: '',
      toTime: '',
      fromTimeFormate: '',
      toTimeFormate: '',
    };
  }
  showTimePicker() {
    this.setState({timePicker: true});
    // this.state.timePicker = true ;
  }
  onTimeSelected(event, value) {
    const selectedTime = new Date(value);
    const minTime = new Date();
    minTime.setHours(6, 0, 0, 0); // 6:00 AM

    const maxTime = new Date();
    maxTime.setHours(18, 0, 0, 0); // 6:00 PM

    if (selectedTime < minTime) {
      // If selected time is before the minimum time, set it to the minimum time
      Alert.alert(Constants.APP_NAME, Constants.MESSAGE_SCHOOL_DAY_VALIDATION);
    } else if (selectedTime > maxTime) {
      // If selected time is after the maximum time, set it to the maximum time
      Alert.alert(Constants.APP_NAME, Constants.MESSAGE_SCHOOL_DAY_VALIDATION);
    } else {
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
  }

  showToTimePicker() {
    this.setState({toTimePicker: true});
  }

  onToTimeSelected(event, value) {
    const selectedTime = new Date(value);
    const minTime = new Date();
    minTime.setHours(6, 0, 0, 0); // 6:00 AM

    const maxTime = new Date();
    maxTime.setHours(18, 0, 0, 0); // 6:00 PM

    if (selectedTime < minTime) {
      // If selected time is before the minimum time, set it to the minimum time
      Alert.alert(Constants.APP_NAME, Constants.MESSAGE_SCHOOL_DAY_VALIDATION);
    } else if (selectedTime > maxTime) {
      // If selected time is after the maximum time, set it to the maximum time
      Alert.alert(Constants.APP_NAME, Constants.MESSAGE_SCHOOL_DAY_VALIDATION);
    } else {
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
  }

  isTimeDisabled = (hour, minute) => {
    // Define the valid time range (6:00 AM to 6:00 PM)
    const minTime = 6 * 60; // 6:00 AM in minutes
    const maxTime = 18 * 60; // 6:00 PM in minutes

    // Convert selected time to minutes
    const selectedTime = hour * 60 + minute;

    // Disable times outside the valid range
    return selectedTime < minTime || selectedTime > maxTime;
  };
  //#region -> Component Methods

  componentDidMount() {
    super.componentDidMount();
    this.getChildDetail();
  }

  getChildDetail = () => {
    AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
      if (child != '') {
        this.setState({objSelectedChild: JSON.parse(child)});
        // this.setState({ fromTime: JSON.parse(child).school_hours.MON.FROM });
        // this.setState({ toTime: JSON.parse(child).school_hours.MON.TO });
        // console.log(JSON.parse(child).school_hours.MON.FROM)
        this.getSchoolHours();
      }
    });
  };

  getSchoolHours = () => {
    // var value
    // for (var key in this.state.objSelectedChild.school_hours) {
    //     value = this.state.objSelectedChild.school_hours[key];
    // }
  };
  //#endregion

  //#region -> Class Methods

  changeFromDate = date => {
    this.state.time = Helper.dateFormater(date, 'hh:mm A', 'hh:mm A');
    this.state.fromTimeFormate = Helper.dateFormater(date, 'hh:mm a', 'A');
    console.log(
      'changeFromDate',
      this.state.fromTime,
      ' formate ',
      this.state.fromTimeFormate,
    );
  };

  changeToDate = date => {
    this.state.toTime = Helper.dateFormater(date, 'hh:mm A', 'hh:mm A');
    this.state.toTimeFormate = Helper.dateFormater(date, 'hh:mm a', 'A');
    this.setState({});
  };

  onPressDayChange = day => {
    console.log(
      'onPressDayChange',
      this.state.fromTime,
      ' ',
      this.state.toTime,
      ' ',
      day,
    );

    if (this.state.fromTime && this.state.toTime) {
      console.log(
        'onPressDayChange1',
        this.state.fromTime,
        ' ',
        this.state.toTime,
        ' ',
        day,
      );
      // this.state.objSelectedChild.school_hours[day].FROM = this.state.fromTime + ' ' + this.state.fromTimeFormate
      // this.state.objSelectedChild.school_hours[day].TO = this.state.toTime + ' ' + this.state.toTimeFormate

      if (this.state.objSelectedChild.school_hours[day]) {
        console.log(
          'onPressDayChange2',
          this.state.fromTime,
          ' ',
          this.state.toTime,
          ' ',
          day,
        );
        // this.state.fromTime = this.state.objSelectedChild.school_hours[day].FROM.split(' ')[0]
        //   this.state.  fromTimeFormate = this.state.objSelectedChild.school_hours[day].FROM.split(' ')[1]
        console.log(
          'onPressDayChange3',
          this.state.fromTime,
          ' ',
          this.state.toTime,
          ' ',
          day,
        );
        if (this.state.schoolHours[day].isSelected) {
          console.log(
            'onPressDayChange4',
            this.state.fromTime,
            ' ',
            this.state.toTime,
            ' ',
            day,
          );
          this.state.schoolHours[day].isSelected = false;
        } else {
          console.log(
            'onPressDayChange5',
            this.state.fromTime,
            ' ',
            this.state.toTime,
            ' ',
            day,
          );
          this.state.schoolHours[day].FROM = this.state.fromTime;
          this.state.schoolHours[day].TO = this.state.toTime;
          this.state.schoolHours[day].isSelected = true;

          console.log(
            'onPressDayChange6',
            this.state.fromTime,
            ' ',
            this.state.toTime,
            ' ',
            day,
          );
        }
      } else {
        //this.state.fromTime
        console.log(
          'onPressDayChange7',
          this.state.fromTime,
          ' ',
          this.state.toTime,
          ' ',
          day,
        );
        this.state.schoolHours[day].FROM = this.state.fromTime;
        this.state.schoolHours[day].TO = this.state.toTime;
        this.state.schoolHours[day].isSelected = true;
        console.log(
          'onPressDayChange8',
          this.state.fromTime,
          ' ',
          this.state.toTime,
          ' ',
          day,
        );
      }
      console.log('onPressDayChange9', this.state.schoolHours[day].isSelected);
    } else {
      Helper.showErrorMessage(Constants.MESSAGE_SELECT_BOTH_TIME);
    }
    this.forceUpdateHandler();
  };

  onPressSave = () => {
    var tempSchoolDays = {};
    for (var key in this.state.schoolHours) {
      if (
        this.state.schoolHours[key].isSelected &&
        this.state.schoolHours[key].isSelected == true
      ) {
        tempSchoolDays[key] = this.state.schoolHours[key];
        delete tempSchoolDays[key].isSelected;
      }
    }
    if (tempSchoolDays) {
      this.callUpdateSchoolHours(tempSchoolDays);
    } else {
      Helper.showErrorMessage(Constants.MESSAGE_SELECT_DAY_SH);
    }
  };
  //#endregion

  //#endregion -> API Calls
  callUpdateSchoolHours = tempSchoolDays => {
    this.setState({isLoading: true});
    var child = this.state.objSelectedChild;
    const res = objSecureAPI
      .doUpdateShoolHours(child.id, JSON.stringify(tempSchoolDays))
      .then(resJSON => {
        console.log('✅✅✅', resJSON);
        if (resJSON.ok && resJSON.status == 200) {
          this.setState({isLoading: false});
          if (resJSON.data.success) {
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
  //#endregion

  //#region -> View Render

  render() {
    return (
      <View style={styles.mainContainer}>
        <ImageBackground
          source={Images.blueBackground}
          style={styles.backgroundImage}>
          <ScrollView contentContainerStyle={styles.ScrollView}>
            <View style={[styles.container]}>
              <View style={styles.topHeader}>
                <Text style={[styles.h1, styles.textCenter]}>
                  {'School Hours'.toUpperCase()}
                </Text>
              </View>
              <View style={styles.imageUploader}>
                <View style={[styles.uploadView, styles.uploadViewCircle]}>
                  {this.state.profilePic ? (
                    <Image
                      source={{uri: this.state.profilePic}}
                      style={styles.uploadedImage}
                    />
                  ) : (
                    <Image
                      source={
                        this.state.objSelectedChild &&
                        (this.state.objSelectedChild.profile_pic
                          ? {uri: this.state.objSelectedChild.profile_pic}
                          : Images.userPlaceholder)
                      }
                      style={styles.uploadedImage}
                    />
                  )}
                </View>
              </View>
              <View style={styles.form}>
                <View style={styles.frm}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifycontent: 'space-evenly',
                    }}>
                    <Text style={[styles.label, {width: '50%'}]}>{'FROM'}</Text>
                    <Text style={[styles.label, {width: '50%'}]}>{'TO'}</Text>
                  </View>
                  <View style={styles.frmRow}>
                    <View style={styles.frmInline} customStyles={{}}>
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
                        showSoftInputOnFocus={false}
                        onPress={() => {
                          Keyboard.dismiss;
                          this.showTimePicker();
                        }}
                        style={{width: '100%', height: 40}}>
                        {/* {this.state.timePicker && (
                                               <DatePicker
                                                value={this.state.time}
                                                placeholder={'HH:mm'}
                                                mode={'time'}
                                                display={'default'}
                                                is24Hour={false}
                                                    style={{ width: '100%', height: '100%'}}
                                                    confirmBtnText="Confirm"
                                                    cancelBtnText="Cancel"
                                                    showIcon={false}
                                                    onChange={(event,data) => { this.setState({timePicker: false},()=> {
                                                        this.onTimeSelected(event,data)
                                                        console.log('onChangeForTime', this.state.time)
                                                    })}}
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
                                                        }
                                                    }}
                                                />)} */}
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.coloun}>:</Text>

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
                        showSoftInputOnFocus={false}
                        onPress={() => {
                          Keyboard.dismiss;
                          this.showToTimePicker();
                          // this.setState({toTimePicker:true})
                        }}
                        style={{width: '100%', height: 40}}>
                        {/* {this.state.toTimePicker && (
                                               <DatePicker
                                                value={this.state.toTimeDate}
                                                placeholder={'HH:mm'}
                                                mode={'time'}
                                                display={'default'}
                                                is24Hour={false}
                                                    style={{ width: '100%', height: '100%'}}
                                                    confirmBtnText="Confirm"
                                                    cancelBtnText="Cancel"
                                                    showIcon={false}
                                                    onChange={(event,data) => { this.setState({ToTimePicker: false},()=> {
                                                        this.onToTimeSelected(event,data)
                                                        console.log('onChangeForTime', this.state.toTimeDate)
                                                    })}}
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
                                                        }
                                                    }}
                                                />)} */}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={styles.frm}>
                  <View style={[styles.frmRow, styles.frmRowMinus]}>
                    {this.state.timePicker && (
                      <DatePicker
                        value={this.state.time}
                        placeholder={'HH:mm'}
                        mode={'time'}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
                          disabled: {
                            backgroundColor: 'lightgray', // Change the background color for disabled times
                          },
                        }}
                        minDate={new Date(0, 0, 0, 6, 0)} // Minimum time: 6:00 AM
                        maxDate={new Date(0, 0, 0, 18, 0)}
                      />
                    )}
                    {this.state.toTimePicker && (
                      <DatePicker
                        value={this.state.toTimeDate}
                        placeholder={'HH:mm'}
                        mode={'time'}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        is24Hour={false}
                        style={{width: '100%', height: '100%'}}
                        confirmBtnText="Confirm"
                        cancelBtnText="Cancel"
                        showIcon={false}
                        onChange={(event, data) => {
                          this.setState({ToTimePicker: false}, () => {
                            this.onToTimeSelected(event, data);
                            console.log(
                              'onChangeForTime',
                              this.state.toTimeDate,
                            );
                          });
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
                          disabled: {
                            backgroundColor: 'lightgray', // Change the background color for disabled times
                          },
                        }}
                        minDate={new Date(0, 0, 0, 6, 0)} // Minimum time: 6:00 AM
                        maxDate={new Date(0, 0, 0, 18, 0)}
                      />
                    )}
                  </View>
                </View>
                <View style={styles.frm}>
                  <View style={[styles.frmRow, styles.frmRowMinus]}>
                    {this.renderDay('MON')}
                    {this.renderDay('TUE')}
                    {this.renderDay('WED')}
                    {this.renderDay('THU')}
                    {this.renderDay('FRI')}
                  </View>
                </View>
              </View>
              <View style={styles.justifyFooter}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={() => this.onPressSave()}>
                  {this.state.isLoading ? (
                    <Spinner color={'#FFFFFF'} size={'small'} />
                  ) : (
                    <Text style={styles.buttonText}>
                      {'Save'.toUpperCase()}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    );
  }

  renderDay(day) {
    if (this.state.schoolHours[day].isSelected) {
      return (
        <View style={styles.frmInner}>
          <TouchableOpacity
            style={styles.daySelected}
            onPress={() => this.onPressDayChange(day)}>
            {this.state.schoolHours[day].isSelected ? (
              <Image source={Images.tick} style={styles.tick} />
            ) : null}
          </TouchableOpacity>
          <Text
            style={[styles.label, styles.textCenter, styles.topSmallMargin]}>
            {day}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.frmInner}>
          <TouchableOpacity
            style={styles.dayUnSelected}
            onPress={() => this.onPressDayChange(day)}>
            {this.state.schoolHours[day].isSelected ? (
              <Image source={Images.tick} style={styles.tick} />
            ) : null}
          </TouchableOpacity>
          <Text
            style={[styles.label, styles.textCenter, styles.topSmallMargin]}>
            {day}
          </Text>
        </View>
      );
    }
  }
  //#endregion
}
