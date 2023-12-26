import React, { Component } from 'react'
import { ScrollView, Image, View, ImageBackground, TouchableOpacity, Text, KeyboardAvoidingView } from 'react-native'
import { Images, Colors, Metrics } from '../Themes'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import * as Helper from '../Lib/Helper'
import Constants from '../Components/Constants';

// Styles
import styles from './Styles/SetupTimeBlockScreenStyles'
import BaseComponent from '../Components/BaseComponent';

export default class ScheduleTaskScreen extends BaseComponent {

    static navigationOptions = ({ navigation }) => ({
        headerStyle: {
            backgroundColor: Colors.navHeaderLight,
            shadowOpacity: 0,
            shadowOffset: { height: 0, },
            elevation: 0,
            height: Metrics.navBarHeight,
            borderBottomWidth: 0,
        },
    });

    //constructor 
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            arrSelectedDates: {},
            arrSelectedTaskDates: [],
            dictCreateTask: this.props.navigation.state.params.dictCreateTask,
            strMinimumDate: '',
            current: '',
            isRepeatEveryday: false,
            isRepeatMonthly: false,
            isPastSelectedTimeSlote: false,
            isSunday: false,
        }
    }

    //#region -> Component Methods
    componentDidMount() {
        super.componentDidMount()
        Helper.checkChoosenTimeIsValidOrNot(this.state.dictCreateTask['fromTime'], (aNewDay, isPastSelectedTime, todayIsSunday) => {
            this.state.strMinimumDate = aNewDay
            this.state.arrSelectedDates[aNewDay] = { selected: true, marked: true, selectedColor: 'white' }
            this.state.arrSelectedTaskDates.push(Helper.dateFormater(aNewDay, 'YYYY-MM-DD', 'Y-M-D'))
            this.state.isPastSelectedTimeSlote = isPastSelectedTime
            this.state.isSunday = todayIsSunday
            this.setState({
                current: aNewDay
            })
        })
    }
    //#endregion

    //#region -> Class Methods
    selectedDay = (date) => {
        if (this.state.arrSelectedDates[date.dateString]) {
            delete this.state.arrSelectedDates[date.dateString]
            var index = this.state.arrSelectedTaskDates.indexOf(Helper.dateFormater(date.dateString, 'YYYY-MM-DD', 'Y-M-D'));
            if (index > -1) {
                this.state.arrSelectedTaskDates.splice(index, 1);
            }
        }
        else {
            this.state.arrSelectedDates[date.dateString] = { selected: true, marked: true, selectedColor: '#fff' }
            this.state.arrSelectedTaskDates.push(Helper.dateFormater(date.dateString, 'YYYY-MM-DD', 'Y-M-D'))
        }
        this.state.current = date.dateString
        this.state.isRepeatMonthly = false
        this.state.isRepeatEveryday = false
        this.setState({})
        setTimeout(function () { this.setState({ current: '' }) }.bind(this), 100);
        console.log('this.state.arrSelectedTaskDates',this.state.arrSelectedTaskDates, this.state.arrSelectedDates)

    }

    isValidate = () => {
        if (this.state.arrSelectedTaskDates.length == 0 && !this.state.isRepeatMonthly && !this.state.isRepeatEveryday) {
            Helper.showErrorMessage(Constants.MESSAGE_NO_DAY_SELECT);
            return false;
        }

        return true;
    }

    moveToSelectTask = () => {
        if (this.isValidate()) {

            this.state.dictCreateTask['task_date'] = this.state.isRepeatEveryday ? ''
                : this.state.isRepeatMonthly ? '' : this.state.arrSelectedTaskDates
            this.state.dictCreateTask['frequency'] = this.state.isRepeatEveryday ? 'all'
                : this.state.isRepeatMonthly ? 'month' : ''
            
            if (this.state.isRepeatEveryday || this.state.isRepeatMonthly){
                this.state.arrSelectedDates[this.state.strMinimumDate] = { selected: true, marked: true, selectedColor: 'white' }
                this.state.arrSelectedTaskDates.push(Helper.dateFormater(this.state.strMinimumDate, 'YYYY-MM-DD', 'Y-M-D'))
                this.state.dictCreateTask['task_date'] = this.state.arrSelectedTaskDates
            }
            console.log('this.state.dictCreateTask', this.state.dictCreateTask)
            this.props.navigation.navigate('SelectTaskScreen', { dictCreateTask: this.state.dictCreateTask })
        }
    }

    clickRepeatTask = (repeatType) => {

        if (repeatType == 'month') {
            this.state.isRepeatMonthly = !this.state.isRepeatMonthly
            this.state.isRepeatEveryday = false
        }
        else {
            this.state.isRepeatEveryday = !this.state.isRepeatEveryday
            this.state.isRepeatMonthly = false
        }
        this.state.arrSelectedDates = {}
        this.state.arrSelectedTaskDates = []
        
        this.setState({})
        setTimeout(function () { this.setState({ current: '' }) }.bind(this), 100);

        // if (!this.state.isSunday) {
        //     this.state.isRepeatEveryday = !this.state.isRepeatEveryday
        //     this.state.arrSelectedDates = {}
        //     this.state.arrSelectedTaskDates = []

        //     if (this.state.isRepeatEveryday) {
        //         this.state.isPastSelectedTimeSlote
        //         var arrDays = Helper.getUpcominSevenDays()
        //         this.state.isPastSelectedTimeSlote ? arrDays.splice(0, 1) : '';
        //         const items = arrDays.map((item, index) => {
        //             let aDate = Helper.dateFormater(item, 'dddd DD MMMM YYYY', 'YYYY-MM-DD')
        //             this.state.arrSelectedTaskDates.push(Helper.dateFormater(aDate, 'YYYY-MM-DD', 'Y-M-D'))
        //             return this.state.arrSelectedDates[aDate] = { selected: true, marked: true, selectedColor: 'white' }
        //         });
        //     }
        //     else {
        //         this.state.arrSelectedDates[this.state.strMinimumDate] = { selected: true, marked: true, selectedColor: 'white' }
        //         this.state.arrSelectedTaskDates.push(Helper.dateFormater(this.state.strMinimumDate, 'YYYY-MM-DD', 'Y-M-D'))
        //     }
        //     this.setState({})
        //     setTimeout(function () { this.setState({ current: '' }) }.bind(this), 100);
        // }
        // else {
        //     Helper.showErrorMessage(Constants.MESSAGE_NO_REPEAT)
        // }

    }
    //#endregion

    //#region -> View Render
    render() {
        return (
            <View style={styles.mainContainer}>
                <KeyboardAvoidingView style={styles.mainContainer} behavior={"padding"}>
                    <ImageBackground source={Images.blueBackground} style={styles.backgroundImage}>
                        <ScrollView contentContainerStyle={styles.ScrollView}>
                            <View style={[styles.container, styles.justifySpaceBetween]}>
                                <View style={styles.topHeader}>
                                    <Text style={[styles.h1, styles.textCenter]}>{'SCHEDULE'}</Text>
                                </View>
                                <View style={[styles.form, styles.Calendar]}>
                                    <Calendar
                                        // markingType={'custom'}
                                        markedDates={this.state.arrSelectedDates}
                                        // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
                                        minDate={this.state.strMinimumDate}
                                        // Handler which gets executed on day press. Default = undefined
                                        onDayPress={(date) => { this.selectedDay(date) }}
                                        // Handler which gets executed on day long press. Default = undefined
                                        onDayLongPress={(day) => { console.log('✅ selected day', day) }}
                                        // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                                        monthFormat={'MMMM yyyy'}
                                        // Handler which gets executed when visible month changes in calendar. Default = undefined
                                        onMonthChange={(month) => { console.log('✅ month changed', month) }}
                                        // Hide month navigation arrows. Default = false
                                        hideArrows={false}
                                        // Replace default arrows with custom ones (direction can be 'left' or 'right')
                                        // renderArrow={(direction) => (<Arrow />)}
                                        // Do not show days of other months in month page. Default = false
                                        hideExtraDays={true}
                                        // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
                                        // day from another month that is visible in calendar page. Default = false
                                        disableMonthChange={false}
                                        // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
                                        firstDay={1}
                                        // Handler which gets executed when press arrow icon left. It receive a callback can go back month
                                        onPressArrowLeft={substractMonth => substractMonth()}
                                        // Handler which gets executed when press arrow icon left. It receive a callback can go next month
                                        onPressArrowRight={addMonth => addMonth()}
                                        theme={{
                                            backgroundColor: '#689be5',
                                            calendarBackground: '#689be5',
                                            textSectionTitleColor: '#fff',
                                            selectedDayBackgroundColor: '#fff',
                                            selectedDayTextColor: '#689be5',
                                            todayTextColor: '#fff',
                                            dayTextColor: '#fff',
                                            textDisabledColor: '#fff',
                                            dotColor: '#00adf5',
                                            selectedDotColor: '#ffffff',
                                            arrowColor: '#fff',
                                            monthTextColor: '#fff',
                                            indicatorColor: '#fff',
                                            textDayFontWeight: '300',
                                            textMonthFontWeight: 'bold',
                                            textDayHeaderFontWeight: '300',
                                            textDayFontSize: 16,
                                            textMonthFontSize: 16,
                                            textDayHeaderFontSize: 14
                                        }}
                                        current={this.state.current}
                                    />
                                </View>
                                <View style={[styles.justifyFooter, { paddingLeft: 0, paddingRight: 0 }]}>

                                    {/* <TouchableOpacity style={[{ flexDirection: 'row', alignItems: 'center' }]}
                                        onPress={() => this.clickRepeatTask('month')}>
                                        <TouchableOpacity style={[this.state.isRepeatMonthly ? styles.daySelected :
                                            styles.dayUnSelected, styles.repeatTaskForWeek, { marginRight: 10 }]} >
                                            {this.state.isRepeatMonthly ?
                                                <Image source={Images.tick} style={styles.tickRepeatTask} /> : null
                                            }
                                        </TouchableOpacity>
                                        <Text style={[styles.label, styles.textCenter, { marginTop: 18 }]}>
                                            {'REPEAT THIS FOR THE NEXT MONTH'}</Text>
                                    </TouchableOpacity> */}

                                    <TouchableOpacity style={[{ flexDirection: 'row', alignItems: 'center' }]}
                                        onPress={() => this.clickRepeatTask('everyday')}>
                                        <TouchableOpacity style={[this.state.isRepeatEveryday ? styles.daySelected :
                                            styles.dayUnSelected, styles.repeatTaskForWeek, { marginRight: 10 }]} >
                                            {this.state.isRepeatEveryday ?
                                                <Image source={Images.tick} style={styles.tickRepeatTask} /> : null
                                            }
                                        </TouchableOpacity>
                                        <Text style={[styles.label, styles.textCenter, { marginTop: 18 }]}>
                                            {'REPEAT THIS BLOCK EVERY DAY'}</Text>
                                    </TouchableOpacity>

                                </View>

                                <View style={styles.justifyFooter}>
                                    <TouchableOpacity style={styles.nextButton} onPress={() => this.moveToSelectTask()}>
                                        <Image source={Images.circleArrowRight} style={styles.circleArrow} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </ImageBackground>
                </KeyboardAvoidingView>
            </View>
        )
    }
}
