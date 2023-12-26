import React, { Component } from 'react'
import { ScrollView, Image, View, ImageBackground, TouchableOpacity, Text, KeyboardAvoidingView } from 'react-native'
import { Images, Colors, Metrics } from '../Themes'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';

import * as Helper from '../Lib/Helper'
import Constants from '../Components/Constants';
import Api from '../Services/Api'

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
            dictCreateTask: [],//this.props.navigation.state.params.dictCreateTask,
            strMinimumDate: Helper.getMinimumDateForCalender(),
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.state.arrSelectedDates['2019-06-01'] = {selected: true, marked: true, selectedColor: 'white'}
        this.setState({})
    }

    //#region -> Class Methods
    selectedDay = (date) => {
        this.state.arrSelectedDates[date.dateString] = {selected: true, marked: true, selectedColor: 'red'}
        this.setState({})
        return
        if (this.state.arrSelectedDates.includes(day.dateString)) {
            var index = this.state.arrSelectedDates.indexOf(day.dateString);
            if (index > -1) {
                this.state.arrSelectedDates.splice(index, 1);
            }
        }
        else {
            this.state.arrSelectedDates.push(day.dateString)
        }
    }

    isValidate = () => {
        // if (this.state.arrSelectedDates.length != 0 ){
        //     Helper.showErrorMessage(Constants.MESSAGE_NO_DAY_SELECT);
        //     return false;
        // }
    }

    moveToSelectTask = () => {
        // if (this.isValidate()) {
        this.state.dictCreateTask.push({
            key: "taskDates",
            value: this.state.arrSelectedDates
        });
        this.props.navigation.navigate('SelectTaskScreen', { dictCreateTask: dictCreateTask })
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
                                        // minDate={this.state.strMinimumDate}
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
                                        dayComponent={({date, state}) => {
                                            return (<TouchableOpacity  style={[{flex: 1, backgroundColor:Colors.transparent, borderRadius:35/2, borderWidth:1, borderColor:'#fff', height:35, width:35, alignItems:'center', justifyContent:'center'}]}
                                            onPress={(day) => {  
                                                this.selectedDay(date.day)
                                                console.log('✅ date',date);
                                                console.log('✅ this.state.date',this.state.date);
                                                this.setState({date})
                                            }}>
                                            <Text style={{textAlign: 'center', color: state === 'disabled' ? '#ddd' : (this.state.date && this.state.date.dateString == date.dateString) ? 'red' :  '#fff'}}>{date.day}</Text>
                                            </TouchableOpacity>);
                                          }}
                                        theme={{
                                            backgroundColor: '#689be5',
                                            calendarBackground: '#689be5',
                                            textSectionTitleColor: '#fff',
                                            selectedDayBackgroundColor: '#fff',
                                            selectedDayTextColor: '#f00',
                                            todayTextColor: '#000',
                                            dayTextColor: '#f00',
                                            textDisabledColor: '#fff',
                                            dotColor: '#00adf5',
                                            selectedDotColor: '#ffffff',
                                            arrowColor: '#fff',
                                            monthTextColor: '#fff',
                                            indicatorColor: 'blue',
                                            // textDayFontFamily: 'monospace',
                                            // textMonthFontFamily: 'monospace',
                                            // textDayHeaderFontFamily: 'monospace',
                                            textDayFontWeight: '300',
                                            textMonthFontWeight: 'bold',
                                            textDayHeaderFontWeight: '300',
                                            textDayFontSize: 14,
                                            textMonthFontSize: 16,
                                            textDayHeaderFontSize: 14
                                          }}
                                    />
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
