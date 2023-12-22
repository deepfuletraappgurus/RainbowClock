import React, { Component } from 'react';
import { Image, ImageBackground,FlatList, Keyboard, KeyboardAvoidingView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ColorPalette from 'react-native-color-palette';
import DatePicker from '@react-native-community/datetimepicker';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import { Colors, Images, Metrics } from '../Themes';
import BaseComponent from '../Components/BaseComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment'
// Styles
import styles from './Styles/SetupTimeBlockScreenStyles';

let days = [];

export default class SetupTimeBlockScreen extends BaseComponent {

    static navigationOptions = ({ navigation }) => ({
        headerStyle: {
            backgroundColor: Colors.navHeaderLight,
            shadowOpacity: 0,
            shadowOffset: { height: 0, },
            elevation: 0,
            height: Metrics.navBarHeight,
            borderBottomWidth: 0,
        },
        headerLeft:() => (<TouchableOpacity
        activeOpacity={0.2}
        style={styles.leftIcon}
        onPress={() => {
          navigation.dispatch(navigation.goBack());
        }}>
        <Image source={Images.circleArrowLeft} style={styles.backButton} resizeMode="contain" />
      </TouchableOpacity>)
    });
    //constructor 
    constructor(props) {
        super(props)
        this.state = {
            showDropdown: false,
            taskName: '',
            selectedTask: '',
            timePicker:false,
            time:new Date(Date.now()),
            toTimePicker:false,
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
            taskNameList : [
                'MORNING ROUTINE',
                'MID MORNING ROUTINE',
                'MIDDAY ROUTINE',
                'AFTERNOON ROUTINE',
                'EVENING ROUTINE',
                'NIGHT TIME',
                'SCHOOL',
                '+CREATE YOUR OWN'
            ],
            isRepeatEveryday: false,
            arrSelectedDates: [],
            arrSelectedTaskDates: [],
        }
    }
    
    componentDidMount(){
        super.componentDidMount()
        this.getChildDetail()
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
            if(!days.includes(day)){
                days.push({date: moment(day.toDate()).format('YYYY-MM-DD'), selected: false});
                day = day.clone().add(1, 'd');
            }
        }
     
        this.setState({
            arrSelectedDates: days
        },()=> {
            console.log("arrSelectedDates===>",this.state.arrSelectedDates);
        })
    }
    

    getChildDetail = async () => {
        const child = await AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD)

        const tasks = JSON.parse(child).tasks
        let arr = []
        Object.keys(tasks).map((item) => {
            if (item != '') {
                const timeSlot = item.split('-')
                arr.push({ from: timeSlot[0].trim(), to: timeSlot[1].trim() })
            }
        })
        this.setState({ childData: JSON.parse(child), arrChildTaskTime: arr })

    }
    //#region -> Class Methods
    moveToScheduleTask = () => {
        const task_dates = this.state.arrSelectedDates?.filter(data => data.selected).map((datas => datas.date));
        Keyboard.dismiss();
        if (this.isValidate(task_dates)) {
            var dictCreateTask = {
                'taskName': this.state.taskName === '' ? this.state.taskNameList[0] : this.state.taskName,
                'fromTime': this.state.fromTime,
                'toTime': this.state.toTime,
                'taskColor': this.state.taskSelectedColor,
                'task_date':task_dates
            }
            console.log('dictCreateTask=====>', dictCreateTask)
            // this.props.navigation.navigate('ScheduleTaskScreen', { dictCreateTask: dictCreateTask })
            this.props.navigation.navigate('SelectTaskScreen', { dictCreateTask: dictCreateTask })
        }
    }

    setToggleColorPicker = () => {
        Keyboard.dismiss();
        this.setState({ toggleColorPicker: !this.state.toggleColorPicker })
    }

    isValidate = (task_dates) => {
        if (this.state.taskName == '' &&  this.state.selectedTask == '+CREATE YOUR OWN') {
            Helper.showErrorMessage(Constants.MESSAGE_NO_TASK_NAME);
            return false;
        }
        else if (this.state.fromTime.trim() == '') {
            Helper.showErrorMessage(Constants.MESSAGE_SELECT_FROM_TIME);
            return false;
        }
        else if (this.state.toTime.trim() == '') {
            Helper.showErrorMessage(Constants.MESSAGE_SELECT_TO_TIME);
            return false;
        } else if (moment(this.state.fromTime, 'hh:mm A') >= moment(this.state.toTime, 'hh:mm A')) {
            Helper.showErrorMessage(Constants.MESSAGE_FROM_LESSTHAN_TO);
            return false;
        // } else if (!Helper.chooseTime(this.state.arrChildTaskTime, { from: this.state.fromTime, to: this.state.toTime })) {
        //     Helper.showErrorMessage(Constants.MESSAGE_CAN_NOT_CHOOSE_TIME);
        //     return false;
        } else if (task_dates?.length === 0) {
            Helper.showErrorMessage(Constants.MESSAGE_NO_DAY_SELECT_SCHEDULE);
            return false;
        }
        return true;
    }
    //#endregion
    toggleDropdown() {
        this.setState({ showDropdown: !this.state.showDropdown });
    }
    selectTaskName = (name) => {
        this.setState({ selectedTask: name,taskName : name === '+CREATE YOUR OWN' ? '' : name })
        this.toggleDropdown()
    }

    clickRepeatTask = () => {
        this.setState({isRepeatEveryday : true})
    }
    renderRow(item, index) {
        return (
            <TouchableOpacity style={styles.dropdownItem} onPress={() => this.selectTaskName(item)}>
                <Text style={[styles.dropdownItemText]}>{item}</Text>
            </TouchableOpacity>
        )
    }


    renderDays(item, index){
        let formatDate = moment(item.date).format('dd');
        formatDate = formatDate.slice(0, 1);
        return (
        <TouchableOpacity style={[{ alignItems: 'center',justifyContent:'center'}]} onPress={() => this.selectedDay(item?.date)}>
                                        <View style={[item?.selected ? styles.daySelected :
                                            styles.dayUnSelected, { marginHorizontal: 10,  width:20,
                                                height:20 }]} >
                                            {this.state.isRepeatEveryday ?
                                                <Image source={Images.tick} style={styles.tickRepeatTask} /> : null
                                            }
                                        </View>
                                        <Text style={[styles.label, styles.textCenter, { marginTop: 5 }]}>
                                          {formatDate}</Text>
                                    </TouchableOpacity>
        )
    }
    selectedDay = (date) => {

        let temp = this.state.arrSelectedDates.map((obj) => {
            if (date === obj.date) {
              return { ...obj, selected: !obj.selected };
            }
            return obj;
          });
          this.setState({
            arrSelectedDates: temp,
          });
    }

       showTimePicker() {
        this.setState({timePicker: true})
       };

       onTimeSelected(event, value) {
        this.state.time = value;
      // this.setState({timePicker: false})

      this.state.time = Helper.dateFormater(
        new Date(value),
        'hh:mm A',
        'hh:mm A',
      );
      this.state.fromTimeFormate = Helper.dateFormater(
        new Date(value),
        'hh:mm a',
        'A',
      );
      //this.changeFromDate(value)
      console.log('From/onTimeSelected===', this.state.time);
      this.setState({fromTime: this.state.time.toString()});
      // console.log('changeFromDateJS', this.state.time.toString())
      // this.setState({time:new Date(Date.now())})
      this.setState({time: value});
      if (event.type == 'dismissed') {
        this.setState({timePicker: false});
      }
       };

       showToTimePicker() {
         this.setState({toTimePicker: true})
         this.state.toTimePicker = true;
       };

       onToTimeSelected(event, value) {
        this.state.toTimeDate = value;

      this.state.toTimeDate = Helper.dateFormater(
        new Date(value),
        'hh:mm A',
        'hh:mm A',
      );
      this.state.toTimeFormate = Helper.dateFormater(
        new Date(value),
        'hh:mm a',
        'A',
      );
      //this.changeFromDate(value)
      console.log('To/onTimeSelected===', this.state.toTimeDate);
      this.setState({toTime: this.state.toTimeDate.toString()});
      // console.log('changeFromDateJS====', this.state.toTime)
      this.setState({toTimeDate: value});
      if (event.type == 'dismissed') {
        this.setState({toTimePicker: false});
      }
      };

    //#region -> View Render
    render() {
        return (
            <View style={styles.mainContainer}>
                <KeyboardAvoidingView style={styles.mainContainer} behavior={Helper.isIPhoneX() ? "padding" : null}>
                    <ImageBackground source={Images.blueBackground} style={styles.backgroundImage}>
                        <ScrollView contentContainerStyle={styles.ScrollView}>
                            <View style={[styles.container, styles.justifySpaceBetween]}>
                                <View style={styles.topHeader}>
                                    <Text style={[styles.h1, styles.textCenter]}>{'SETUP TIME BLOCK'.toUpperCase()}</Text>
                                </View>
                                <View style={{ flexGrow: 1, flexDirection: 'column-reverse', width: '100%' }}>
                                    <View style={[styles.justifyFooter,{flexDirection:'row', justifyContent:'space-around', alignItems:'center'}]}>
                                    <TouchableOpacity style={styles.nextButton} onPress={() => this.props.navigation.goBack()}>
                                            <Image source={Images.circleArrowLeft} style={styles.circleArrow} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.nextButton} onPress={() => this.moveToScheduleTask()}>
                                            <Image source={Images.circleArrowRight} style={styles.circleArrow} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[styles.form, { flexGrow: 1 }]}>
                                        <View style={[styles.formControl, { zIndex:999 }]}>
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
                                             <View style={[styles.dropdownContainer, { justifyContent: 'center', zIndex:999, }]}>
                                <TouchableOpacity style={[styles.dropdownButton, styles.dropdownButtonLarge, this.state.showDropdown
                                    ? styles.bottomRadiusNull : null]} onPress={() => this.toggleDropdown()}>
                                    <Text style={[styles.dropdownButtonText, styles.dropdownLargeButtonText]}>{this.state.selectedTask
                                        == '' ? this.state.taskNameList[0] : this.state.selectedTask}</Text>
                                    <Image source={Images.downarrow} style={styles.downarrow} />
                                </TouchableOpacity>
                                {this.state.showDropdown ?
                                    <View style={[styles.dropdown, styles.dropdownLarge]}>
                                        <FlatList keyboardShouldPersistTaps={'always'}
                                            data={this.state.taskNameList}
                                            extraData={this.state}
                                            keyExtractor={(item, index) => index}
                                            renderItem={({ item, index }) => this.renderRow(item, index)}
                                            contentContainerStyle={{ padding: 15 }}
                                        />
                                    </View>
                                    : null
                                }
                            </View>

                                        </View>
                                        {this.state.selectedTask === '+CREATE YOUR OWN' ? ( 
                                                                                    <View style={[styles.formControl]}>

                            <TextInput
                            style={styles.input}
                            autoCapitalize='characters'
                            value={this.state.taskName.toUpperCase()}
                            placeholder={'Name'.toUpperCase()}
                            underlineColorAndroid={'transparent'}
                            placeholderTextColor={'#fff'}
                            returnKeyType={'done'}
                            onChangeText={(taskName) => this.setState({ taskName })}
                            onSubmitEditing={(event) => { Keyboard.dismiss(); }}
                        /></View>) : null}

                                        <View style={styles.frm}>
                                            <Text style={styles.label}>{'TIME'.toUpperCase()}</Text>
                                            <View style={styles.frmRow}>
                                                <View style={styles.frmInline}>
                                                <Text style={{ color:Colors.titleColor, paddingTop:10, width:'100%',paddingHorizontal:10, borderRadius:5, height:40, position: 'absolute', paddingHorizontal:10, backgroundColor:'#fff' }}>{this.state.fromTime }</Text>
                                            <TouchableOpacity onPress={()=> {
                                                this.showTimePicker()
                                             }} style={{ width:'100%', height:40 }}>
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
                                                    {/* <TouchableOpacity style={styles.inputView}>
                                                         <DatePicker full transparent style={[styles.rowSectionWhite,{width: '100%'}]}
                                                            // style={{ width: '100%' }}
                                                            placeholder='HH:MM'
                                                            date={this.state.fromTime}
                                                            mode='time'
                                                            format="hh:mm A"
                                                            // minDate={Helper.getCurrentTime()}
                                                            confirmBtnText="Confirm"
                                                            cancelBtnText="Cancel"
                                                            showIcon={false}
                                                            onDateChange={(fromTime) => { this.setState({ fromTime }) }}
                                                            customStyles={{
                                                                dateInput: {
                                                                    marginLeft: 0,
                                                                    borderWidth: 0,
                                                                    width: '100%',
                                                                    alignItems: 'center',
                                                                },
                                                                btnTextConfirm: {
                                                                    color: 'gray',
                                                                }
                                                            }}
                                                        /> 
                                                    </TouchableOpacity>*/}
                                                </View>
                                                <Text style={styles.coloun}>-</Text>
                                                <View style={styles.frmInline}>
                                                <Text style={{ color:Colors.titleColor, paddingTop:10, width:'100%',paddingHorizontal:10, borderRadius:5, height:40, position: 'absolute', paddingHorizontal:10, backgroundColor:'#fff' }}>{this.state.toTime }</Text>
                                                     <TouchableOpacity style={[{  width:'100%', height:40 }]}
                                                        // <TouchableOpacity style={[styles.inputView, {paddingHorizontal:0, overflow:'hidden'}]}
                                                        onPress={()=> {
                                                            this.showToTimePicker()
                                                         }}>
                                                       {/* {this.state.fromTime.length == 0 ? */}
                                                            {/* <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: Colors.transparent, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ color: '#c9c9c9' }}>HH:MM</Text>
                                                            </View> */}
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
                                                    onChange={(event,data) => { this.setState({toTimePicker: false},()=> {
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
                                                />)
                                                        } */}
                                                    </TouchableOpacity>
                                                </View>
                                                {/* <TouchableOpacity style={styles.editTouch}>
                                                    <Image source={Images.edit} style={styles.editIcon} />
                                                </TouchableOpacity> MP */}
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
                                                    style={{ width: '100%', height: '100%'}}
                                                    confirmBtnText="Confirm"
                                                    cancelBtnText="Cancel"
                                                    showIcon={false}
                                                    // onChange={(event,data) => { this.setState({timePicker: true},()=> {
                                                    //     this.onTimeSelected(event,data)
                                                    //     console.log('onChangeForTime', this.state.time)
                                                    // })}}
                                                    onChange={(event, value) => {
                                                        this.onTimeSelected(event,value)
                                                        console.log('onChangeForTime', this.state.time)
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
                                                        }
                                                    }}
                                                />)}
                                                {this.state.toTimePicker && (
                                               <DatePicker
                                                value={this.state.toTimeDate}
                                                placeholder={'HH:mm'}
                                                mode={'time'}
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
                                                />)}
                                    </View>
                                    </View>
                                        <View style={[styles.frm, { zIndex:899 }]}>
                                            <View style={[styles.inline, { position: 'relative',}]}>
                                                <Text style={[styles.label, { marginBottom: 0, paddingBottom: 0 }]}>{'Colour'.toUpperCase()}</Text>
                                                <TouchableOpacity style={[styles.colorPreview, { backgroundColor: this.state.taskSelectedColor }]} onPress={() => this.setToggleColorPicker()}></TouchableOpacity>
                                                {
                                                    this.state.toggleColorPicker ?
                                                        <View style={styles.ColorPalette}>
                                                            <ColorPalette
                                                                onChange={color => this.setState({
                                                                    taskSelectedColor: color,
                                                                    toggleColorPicker: false
                                                                })}
                                                                defaultColor={this.state.taskSelectedColor}
                                                                scaleToWindow
                                                                paletteStyles={{
                                                                    backgroundColor: Colors.snow,
                                                                    padding: 4,
                                                                    borderRadius: 5,
                                                                    maxWidth: (Metrics.screenWidth - 20) 
                                                                }}
                                                                colors={[
                                                                    '#f2c745', '#E74C3C', '#9B59B6', '#2980B9', '#3498DB', '#1ABC9C', '#16A085', 
                                                                    '#27AE60', '#2ECC71', '#C0392B', '#F39C12', '#E67E22', '#D35400', '#de3038',
                                                                    '#BDC3C7', '#95A5A6', '#7F8C8D', '#34495E', '#2C3E50', '#000000', '#47363c',
                                                                    '#9ee841', '#68869b', '#2fdf1d', '#79bc79', '#a24a75', '#627f8b', '#42675c',
                                                                    '#c777fd', '#d601d5', '#c048fc', '#5a9662', '#a5a080', '#F1C40F', '#c33794'
                                                                ]}
                                                                title={""}
                                                            /></View> : null
                                                }
                                            </View>
                                        </View>
                                        <View style={{marginTop:60, justifyContent:'center', alignItems:'center'}}>
                                        <Text style={[styles.label, {textAlign:'center'}]}>{'Select day/s below if you would like this time block to repeat.'}</Text>

                                        <View style={{ justifyContent:'center', alignItems:'center', flex:1}}>
                                        <FlatList 
                                            data={this.state.arrSelectedDates}
                                            extraData={this.state}
                                            keyExtractor={(item, index) => index}
                                            renderItem={({ item, index }) => this.renderDays(item, index)}
                                            horizontal={true}
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
        )
    }
}
