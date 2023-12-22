import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from '../Components/Spinner';
import React from 'react';
import { FlatList, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Modal, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View ,Alert} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import BaseComponent from '../Components/BaseComponent';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import { Colors, Images, Metrics } from '../Themes';
import Moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';

// Styles
import styles from './Styles/SelectTaskScreenStyles';

// Global Variables
const objSecureAPI = Api.createSecure();


export default class SelectTaskScreen extends BaseComponent {

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

    //constructor event
    constructor(props) {
        super(props)
        this.state = {
            createTask: false,
            selectTaskModel: false,
            selectIconModel: false,
            objSelectedChild: [],
            showDropdown: false,
            timeForTaskDropdown: false,
            typeOfTokensDropdown: false,
            arrSelectedTasksSubCatIds: [],
            editTaskName: false,
            arrAllCategories: [],
            arrAllCategoriesImages: [],
            arrSelectedCategoryImages: [],
            dictCreateTask: this.props.navigation.state.params.dictCreateTask,
            arrTypeOfTokens: [],
            arrTaskTime: [],
            arrCustomCategoryIcons: [],
            selectedCategory: '',
            customCategory: '',
            selectedSubCategory: '',
            customTaskDescription: '',
            customTaskName: '', //For custom task name
            taskType: '',
            taskName: '',
            taskTokenType: '',
            taskNumberOfToken: '',
            taskImage: '',
            taskTime: '',
            taskCustomImage: '',
            taskCustomImagePath: '',
            totalTaskSlotMinutes: 0,
        }
    }

    //#region -> Component Methods
    componentDidMount(){
        super.componentDidMount()
        this.getMinutesForTheTimeSlot()
        this.state.arrTaskTime = [...Array(60)].map((_, i) => i + 1 + '')
        this.state.arrTypeOfTokens = [Constants.TASK_TOKEN_STANDARD, Constants.TASK_TOKEN_SPECIAL]
        this.getTaskCategories()
        this.getChildDetail()
    }
    //#endregion

    //#region -> Class Methods
    getMinutesForTheTimeSlot = () =>{
        var endTime = Moment(this.state.dictCreateTask['toTime'], 'hh:mm A')
        var startTime = Moment(this.state.dictCreateTask['fromTime'], 'hh:mm A')
        this.state.totalTaskSlotMinutes = endTime.diff(startTime, 'minutes');
        console.log('✅, totalTaskSlotMinutes', this.state.totalTaskSlotMinutes);
    }
    getChildDetail = () => {
        AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
            if (child != '') {
                this.setState({ objSelectedChild: JSON.parse(child) }, () => {
                    const tasks = this.state.objSelectedChild.tasks
                    let arr = []
                    Object.keys(tasks).map((item) => {
                        tasks[item].map((data, i) => {
                            arr.push(data.ccid)
                        })
                    })
                    this.setState({ arrSelectedTasksSubCatIds: arr })
                });
            }
        })
    }

    setCreateTask() {
        this.setState({ createTask: !this.state.createTask },
            () => {
                this.state.taskType = this.state.createTask ? Constants.TASK_TYPE_CUSTOM : ''
                this.state.selectedCategory = this.state.createTask ? this.state.customCategory : ''
                this.state.taskCustomImage = ''
                this.state.taskCustomImagePath = ''
                this.setState({})
            });
    }

    setIconModel = (boolVar) => {
        this.setState({ selectIconModel: boolVar })
    }

    createCustomTask = () => {
        this.addTask()
    }

    addTask = () => {

        if (this.isValidator()) {
            this.callAddTask()
        }
    }

    isValidator = () => {
        if ((this.state.taskType === Constants.TASK_TYPE_DEFAULT ? this.state.taskName :
            this.state.customTaskName).trim() == '') {
            Helper.showErrorMessage(Constants.MESSAGE_NO_TASK_NAME);
            return false;
        }
        else if (this.state.taskTime.trim() == '') {
            Helper.showErrorMessage(Constants.MESSAGE_SELECT_TASK_TIME);
            return false;
        }
        // else if (this.state.taskTokenType.trim() == '') {
        //     Helper.showErrorMessage(Constants.MESSAGE_SELECT_TASK_TOKEN_TYPE);
        //     return false;
        // }
        else if (this.state.taskNumberOfToken.trim() == '') {
            Helper.showErrorMessage(Constants.MESSAGE_NO_TASK_TOKEN);
            return false;
        }
        else if ((this.state.taskType === Constants.TASK_TYPE_CUSTOM) && this.state.taskCustomImagePath === '') {
            Helper.showErrorMessage(Constants.MESSAGE_NO_TASK_ICON);
            return false;
        }
        else if (this.state.totalTaskSlotMinutes <  this.state.taskTime){
            Helper.showErrorMessage(Constants.MESSAGE_NO_GREATER_TASK);
            return false;
        }
        return true
    }

    toggleDropdown() {
        this.setState({ showDropdown: !this.state.showDropdown });
    }

    toggleTypeOfTokenDropdown() {
        this.setState({ typeOfTokensDropdown: !this.state.typeOfTokensDropdown });
    }

    toggleTimeForTokenDropdown() {
        this.setState({ timeForTaskDropdown: !this.state.timeForTaskDropdown });
    }

    editTaskName = () => {
        this.setState({ editTaskName: true })
    }

    onPressOpenImagePicker = () => {
        ImagePicker.openPicker({
            cropping: true
        }).then(image => {
            console.log('image.path', image.path);
            this.state.taskCustomImagePath = image.path
            this.setState({
                taskCustomImage: image
            })
        });
    }
    //#endregion

    //#endregion -> API Calls
    getTaskCategories = () => {
        this.setState({ isLoading: true })
        const res = objSecureAPI.getCategories().then((resJSON) => {
            console.log('✅✅✅', resJSON)
            if (resJSON.ok && resJSON.status == 200) {
                this.setState({ isLoading: false })
                if (resJSON.data.success) {
                    const allCategories =  {
                        "id": 230,
                        "image": "",
                        "name": "All Categories",
                        "parent_id": 0
                      };
                    var arrAllCategoriesData = resJSON.data.data
                    arrAllCategoriesData = [allCategories, ...arrAllCategoriesData];
                    this.state.arrAllCategories = arrAllCategoriesData.filter((item) => {
                        return item.parent_id == 0
                    })
                    arrAllCategoriesData = [allCategories, ...arrAllCategoriesData];

                    this.state.arrAllCategoriesImages = arrAllCategoriesData.filter((item) => {
                        return item.parent_id != 0
                    })
                    this.state.customCategory = this.state.arrAllCategories.filter((item) => {
                        return item.name === 'Custom'
                    })[0]
                    this.state.arrCustomCategoryIcons = arrAllCategoriesData.filter((item) => {
                        return item.parent_id == this.state.customCategory.id
                    })
                    this.setState({})
                }
                else {
                    Helper.showErrorMessage(resJSON.data.message);
                }
            }
            else if (resJSON.status == 500) {
                this.setState({ isLoading: false })
                Helper.showErrorMessage(resJSON.data.message);
            }
            else {
                this.setState({ isLoading: false })
                Helper.showErrorMessage(Constants.SERVER_ERROR);
            }
        })
    }

    callAddTask = () => {
        this.setState({ isLoading: true })
        var childId = this.state.objSelectedChild.id
        var mainCatId = this.state.selectedCategory.id
        var subCatId = this.state.selectedSubCategory
        var taskType = this.state.taskType
        var timeSloteName = this.state.dictCreateTask['taskName']
        var taskName = taskType === Constants.TASK_TYPE_DEFAULT ? this.state.taskName : this.state.customTaskName
        var taskDescription = this.state.customTaskDescription
        var taskFromTime = this.state.dictCreateTask['fromTime']
        var taskToTime = this.state.dictCreateTask['toTime']
        var taskTime = this.state.taskTime
        var taskColor = this.state.dictCreateTask['taskColor']
        var taskTokenType = this.state.taskTokenType || Constants.TASK_TOKEN_STANDARD
        var taskNumberOfTokens = this.state.taskNumberOfToken
        var taskDates = (this.state.dictCreateTask['task_date']).join()
        var frequency = this.state.dictCreateTask['frequency']
        var taskCustomIcon = this.state.taskCustomImage

        const res = objSecureAPI.addTask(childId, mainCatId, subCatId, taskType, timeSloteName ,taskName, taskDescription, taskFromTime,
            taskToTime, taskTime, taskColor, taskTokenType, taskNumberOfTokens, taskDates, taskCustomIcon, frequency).then((resJSON) => {
                console.log('✅✅✅', resJSON)
                if (resJSON.ok && resJSON.status == 200) {
                    this.setState({ isLoading: false })
                    if (resJSON.data.success) {
                        this.state.totalTaskSlotMinutes = this.state.totalTaskSlotMinutes - this.state.taskTime
                        console.log('✅✅✅', JSON.stringify(resJSON.data.data[0]))
                        try {
                            AsyncStorage.setItem(Constants.KEY_SELECTED_CHILD, JSON.stringify(resJSON.data.data[0]))
                            this.getChildDetail()
                            Helper.showConfirmationMessagesignleAction(resJSON.data.message, 'Ok').then((action) => {
                                if (action) {
                                    if (this.state.taskType === Constants.TASK_TYPE_DEFAULT) {
                                        this.setTaskModelVisible()
                                    }
                                    else {
                                        this.setCreateTask()
                                        this.getTaskCategories()
                                    }
                                }
                            })
                        } catch (error) {
                            console.log('AsyncStorage Error: ', error)
                        }
                    }
                    else {
                        Helper.showErrorMessage(resJSON.data.message);
                    }
                }
                else if (resJSON.status == 500) {
                    this.setState({ isLoading: false })
                    Helper.showErrorMessage(resJSON.data.message);
                }
                else {
                    this.setState({ isLoading: false })
                    Helper.showErrorMessage(Constants.SERVER_ERROR);
                }
            })
    }
    //#endregion

    //#region -> View Render
    renderRow(item, index) {
        return (
            <TouchableOpacity style={styles.dropdownItem} onPress={() => this.categorySelected(item)}>
                <Text style={styles.dropdownItemText}>{item.name}</Text>
            </TouchableOpacity>
        )
    }

    categorySelected = (category) => {
        this.state.selectedCategory = category
        this.state.arrSelectedCategoryImages = this.state.arrAllCategoriesImages.filter((item) => {
            return item.parent_id == category.id
        })
        this.setState({})
        this.toggleDropdown()
    }

    renderTokenType(item, index) {
        return (
            <TouchableOpacity style={styles.dropdownItem} onPress={() => this.tokenTypeSelected(item)}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    {index==0? 
                <Image source={Images.everyday} style={[styles.dropdownImage]} />
            :
            <Image source={Images.special} style={[styles.dropdownImage]} />
                    }
                <Text style={[styles.dropdownItemText]}>{(item)}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    tokenTypeSelected = (tokenType) => {
        this.setState({
            taskTokenType: tokenType,
            typeOfTokensDropdown: false
        });
    }

    renderTaskTime(item, index) {
        return (
            <TouchableOpacity style={styles.dropdownItem} onPress={() => this.taskTimeSelected(item)}>
                <Text style={styles.dropdownItemText}>{(item)}</Text>
            </TouchableOpacity>
        )
    }

    taskTimeSelected = (time) => {
        this.setState({
            taskTime: time,
            timeForTaskDropdown: false
        });
    }

    renderImages(item, index) {
        return (
            <TouchableOpacity style={[styles.taskIconTouch,
            this.state.arrSelectedTasksSubCatIds.includes(item.id) ? styles.taskIconTouchActive : '']}
                onPress={() => this.setTaskModelVisible(item)}>
                <Image source={{ uri: item.image }} style={styles.taskIcon} />
            </TouchableOpacity>
        )
    }

    setTaskModelVisible(item) {
        if (this.state.selectedCategory == '' && item && !this.state.arrSelectedTasksSubCatIds.includes(item.id)) {
            this.state.selectedCategory = this.state.arrAllCategories.filter((objCat) => {
                return objCat.id == item.parent_id
            })[0]
        }

        this.state.taskType = item ? Constants.TASK_TYPE_DEFAULT : ''
        this.state.taskImage = item ? item.image : ''
        this.state.selectedSubCategory = item ? item.id : ''
        
        if (!item) {
            this.state.selectedCategory = ''
            this.state.taskName = ''
            this.state.taskTime = ''
            this.state.taskNumberOfToken = ''
            this.state.taskTokenType = ''
            this.state.timeForTaskDropdown = false,
                this.state.typeOfTokensDropdown = false
        }

        const aModelVisible = item && !this.state.arrSelectedTasksSubCatIds.includes(item.id) ? !this.state.selectTaskModel : false
        this.setState({ selectTaskModel: aModelVisible, showDropdown: false });
    }

    moveToParentHomeScreen() {
        // this.props.navigation.push('ParentHomeScreen')
        Helper.resetNavigationToScreenWithStack(this.props.navigation, 'ParentHomeScreen', 'drawerStack')
        
    }

    renderSelectIconImages(item, index) {
        return (
            <TouchableOpacity style={styles.taskIconTouch} onPress={() => this.selectIconImage(item)}>
                <Image source={{ uri: item.image }} style={styles.taskIcon} />
            </TouchableOpacity>
        )
    }

    selectIconImage = (img) => {
        this.state.taskCustomImagePath = img.image
        this.setState({
            selectedSubCategory: img.id
        })
        this.setIconModel(false)
    }

    render() {
        return (
            <View style={styles.mainContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
                <ImageBackground source={Images.blueBackground} style={styles.backgroundImage}>
                    <ScrollView contentContainerStyle={[styles.ScrollView]}>
                        <View style={[styles.container]}>
                            <View style={styles.containerBody}>
                                <View style={styles.taskList}>
                                     <FlatList keyboardShouldPersistTaps={'always'}
                                        data={this.state.selectedCategory?.id === 230 ? this.state.arrAllCategoriesImages : this.state.arrSelectedCategoryImages}
                                        numColumns={4}
                                        horizontal={false}
                                        renderItem={({ item, index }) => this.renderImages(item, index)}
                                        keyExtractor={(item, index) => index}
                                    />
                                </View>

                                <View style={styles.formFooter}>
                                <View style={[styles.justifyFooter, { paddingTop: 10, paddingBottom: 0 }]}>
                                        <TouchableOpacity style={[styles.button, styles.buttonPrimary, {marginBottom:0}]} onPress={() => this.props.navigation.push('ParentHomeScreen')}>
                                            <Text style={styles.buttonText}>{'Finished Creating Task/s '.toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[styles.justifyFooter, { paddingTop: 0, paddingBottom: 0 }]}>
                                        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => this.setCreateTask()}>
                                            <Text style={styles.buttonText}>{'Create Custom Task '.toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View  style={{justifyContent:'space-around', flexDirection:'row'}}>
                                    <TouchableOpacity style={styles.nextButton} onPress={() => this.props.navigation.goBack()}>
                                        <Image source={Images.circleArrowLeft} style={styles.circleArrow} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.nextButton} onPress={() => this.moveToParentHomeScreen()}>
                                        <Image source={Images.circleArrowRight} style={styles.circleArrow} />
                                    </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View>
                                <View style={styles.clockHeader}>
                                    <Text style={[styles.h1, styles.textCenter]}>{'Select Task'.toUpperCase()}</Text>
                                </View>
                                {this.state.showDropdown ? <TouchableOpacity style={styles.bodyClose} onPress={() => this.toggleDropdown()}></TouchableOpacity> : null}
                                <View style={styles.dropdownContainer}>
                                    {this.state.isLoading ? <Spinner color={'#FFFFFF'} size={'small'} /> :
                                        <TouchableOpacity style={[styles.dropdownButton, styles.dropdownButtonLarge, this.state.showDropdown ? styles.bottomRadiusNull : null]} onPress={() => this.toggleDropdown()}>
                                            <Text style={[styles.dropdownButtonText, styles.dropdownLargeButtonText]}>{this.state.selectedCategory == '' ? 'SELECT CATEGORY' : this.state.selectedCategory.name}</Text>
                                            <Image source={Images.downarrow} style={styles.downarrow} />
                                        </TouchableOpacity>}
                                    {this.state.showDropdown ?
                                        <View style={[styles.dropdown, styles.dropdownLarge]}>
                                            <FlatList keyboardShouldPersistTaps={'always'}
                                                data={this.state.arrAllCategories}
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
                        </View>
                    </ScrollView>
                </ImageBackground>


                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.selectTaskModel}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                    }}>
                    <View style={[styles.modal, styles.modalBlueTrans]}>
                        <SafeAreaView style={styles.SafeAreaView}>
                            <KeyboardAvoidingView style={styles.mainContainer} behavior={"padding"}>
                                <View style={styles.modalView}>
                                    <ScrollView style={styles.modalDialog} contentContainerStyle={styles.ScrollView}>
                                        <View style={[styles.container]}>
                                            <View style={[styles.containerBody, { flexDirection: 'column-reverse' }]}>
                                                <View style={[styles.modalFooter, styles.paddingNull, { marginTop: 30, }]}>
                                                    <TouchableOpacity style={[styles.button, styles.buttonPrimary, { marginTop: 0 }]} onPress={() => this.addTask()}>
                                                        {this.state.isLoading ?
                                                            <Spinner color={'#FFFFFF'} size={'small'} />
                                                            : <Text style={styles.buttonText}>{'SAVE'}</Text>}
                                                    </TouchableOpacity>
                                                    {/* <TouchableOpacity style={[styles.button, styles.buttonPrimary, { marginTop: 0 }]} onPress={() => this.setTaskModelVisible()}>
                                                        <Text style={styles.buttonText}>{'CANCEL'}</Text>
                                                    </TouchableOpacity> MP */}
                                                </View>
                                                <View style={{ flexGrow: 1 }}>
                                                    <View style={styles.modalTopheader}>
                                                        <Image source={{ uri: this.state.taskImage }} style={styles.taskIconLarge} />
                                                        <TouchableOpacity style={[styles.button, { marginTop: 15, alignSelf: 'center', width: null }]}
                                                            onPress={() => this.editTaskName()}>
                                                            {/* {this.state.editTaskName ? */}
                                                                <TextInput
                                                                    value={(this.state.taskName).toUpperCase()}
                                                                    style={styles.buttonText}
                                                                    autoCapitalize='characters'
                                                                    underlineColorAndroid={'transparent'}
                                                                    returnKeyType={'done'}
                                                                    placeholder={'Task Name'.toUpperCase()}
                                                                    onChangeText={(name) => { this.state.taskName = name.toUpperCase(), this.setState({}) }}
                                                                    onSubmitEditing={(event) => { }}
                                                                />
                                                                {/* : 
                                                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                                                    <Text style={[styles.buttonText, {paddingRight:10, paddingLeft:20}]}>{(this.state.dictCreateTask['taskName']).toUpperCase()}</Text>
                                                                    <Image source={Images.editTask} style={styles.editTask} />
                                                                </View>
                                                                } */}
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={{ flexDirection: 'column-reverse' }}>
                                                        <View style={styles.frm}>
                                                            <View style={styles.inline}>
                                                                <Text style={[styles.label, { marginBottom: 0, paddingBottom: 0, color: Colors.titleColor, flex: 0.5 }]}>{'Number of Tokens'.toUpperCase()}</Text>
                                                                <View style={{ flex: 1, paddingLeft: 15 }}>
                                                                    <TextInput
                                                                        value={this.state.taskNumberOfToken}
                                                                        style={[styles.inputItem, styles.buttonBorder]}
                                                                        underlineColorAndroid={'transparent'}
                                                                        returnKeyType={'next'}
                                                                        keyboardType={'number-pad'}
                                                                        onChangeText={(token) => this.setState({ taskNumberOfToken: token })}
                                                                        onSubmitEditing={(event) => { }}
                                                                    />
                                                                </View>
                                                            </View>
                                                        </View>
                            
                                                        <View style={styles.frm}>
                                                            <Text style={[styles.label, { color: Colors.titleColor, fontSize: 16 }]}>{'TOKENS'}</Text>
                                                            <TouchableOpacity style={[styles.dropdownButton, styles.buttonBorder]} onPress={() => this.toggleTypeOfTokenDropdown()}>
                                                                <Text style={styles.dropdownButtonText}>{this.state.taskTokenType ? this.state.taskTokenType : 'TYPE OF TOKENS'}</Text>
                                                                <Image source={Images.downarrow} style={styles.downarrow} />
                                                            </TouchableOpacity>
                                                            {this.state.typeOfTokensDropdown ?
                                                                <View style={[styles.dropdown, styles.dropdownSmall, styles.dropdownBoxshadow]}>
                                                                 <FlatList keyboardShouldPersistTaps={'always'} 
                                                                         data={this.state.arrTypeOfTokens}
                                                                         extraData={this.state}
                                                                         keyExtractor={(item, index) => index}
                                                                         renderItem={({ item, index }) => this.renderTokenType(item, index)}
                                                                         contentContainerStyle={{ padding: 0 }}
                                                                 /> 
                                                                    {/* <DropDownPicker
                                                                    open= {true}
                                                                    keyboardShouldPersistTaps={'xalways'}
                                                                    containerStyle={{  height:180  }} 
                                                                 style={[styles.dropdown, styles.dropdownSmall, styles.dropdownBoxshadow]} 
                                       items={[{
                                         label: 'Special Token',
                                         value: '1',
                                         icon: () => (<Image source={Images.special}/>),

                                        },
                                        {
                                            label: 'Standard Token',
                                            value:'2',
                                            icon: () => (<Image source={Images.special} styles={{height: 10, width: 10}} />),
                                        }]}
                                        renderItem={({ item, index }) => this.renderTokenType(item, index)}
                                        onChange={(item) => {
                                            this.renderTokenType(item,index)
                                        }}
                                        /> */}
                                                                </View>
                                                                : null
                                                            }
                                                        </View>
                                                        <View style={styles.divider}></View>
                                                        <View style={styles.frm}>
                                                            <View style={styles.inline}>
                                                                <Text style={[styles.label, { marginBottom: 0, paddingBottom: 0, color: Colors.titleColor, flex: 0.5 }]}>{'SET A TIMER'}</Text>
                                                                <View style={{ flex: 1, paddingLeft: 15 }}>
                                                                    <TouchableOpacity style={[styles.dropdownButton, styles.buttonBorder]} onPress={() => this.toggleTimeForTokenDropdown()}>
                                                                        <Text style={styles.dropdownButtonText}>{this.state.taskTime ? this.state.taskTime + ' Minutes' : ''}</Text>
                                                                        <Image source={Images.downarrow} style={styles.downarrow} />
                                                                    </TouchableOpacity>
                                                                </View>
                                                                {this.state.timeForTaskDropdown ?
                                                                    <View style={[styles.dropdown, styles.dropdownSmall, styles.dropdownBoxshadow]}>
                                                                        <FlatList keyboardShouldPersistTaps={'always'}
                                                                            data={this.state.arrTaskTime}
                                                                            extraData={this.state}
                                                                            keyExtractor={(item, index) => index}
                                                                            renderItem={({ item, index }) => this.renderTaskTime(item, index)}
                                                                            contentContainerStyle={{ padding: 0 }}
                                                                        />
                                                                    </View>
                                                                    : null
                                                                }
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </ScrollView>
                                </View>
                            </KeyboardAvoidingView>
                        </SafeAreaView>
                    </View>
                </Modal>


                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.createTask}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                    }}>
                    <View style={[styles.modal, styles.modalBlueTrans]}>
                        <SafeAreaView style={styles.SafeAreaView}>
                            <KeyboardAvoidingView style={styles.mainContainer} behavior={"padding"}>
                                <ScrollView contentContainerStyle={styles.ScrollView}>
                                   
                                    <TouchableOpacity style={styles.modalCloseTouch} onPress={() => {
                                                    this.setCreateTask();
                                                }}>
                                    <Image source={Images.close} style={styles.close} />
                                </TouchableOpacity>
                                    <View style={[styles.containerBody, { flexDirection: 'column-reverse' }]}>
                                        <View style={styles.modalFooter}>
                                            <TouchableOpacity style={[styles.button, styles.buttonPrimary, { marginTop: 0 }]} onPress={() => this.createCustomTask()}>
                                                <Text style={styles.buttonText}>{'Save'.toUpperCase()}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.modalBody}>
                                            <Text style={[styles.h1, styles.textCenter]}>{'CREATE NEW TASK'}</Text>
                                            <View style={styles.content}>
                                                <View style={styles.form}>
                                                    <View style={[styles.formControl, styles.formControlSmall]}>
                                                        <TextInput
                                                            style={styles.input}
                                                            value={this.state.customTaskName.toUpperCase()}
                                                            autoCapitalize='characters'
                                                            placeholder={'Name'.toUpperCase()}
                                                            placeholderTextColor={'#fff'}
                                                            underlineColorAndroid={'transparent'}
                                                            returnKeyType={'next'}
                                                            onChangeText={(customTaskName) => this.setState({ customTaskName })}
                                                            onSubmitEditing={(event) => { }}
                                                        />
                                                    </View>
                                                    <View style={[styles.formControl, styles.formControlSmall]}>
                                                        <TextInput
                                                            style={styles.input}
                                                            value={this.state.customTaskDescription.toUpperCase()}
                                                            placeholder={'Further Information'.toUpperCase()}
                                                            autoCapitalize='characters'
                                                            placeholderTextColor={'#fff'}
                                                            underlineColorAndroid={'transparent'}
                                                            returnKeyType={'next'}
                                                            onChangeText={(customTaskDescription) => this.setState({ customTaskDescription })}
                                                            onSubmitEditing={(event) => { Keyboard.dismiss(); }}
                                                        />
                                                    </View>
                                                    <View style={styles.iconContainer}>
                                                        <View style={styles.imageUploader}>
                                                            <View style={styles.uploadView}>
                                                                <Image source={this.state.taskCustomImagePath ? { uri: this.state.taskCustomImagePath } : Images.upload} style={this.state.taskCustomImagePath ? styles.uploadedImage : styles.uploadPlaceholder} />
                                                            </View>
                                                            <View style={styles.buttonRight}>
                                                                <TouchableOpacity style={[styles.button, styles.smallButton, styles.buttonCarrot, { marginBottom: 0 }]}
                                                                    onPress={() => this.setIconModel(true)}>
                                                                    <Text style={styles.smallButtonText}>{'Select Icon'.toUpperCase()}</Text>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity style={[styles.button, styles.smallButton, styles.buttonCarrot]} onPress={() => this.onPressOpenImagePicker()}>
                                                                    <Text style={styles.smallButtonText}>{'Custom Icon'.toUpperCase()}</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                        <View style={{ flexDirection: 'column-reverse' }}>
                                                            <View style={styles.frm}>
                                                                <View style={styles.inline}>
                                                                    <Text style={[styles.label, { marginBottom: 0, paddingBottom: 0 }]}>{'NUMBER OF TOKENS'}</Text>
                                                                    <View style={{ flex: 1, paddingLeft: 15 }}>
                                                                        <TextInput
                                                                            value={this.state.taskNumberOfToken}
                                                                            style={[styles.inputItem, styles.buttonBorder]}
                                                                            underlineColorAndroid={'transparent'}
                                                                            returnKeyType={'next'}
                                                                            keyboardType={'number-pad'}
                                                                            onChangeText={(token) => this.setState({ taskNumberOfToken: token })}
                                                                            onSubmitEditing={(event) => { }}
                                                                        />
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            <View style={styles.frm}>
                                                                <Text style={[styles.label]}>{'TOKEN FOR TASK'}</Text>
                                                                <TouchableOpacity style={styles.dropdownButton} onPress={() => this.toggleTypeOfTokenDropdown()}>
                                                                    <Text style={styles.dropdownButtonText}>{this.state.taskTokenType ? this.state.taskTokenType : 'TYPE OF TOKENS'}</Text>
                                                                    <Image source={Images.downarrow} style={styles.downarrow} />
                                                                </TouchableOpacity>
                                                                {this.state.typeOfTokensDropdown ?
                                                                    <View style={[styles.dropdown, styles.dropdownSmall]}>
                                                                        <FlatList keyboardShouldPersistTaps={'always'}
                                                                            data={this.state.arrTypeOfTokens}
                                                                            extraData={this.state}
                                                                            keyExtractor={(item, index) => index}
                                                                            renderItem={({ item, index }) => this.renderTokenType(item, index)}
                                                                            contentContainerStyle={{ padding: 0 }}
                                                                        />
                                                                    </View>
                                                                    : null
                                                                }
                                                            </View>
                                                            <View style={styles.frm}>
                                                                <View style={styles.inline}>
                                                                    <Text style={[styles.label, { marginBottom: 0, paddingBottom: 0 }]}>{'SET TIMER FOR TASK'}</Text>
                                                                    <View style={{ flex: 1, paddingLeft: 15 }}>
                                                                        <TouchableOpacity style={styles.dropdownButton} onPress={() => this.toggleTimeForTokenDropdown()}>
                                                                            <Text style={styles.dropdownButtonText}>{this.state.taskTime ? this.state.taskTime + ' Minutes' : ''}</Text>
                                                                            <Image source={Images.downarrow} style={styles.downarrow} />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                    {this.state.timeForTaskDropdown ?
                                                                        <View style={[styles.dropdown, styles.dropdownSmall]}>
                                                                            <FlatList keyboardShouldPersistTaps={'always'}
                                                                                data={this.state.arrTaskTime}
                                                                                extraData={this.state}
                                                                                keyExtractor={(item, index) => index}
                                                                                renderItem={({ item, index }) => this.renderTaskTime(item, index)}
                                                                                contentContainerStyle={{ padding: 0 }}
                                                                            />
                                                                        </View>
                                                                        : null
                                                                    }
                                                                </View>
                                                            </View>

                                                        </View>


                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <Modal
                                        animationType="slide"
                                        transparent={true}
                                        visible={this.state.selectIconModel}
                                        onRequestClose={() => {
                                            this.setIconModel(false)
                                        }}>
                                        <View style={[styles.modal, styles.modalRandTrans]}>
                                            <SafeAreaView style={styles.SafeAreaView}>
                                                <KeyboardAvoidingView style={styles.mainContainer} behavior={"padding"}>
                                                    <ScrollView contentContainerStyle={styles.ScrollView}>
                                                        <View style={styles.modalHeader}>
                                                            <View style={styles.modalHeaderRight} />
                                                            <View style={styles.modalHeaderRight}>
                                                                <TouchableOpacity
                                                                    onPress={() => {
                                                                        this.setIconModel(false)
                                                                    }}>
                                                                    <Icon name="times" size={26} color={'#fff'} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                        <View style={styles.modalBody}>
                                                            <Text style={[styles.h1, styles.textCenter]}>{'SELECT ICON'}</Text>
                                                            <View style={[styles.container]}>
                                                                <View style={styles.containerBody}>
                                                                    <View style={styles.taskList}>
                                                                        {this.state.arrCustomCategoryIcons.length > 0 ?
                                                                            <FlatList keyboardShouldPersistTaps={'always'}
                                                                                data={this.state.arrCustomCategoryIcons}
                                                                                extraData={this.state}
                                                                                numColumns={4}
                                                                                renderItem={({ item, index }) => this.renderSelectIconImages(item, index)}
                                                                                keyExtractor={(item, index) => index}
                                                                            />
                                                                            : <Text>{'NO CUSTOM ICONS AVAILABLE YET'}</Text>}
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </ScrollView>
                                                </KeyboardAvoidingView>
                                            </SafeAreaView>
                                        </View>
                                    </Modal>
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </SafeAreaView>
                    </View>
                </Modal>

            </View>
        )
    }
    //#endregion
}
