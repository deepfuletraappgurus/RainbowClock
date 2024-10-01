import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from '../Components/Spinner';
import React from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import BaseComponent from '../Components/BaseComponent';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import {Colors, Images, Metrics} from '../Themes';
import Moment from 'moment';
import RBSheet from 'react-native-raw-bottom-sheet';

// Styles
import styles from './Styles/SelectTaskScreenStyles';
import images from '../Themes/Images';

// Global Variables
const objSecureAPI = Api.createSecure();

export default class EditSelectTaskScreen extends BaseComponent {
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
      arrDefaultTaskTime: [],
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
      isUpLoading: false,
      isDeletesubTaskLoading: false,
      isSavedForFuture: 0,
      taskStatus: '',
    };
  }

  //#region -> Component Methods
  componentDidMount() {
    super.componentDidMount();
    this.getMinutesForTheTimeSlot();
    this.state.arrTaskTime = [...Array(60)].map((_, i) => i + 1 + '');
    this.state.arrDefaultTaskTime = [...Array(4)].map(
      (_, i) => (i + 1) * 5 + '',
    );
    this.state.arrTypeOfTokens = [
      Constants.TASK_TOKEN_STANDARD,
      Constants.TASK_TOKEN_SPECIAL,
    ];
    
    this.getChildDetail();
  }
  //#endregion

  handlePreviousItems = () => {
    const scheduleDetails =
      this.props.navigation.state.params.dictCreateTask.scheduleDetails;

      
      const getCurrentCat = this.state.arrAllCategories?.filter(
        cat => cat.id == scheduleDetails?.mcid,
      );
      const childCat = this.state.arrAllCategoriesImages?.filter(
        cat => cat.id == scheduleDetails?.ccid,
      );
      console.log('SCHEDULEEEEKKNKN', scheduleDetails);
    this.categorySelected(getCurrentCat[0], false);
    setTimeout(() => {
      this.setTaskModelVisible(childCat[0]);
      this.setState({
        selectTaskModel: true,
        taskName: scheduleDetails?.task_name,
        taskNumberOfToken:
          scheduleDetails?.no_of_token == null
            ? ''
            : scheduleDetails?.no_of_token,
        taskType: scheduleDetails?.type == null ? '' : scheduleDetails?.type,
        isSavedForFuture: scheduleDetails?.is_saved_for_future,
        taskStatus: scheduleDetails?.status,
        taskImage:scheduleDetails?.cate_image
      });
      this.tokenTypeSelected(scheduleDetails?.token_type);
      this.taskTimeSelected(scheduleDetails?.task_time);
    }, 300);
  };
  //#region -> Class Methods
  getMinutesForTheTimeSlot = () => {
    var endTime = Moment(this.state.dictCreateTask['toTime'], 'hh:mm A');
    var startTime = Moment(this.state.dictCreateTask['fromTime'], 'hh:mm A');
    this.state.totalTaskSlotMinutes = endTime.diff(startTime, 'minutes');
  };
  getChildDetail = () => {
    AsyncStorage.getItem(Constants.KEY_SELECTED_CHILD, (err, child) => {
      if (child != '') {
        this.setState({objSelectedChild: JSON.parse(child)}, () => {
          const tasks = this.state.objSelectedChild.tasks;
          let arr = [];
          Object.keys(tasks).map(item => {
            tasks[item].map((data, i) => {
              arr.push(data.ccid);
            });
          });
          this.setState({arrSelectedTasksSubCatIds: arr});
          this.getTaskCategories();
        });
      }
    });
  };

  setCreateTask() {
    this.setState({createTask: !this.state.createTask}, () => {
      this.state.taskType = this.state.createTask
        ? Constants.TASK_TYPE_CUSTOM
        : '';
      this.state.selectedCategory = this.state.createTask
        ? this.state.customCategory
        : '';
      this.state.taskCustomImage = '';
      this.state.taskCustomImagePath = '';
      this.setState({});
    });
  }

  setIconModel = boolVar => {
    this.setState({selectIconModel: boolVar});
  };

  createCustomTask = () => {
    this.updateTask();
  };

  updateTask = () => {
    if (this.isValidator()) {
      this.callUpdateTask();
    }
  };

  deleteTask = () => {
      let delete_message = '';
      if (this.state.dictCreateTask['is_multiple_task']) {
        delete_message = 'Are you sure you want to delete this task?';
      } else {
        delete_message =
          'Are you sure you want to delete this task? It will also remove the schedule attached to this task.';
      }
      Helper.showConfirmationMessageActions(
        delete_message,
        'No',
        'Yes',
        () => {},
        () => this.onActionYes(),
      );
  };

  handleDelete = async subTaskId => {
    const key = Constants.KEY_SELECTED_CHILD; // replace with your actual key
    const data = await this.getObjectFromStorage(key);
    if (data) {
      const updatedData = this.deleteSubTask(data, subTaskId);
      await this.saveObjectToStorage(key, updatedData);
    }
  };

  getObjectFromStorage = async key => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error retrieving data from local storage:', e);
    }
  };

  deleteSubTask = (data, subTaskId) => {
    const updatedData = {...data};

    if (updatedData.tasks) {
      for (const timeSlot in updatedData.tasks) {
        // Filter out the sub-task with the given subTaskId
        updatedData.tasks[timeSlot] = updatedData.tasks[timeSlot].filter(
          task => task.sub_task_id !== subTaskId,
        );

        // If the resulting array is empty, you can decide to delete the time slot or handle it accordingly
        if (updatedData.tasks[timeSlot].length === 0) {
          delete updatedData.tasks[timeSlot];
        }
      }
    }

    return updatedData;
  };

  saveObjectToStorage = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error('Error saving data to local storage:', e);
    }
  };

  onActionYes = () => {
    this.setState({
      isDeletesubTaskLoading: true,
    });
    var taskId =
      this.props.navigation.state.params.dictCreateTask.scheduleDetails
        .sub_task_id;
    var childId = this.state.objSelectedChild.id;
    const res = objSecureAPI.deleteSubTask(taskId, childId).then(resJSON => {
      if (resJSON.ok && resJSON.status == 200) {
        this.setState({isDeletesubTaskLoading: false});
        if (resJSON.data.success) {
          this.handleDelete(taskId);
          try {
            Helper.showConfirmationMessagesignleAction(
              resJSON.data.message,
              'Ok',
            ).then(action => {
              if (action) {
                this.setState({isLoading: false});
                  this.setTaskModelVisible();
                  this.props.navigation.goBack();
              }
            });
          } catch (error) {}
        } else {
          Helper.showErrorMessage(resJSON.data.message);
        }
      } else if (resJSON.status == 500) {
        this.setState({isDeletesubTaskLoading: false});
        Helper.showErrorMessage(resJSON.data.message);
      } else {
        this.setState({isDeletesubTaskLoading: false});
        Helper.showErrorMessage(Constants.SERVER_ERROR);
      }
    });
  };

  isValidator = () => {
    if ((this.state?.taskName).trim() == '') {
      Helper.showErrorMessage(Constants.MESSAGE_NO_TASK_NAME);
      return false;
    }
    if (
      this.state.taskStatus == 'Start' ||
      this.state.taskStatus == 'Completed'
    ) {
      Helper.showErrorMessage(Constants.MESSAGE_RECOVER_TASK_ERROR);
      return false;
    }
    //  else if (this.state?.taskTime?.trim() == '') {
    //   Helper.showErrorMessage(Constants.MESSAGE_SELECT_TASK_TIME);
    //   return false;
    // }
    // // else if (this.state.taskTokenType.trim() == '') {
    // //     Helper.showErrorMessage(Constants.MESSAGE_SELECT_TASK_TOKEN_TYPE);
    // //     return false;
    // // }
    // else if (this.state?.taskNumberOfToken?.trim() == '') {
    //   Helper.showErrorMessage(Constants.MESSAGE_NO_TASK_TOKEN);
    //   return false;
    // } else if (
    //   this.state?.taskType === Constants.TASK_TYPE_CUSTOM &&
    //   this.state?.taskCustomImagePath === ''
    // ) {
    //   Helper.showErrorMessage(Constants.MESSAGE_NO_TASK_ICON);
    //   return false;
    // } else if (this.state?.totalTaskSlotMinutes < this.state?.taskTime) {
    //   Helper.showErrorMessage(Constants.MESSAGE_NO_GREATER_TASK);
    //   return false;
    // }
    return true;
  };

  toggleDropdown() {
    this.setState({showDropdown: !this.state.showDropdown});
  }

  toggleTypeOfTokenDropdown() {
    this.setState({typeOfTokensDropdown: !this.state.typeOfTokensDropdown});
  }

  toggleTimeForTokenDropdown() {
    this.setState({timeForTaskDropdown: !this.state.timeForTaskDropdown});
  }

  editTaskName = () => {
    this.setState({editTaskName: true});
  };

  onPressOpenImagePicker = () => {
    ImagePicker.openPicker({
      cropping: true,
    }).then(image => {
      this.state.taskCustomImagePath = image.path;
      this.setState({
        taskCustomImage: image,
      });
    });
  };
  //#endregion

  //#endregion -> API Calls
  getTaskCategories = () => {
    this.setState({isLoading: true});
    const res = objSecureAPI.getCategories(this.state.objSelectedChild.id).then(resJSON => {
      if (resJSON.ok && resJSON.status == 200) {
        this.setState({isLoading: false});
        if (resJSON.data.success) {
          const allCategories = {
            id: 230,
            image: '',
            name: 'All Categories',
            parent_id: 0,
          };
          var arrAllCategoriesData = resJSON.data.data;
          arrAllCategoriesData = [allCategories, ...arrAllCategoriesData];
          this.state.arrAllCategories = arrAllCategoriesData.filter(item => {
            return item.parent_id == 0;
          });
          arrAllCategoriesData = [allCategories, ...arrAllCategoriesData];

          this.state.arrAllCategoriesImages = arrAllCategoriesData.filter(
            item => {
              return item.parent_id != 0;
            },
          );
          this.state.customCategory = this.state.arrAllCategories.filter(
            item => {
              return item.id == '14';
            },
          )[0];
          this.state.arrCustomCategoryIcons = arrAllCategoriesData.filter(
            item => {
              return item.parent_id == 14;
            },
          );
          this.setState({});
          setTimeout(() => {
            this.handlePreviousItems();
          }, 1000);
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
    }).catch(e => {
      console.log('ERROR',e)
    });
  };

  callUpdateTask = () => {
    this.setState({isLoading: true});
    var taskId =
      this.props.navigation.state.params.dictCreateTask.scheduleDetails
        .sub_task_id;
    var childId = this.state.objSelectedChild.id;
    var mainCatId = this.state.selectedCategory.id;
    var subCatId = this.state.selectedSubCategory;
    var taskType = this.state.taskType;
    var timeSloteName = this.state.dictCreateTask['taskName'];
    var taskName = this.state.taskName;
    var taskDescription = this.state.customTaskDescription;
    var taskFromTime = this.state.dictCreateTask['fromTime'];
    var taskToTime = this.state.dictCreateTask['toTime'];
    var taskTime = this.state?.taskTime;
    var taskColor = this.state.dictCreateTask['taskColor'];
    var taskTokenType = this.state.taskTokenType || '';
    var taskNumberOfTokens = this.state.taskNumberOfToken;
    var taskDates = this.state.dictCreateTask['task_date'].join();
    var frequency = this.state.dictCreateTask['frequency'];
    var taskCustomIcon = this.state.taskCustomImage;
    var is_date = this.state.dictCreateTask['is_date'];
    var is_new = this.state.dictCreateTask['is_new'];
    var is_saved_for_future = this.state.isSavedForFuture == false ? 0 : 1;
    // var taskId =

    const res = objSecureAPI
      .updateTask(
        taskId,
        childId,
        mainCatId,
        subCatId,
        taskType,
        taskName,
        taskTime,
        taskTokenType,
        taskNumberOfTokens,
        is_saved_for_future,
      )
      .then(resJSON => {
        if (resJSON.ok && resJSON.status == 200) {
          this.setState({isLoading: false});
          if (resJSON.data.success) {
            this.state.totalTaskSlotMinutes =
              this.state.totalTaskSlotMinutes - this.state?.taskTime;
            try {
              AsyncStorage.setItem(
                Constants.KEY_SELECTED_CHILD,
                JSON.stringify(resJSON.data.data[0]),
              );
              // this.getChildDetail();
              Helper.showConfirmationMessagesignleAction(
                resJSON.data.message,
                'Ok',
              ).then(action => {
                if (action) {
                  this.setState({isLoading: false});
                  this.setTaskModelVisible();
                  this.props.navigation.goBack();
                }
              });
            } catch (error) {}
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
  renderRow(item, index) {
    return (
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => this.categorySelected(item)}>
        <Text style={styles.dropdownItemText}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  categorySelected = (category, dropdown = true) => {
    console.log('CCCCCCC',category)
    this.state.selectedCategory = category;
    this.state.arrSelectedCategoryImages =
      this.state.arrAllCategoriesImages.filter(item => {
        return item.parent_id == category.id;
      });
    this.setState({});
    if (dropdown) this.toggleDropdown();
  };

  renderTokenType(item, index) {
    return (
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => this.tokenTypeSelected(item)}>
        <Text style={styles.dropdownItemText}>{item}</Text>
      </TouchableOpacity>
    );
  }

  tokenTypeSelected = tokenType => {
    this.setState({
      taskTokenType: this.state.taskTokenType === tokenType ? '' : tokenType,
      typeOfTokensDropdown: false,
    });
  };

  renderTaskTime(item, index) {
    return (
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => this.taskTimeSelected(item)}>
        <Text style={styles.dropdownItemText}>{`${item} - ${index == 0 ? 'Minute' : 'Minutes'}`}</Text>
      </TouchableOpacity>
    );
  }

  taskTimeSelected = time => {
    this.setState({
      taskTime: time == null ? '' : time,
      timeForTaskDropdown: false,
    });
    this.RBSheetTimer?.close();
  };

  defaultTaskTimeSelected = time => {
    this.setState({
      taskTime: time,
    });
  };

  renderImages(item, index) {
    return (
      <TouchableOpacity
        style={[
          styles.taskIconTouch,
          this.state.arrSelectedTasksSubCatIds.includes(item.id)
            ? styles.taskIconTouchActive
            : '',
        ]}
        onPress={() => this.setTaskModelVisible(item)}>
        <Image source={{uri: item.image}} style={styles.taskIcon} />
      </TouchableOpacity>
    );
  }

  renderTimerBottomSheet = () => {
    return (
      <View style={{flex: 1, padding: 15}}>
        <FlatList
          keyboardShouldPersistTaps={'always'}
          data={this.state.arrTaskTime}
          extraData={this.state}
          keyExtractor={(item, index) => index}
          renderItem={({item, index}) => this.renderTaskTime(item, index)}
          contentContainerStyle={{paddingVertical: 15}}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };
  renderDefaultTaskTime(item, index) {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: Colors.cloud + 10,
          borderRadius: 20,
          paddingHorizontal: 20,
          marginRight: 15,
          paddingVertical: 10,
        }}
        onPress={() => this.defaultTaskTimeSelected(item)}>
        <Text style={styles.dropdownItemText}>{`${item} - Min`}</Text>
      </TouchableOpacity>
    );
  }

  setTaskModelVisible(item) {
    console.log('IIIIIIIITTTTTTTTEEEEEEEMMMMMM', item);
    if (
      this.state.selectedCategory == '' &&
      item &&
      !this.state.arrSelectedTasksSubCatIds.includes(item.id)
    ) {
      this.state.selectedCategory = this.state.arrAllCategories.filter(
        objCat => {
          return objCat.id == item.parent_id;
        },
      )[0];
    }

    this.state.taskType = item ? Constants.TASK_TYPE_DEFAULT : '';
    this.state.taskImage = item ? item.image : '';
    this.state.selectedSubCategory = item ? item.id : '';

    if (!item) {
      this.state.selectedCategory = '';
      this.state.taskName = '';
      this.state.taskTime = '';
      this.state.taskNumberOfToken = '';
      this.state.taskTokenType = '';
      (this.state.timeForTaskDropdown = false),
        (this.state.typeOfTokensDropdown = false);
    }

    const aModelVisible =
      item && !this.state.arrSelectedTasksSubCatIds.includes(item.id)
        ? !this.state.selectTaskModel
        : false;
    this.setState({selectTaskModel: aModelVisible, showDropdown: false});
  }

  moveToParentHomeScreen() {
    // this.props.navigation.push('ParentHomeScreen')
    Helper.resetNavigationToScreenWithStack(
      this.props.navigation,
      'ParentHomeScreen',
      'drawerStack',
    );
  }

  renderSelectIconImages(item, index) {
    return (
      <TouchableOpacity
        style={styles.taskIconTouch}
        onPress={() => this.selectIconImage(item)}>
        <Image source={{uri: item.image}} style={styles.taskIcon} />
      </TouchableOpacity>
    );
  }

  selectIconImage = img => {
    this.state.taskCustomImagePath = img.image;
    this.setState({
      selectedSubCategory: img.id,
    });
    this.setIconModel(false);
  };

  render() {
    return (
      <View
        style={styles.mainContainer}
        pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        <ImageBackground
          source={Images.blueBackground}
          style={styles.backgroundImage}>
          <ScrollView contentContainerStyle={[styles.ScrollView]}>
            <View style={[styles.container]}>
              <View style={styles.containerBody}>
                <View style={styles.taskList}>
                  <FlatList
                    keyboardShouldPersistTaps={'always'}
                    data={
                      this.state.selectedCategory?.id === 230
                        ? this.state.arrAllCategoriesImages
                        : this.state.arrSelectedCategoryImages
                    }
                    numColumns={4}
                    horizontal={false}
                    renderItem={({item, index}) =>
                      this.renderImages(item, index)
                    }
                    keyExtractor={(item, index) => index}
                  />
                </View>

                <View style={styles.formFooter}>
                  <View
                    style={[
                      styles.justifyFooter,
                      {paddingTop: 10, paddingBottom: 0},
                    ]}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.buttonPrimary,
                        {marginBottom: 0},
                      ]}
                      onPress={() =>
                        this.props.navigation.navigate('ParentHomeScreen')
                      }>
                      <Text style={styles.buttonText}>
                        {'Finished Creating Task/s '.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      styles.justifyFooter,
                      {paddingTop: 0, paddingBottom: 0},
                    ]}>
                    <TouchableOpacity
                      style={[styles.button, styles.buttonPrimary]}
                      onPress={() => this.setCreateTask()}>
                      <Text style={styles.buttonText}>
                        {'Create Custom Task '.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      justifyContent: 'space-around',
                      flexDirection: 'row',
                    }}>
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
                      onPress={() => this.moveToParentHomeScreen()}>
                      <Image
                        source={Images.circleArrowRight}
                        style={styles.circleArrow}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View>
                <View style={styles.clockHeader}>
                  <Text style={[styles.h1, styles.textCenter]}>
                    {'Select Task'.toUpperCase()}
                  </Text>
                </View>
                {this.state.showDropdown ? (
                  <TouchableOpacity
                    style={styles.bodyClose}
                    onPress={() => this.toggleDropdown()}></TouchableOpacity>
                ) : null}
                <View style={styles.dropdownContainer}>
                  {this.state.isLoading ? (
                    <Spinner color={'#FFFFFF'} size={'small'} />
                  ) : (
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
                        {this.state.selectedCategory == ''
                          ? 'SELECT CATEGORY'
                          : this.state.selectedCategory.name}
                      </Text>
                      <Image
                        source={Images.downarrow}
                        style={styles.downarrow}
                      />
                    </TouchableOpacity>
                  )}
                  {this.state.showDropdown ? (
                    <View style={[styles.dropdown, styles.dropdownLarge]}>
                      <FlatList
                        keyboardShouldPersistTaps={'always'}
                        data={this.state.arrAllCategories}
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
              </View>
            </View>
          </ScrollView>
        </ImageBackground>

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.selectTaskModel}>
          <View style={[styles.modal, styles.modalBlueTrans]}>
            <KeyboardAvoidingView
              style={styles.mainContainer}
              behavior={'padding'}>
              <View style={styles.modalView}>
                <ScrollView
                  style={[styles.modalDialog, {paddingVertical: 15}]}
                  contentContainerStyle={styles.ScrollView}>
                  <View style={[styles.container]}>
                    <View
                      style={[
                        styles.containerBody,
                        {flexDirection: 'column-reverse'},
                      ]}>
                      <View
                        style={[
                          styles.modalFooter,
                          styles.paddingNull,
                          {marginTop: 30},
                        ]}>
                        <TouchableOpacity
                          style={[
                            styles.button,
                            styles.buttonPrimary,
                            {marginTop: 0},
                          ]}
                          onPress={() => this.updateTask()}>
                          {this.state.isLoading ? (
                            <Spinner color={'#FFFFFF'} size={'small'} />
                          ) : (
                            <Text style={styles.buttonText}>
                              {'UPDATE TASK'}
                            </Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.button,
                            styles.buttonPrimary,
                            {marginTop: 0},
                          ]}
                          onPress={() => {
                            this.deleteTask();
                          }}>
                          {this.state.isDeletesubTaskLoading ? (
                            <Spinner color={'#FFFFFF'} size={'small'} />
                          ) : (
                            <Text style={styles.buttonText}>
                              {'DELETE TASK'}
                            </Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.button,
                            styles.buttonPrimary,
                            {marginTop: 0},
                          ]}
                          onPress={() => {
                            this.setTaskModelVisible();
                            this.props.navigation.goBack();
                          }}>
                          <Text style={styles.buttonText}>{'CANCEL'}</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{flexGrow: 1}}>
                        <View style={styles.modalTopheader}>
                          <TouchableOpacity
                            style={styles.modalCloseTouch}
                            onPress={() => {
                              this.setState({isLoading: false});
                              this.setTaskModelVisible();
                              this.props.navigation.goBack();
                            }}>
                            <Image
                              source={Images.close}
                              style={[styles.close, {tintColor: Colors.black}]}
                            />
                          </TouchableOpacity>
                          <View
                            style={{
                              padding: 15,
                              borderRadius: 15,
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor:
                                this.state.dictCreateTask['taskColor'],
                              alignSelf: 'center',
                              marginTop: 20,
                            }}>
                            <Image
                              source={{uri: this.state.taskImage}}
                              style={styles.taskIconLarge}
                            />
                          </View>
                        </View>

                        <View style={{marginTop: 30}}>
                          <View style={{marginVertical: 10}}>
                            <Text style={[styles.dropdownButtonText]}>
                              Enter Task Name
                            </Text>
                            <TextInput
                              value={this.state.taskName.toUpperCase()}
                              style={{
                                borderWidth: 1,
                                borderColor: Colors.gray,
                                padding: Platform.OS === 'ios' ? 15 : null,
                                borderRadius: 5,
                                marginTop: 10,
                              }}
                              autoCapitalize="characters"
                              underlineColorAndroid={'transparent'}
                              returnKeyType={'done'}
                              placeholder={'Task Name'.toUpperCase()}
                              onChangeText={name => {
                                (this.state.taskName = name.toUpperCase()),
                                  this.setState({});
                              }}
                              onSubmitEditing={event => {}}
                              maxLength={20}
                            />
                          </View>

                          <View style={{marginVertical: 10}}>
                            <RBSheet
                              ref={ref => {
                                this.RBSheetTimer = ref;
                              }}
                              height={Dimensions.get('window').height / 2.4}
                              width={Dimensions.get('window').width}
                              openDuration={250}>
                              {this.renderTimerBottomSheet()}
                            </RBSheet>
                            <Text style={[styles.dropdownButtonText]}>
                              Set a Timer
                            </Text>
                            <TouchableOpacity
                              onPress={() => this.RBSheetTimer.open()}
                              style={{
                                flex: 1,
                                padding: 14,
                                borderWidth: 1,
                                borderColor: Colors.gray,
                                borderRadius: 5,
                                // justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'row',
                                backgroundColor: Colors.white,
                                marginTop: 10,
                              }}>
                              <Text
                                style={[
                                  styles.mediumButtonText,
                                  {
                                    color: this.state.taskTime
                                      ? Colors.charcoal
                                      : Colors.gray,
                                  },
                                ]}>
                                {this.state.taskTime
                                  ? this.state.taskTime + ' Minutes'
                                  : 'Select Time'}
                              </Text>
                              <TouchableOpacity
                                style={{
                                  padding: 5,
                                  position: 'absolute',
                                  right: 5,
                                }}
                                onPress={() => this.setState({taskTime: ''})}>
                                <Image
                                  source={images.cross}
                                  style={{
                                    width: 24,
                                    height: 24,
                                    tintColor: Colors.charcoal,
                                  }}
                                />
                              </TouchableOpacity>
                            </TouchableOpacity>
                            <FlatList
                              data={this.state.arrDefaultTaskTime}
                              extraData={this.state}
                              keyExtractor={(item, index) => index}
                              renderItem={({item, index}) =>
                                this.renderDefaultTaskTime(item, index)
                              }
                              contentContainerStyle={{paddingVertical: 15}}
                              showsVerticalScrollIndicator={false}
                              keyboardShouldPersistTaps={'always'}
                              horizontal
                              showsHorizontalScrollIndicator={false}
                            />
                          </View>

                          <View style={{marginVertical: 10}}>
                            <Text style={[styles.dropdownButtonText]}>
                              Type Of Tokens
                            </Text>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}>
                              <TouchableOpacity
                                onPress={() =>
                                  this.tokenTypeSelected(
                                    Constants.TASK_TOKEN_STANDARD,
                                  )
                                }
                                style={{
                                  flex: 0.45,
                                  paddingVertical: 11,
                                  borderWidth:
                                    this.state.taskTokenType ===
                                    Constants.TASK_TOKEN_STANDARD
                                      ? 2
                                      : 1,
                                  borderColor:
                                    this.state.taskTokenType ===
                                    Constants.TASK_TOKEN_STANDARD
                                      ? Colors.darkPink
                                      : Colors.gray,
                                  borderRadius: 5,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  flexDirection: 'row',
                                  backgroundColor:
                                    this.state.taskTokenType ===
                                    Constants.TASK_TOKEN_STANDARD
                                      ? Colors.pink + 15
                                      : Colors.white,
                                }}>
                                <Image
                                  source={Constants.standardRewardIcon}
                                  style={{width: 24, height: 24}}
                                />
                                <Text
                                  style={[
                                    styles.mediumButtonText,
                                    {color: Colors.charcoal},
                                  ]}>
                                  {Constants.TASK_TOKEN_STANDARD}
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                onPress={() =>
                                  this.tokenTypeSelected(
                                    Constants.TASK_TOKEN_SPECIAL,
                                  )
                                }
                                style={{
                                  flex: 0.45,
                                  paddingVertical: 11,
                                  borderWidth:
                                    this.state.taskTokenType ===
                                    Constants.TASK_TOKEN_SPECIAL
                                      ? 2
                                      : 1,
                                  borderColor:
                                    this.state.taskTokenType ===
                                    Constants.TASK_TOKEN_SPECIAL
                                      ? Colors.darkPink
                                      : Colors.gray,
                                  borderRadius: 5,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  flexDirection: 'row',
                                  backgroundColor:
                                    this.state.taskTokenType ===
                                    Constants.TASK_TOKEN_SPECIAL
                                      ? Colors.pink + 15
                                      : Colors.white,
                                }}>
                                <Image
                                  source={Images.reward}
                                  style={{width: 24, height: 24}}
                                />
                                <Text
                                  style={[
                                    styles.mediumButtonText,
                                    {color: Colors.charcoal},
                                  ]}>
                                  {Constants.TASK_TOKEN_SPECIAL}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View style={{marginVertical: 10}}>
                            <Text style={[styles.dropdownButtonText]}>
                              {'Number Of Tokens'.toUpperCase()}
                            </Text>
                            <TextInput
                              style={{
                                borderWidth: 1,
                                borderColor: Colors.gray,
                                padding: Platform.OS === 'ios' ? 15 : null,
                                borderRadius: 5,
                                marginTop: 10,
                              }}
                              autoCapitalize="characters"
                              underlineColorAndroid={'transparent'}
                              returnKeyType={'done'}
                              placeholder={'Number Of Tokens'.toUpperCase()}
                              maxLength={20}
                              value={this.state.taskNumberOfToken}
                              keyboardType={'numeric'}
                              onChangeText={token =>
                                this.setState({taskNumberOfToken: token})
                              }
                              onSubmitEditing={event => {}}
                            />
                          </View>

                          <TouchableOpacity
                            style={{
                              marginVertical: 10,
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                            onPress={() => {
                              this.setState({
                                isSavedForFuture: !this.state.isSavedForFuture,
                              });
                            }}>
                            <Image
                              source={
                                this.state.isSavedForFuture
                                  ? Images.checked
                                  : Images.unchecked
                              }
                              style={{width: 18, height: 18, marginRight: 5}}
                            />
                            <Text style={[styles.dropdownButtonText]}>
                              Save This Task For Future Reference.
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
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
              <KeyboardAvoidingView
                style={styles.mainContainer}
                behavior={'padding'}>
                <ScrollView contentContainerStyle={styles.ScrollView}>
                  <TouchableOpacity
                    style={styles.modalCloseTouch}
                    onPress={() => {
                      this.setCreateTask();
                    }}>
                    <Image source={Images.close} style={styles.close} />
                  </TouchableOpacity>
                  <View
                    style={[
                      styles.containerBody,
                      {flexDirection: 'column-reverse'},
                    ]}>
                    <View style={styles.modalFooter}>
                      <TouchableOpacity
                        style={[
                          styles.button,
                          styles.buttonPrimary,
                          {marginTop: 0},
                        ]}
                        onPress={() => this.createCustomTask()}>
                        {this.state.isLoading ? (
                          <Spinner />
                        ) : (
                          <Text style={styles.buttonText}>
                            {'Create'.toUpperCase()}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    <View style={styles.modalBody}>
                      <Text style={[styles.h1, styles.textCenter]}>
                        {'CREATE CUSTOM TASK'}
                      </Text>
                      <View style={styles.content}>
                        <View style={styles.form}>
                          <View
                            style={[
                              styles.formControl,
                              styles.formControlSmall,
                            ]}>
                            <TextInput
                              style={styles.input}
                              value={this.state.customTaskName.toUpperCase()}
                              autoCapitalize="characters"
                              placeholder={'Name'.toUpperCase()}
                              placeholderTextColor={'#fff'}
                              underlineColorAndroid={'transparent'}
                              returnKeyType={'next'}
                              onChangeText={customTaskName =>
                                this.setState({customTaskName})
                              }
                              onSubmitEditing={event => {}}
                            />
                          </View>

                          <View style={styles.iconContainer}>
                            <View style={styles.imageUploader}>
                              <View style={styles.uploadView}>
                                <Image
                                  source={
                                    this.state.taskCustomImagePath
                                      ? {uri: this.state.taskCustomImagePath}
                                      : Images.upload
                                  }
                                  style={
                                    this.state.taskCustomImagePath
                                      ? styles.uploadedImage
                                      : styles.uploadPlaceholder
                                  }
                                />
                              </View>
                              <View style={styles.buttonRight}>
                                <TouchableOpacity
                                  style={[
                                    styles.button,
                                    styles.smallButton,
                                    styles.buttonCarrot,
                                    {marginBottom: 0},
                                  ]}
                                  onPress={() => this.setIconModel(true)}>
                                  <Text style={styles.smallButtonText}>
                                    {'Select Icon'.toUpperCase()}
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[
                                    styles.button,
                                    styles.smallButton,
                                    styles.buttonCarrot,
                                  ]}
                                  onPress={() => this.onPressOpenImagePicker()}>
                                  <Text style={styles.smallButtonText}>
                                    {'Custom Icon'.toUpperCase()}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                            <View style={{flexDirection: 'column-reverse'}}>
                              <View style={styles.frm}>
                                <View style={styles.inline}>
                                  <Text
                                    style={[
                                      styles.label,
                                      {marginBottom: 0, paddingBottom: 0},
                                    ]}>
                                    {'NUMBER OF TOKENS'.toUpperCase()}
                                  </Text>
                                  <View style={{flex: 1, paddingLeft: 15}}>
                                    <TextInput
                                      value={this.state.taskNumberOfToken}
                                      style={[
                                        styles.inputItem,
                                        styles.buttonBorder,
                                      ]}
                                      underlineColorAndroid={'transparent'}
                                      returnKeyType={'next'}
                                      keyboardType={'numeric'}
                                      onChangeText={token =>
                                        this.setState({
                                          taskNumberOfToken: token,
                                        })
                                      }
                                      onSubmitEditing={event => {}}
                                    />
                                  </View>
                                </View>
                              </View>
                              <View style={styles.frm}>
                                <Text style={[styles.label]}>
                                  {'TOKEN FOR TASK'}
                                </Text>
                                <TouchableOpacity
                                  style={styles.dropdownButton}
                                  onPress={() =>
                                    this.toggleTypeOfTokenDropdown()
                                  }>
                                  <Text style={styles.dropdownButtonText}>
                                    {this.state.taskTokenType
                                      ? this.state.taskTokenType
                                      : 'TYPE OF TOKENS'}
                                  </Text>
                                  <Image
                                    source={Images.downarrow}
                                    style={styles.downarrow}
                                  />
                                </TouchableOpacity>
                                {this.state.typeOfTokensDropdown ? (
                                  <View
                                    style={[
                                      styles.dropdown,
                                      styles.dropdownSmall,
                                    ]}>
                                    <FlatList
                                      keyboardShouldPersistTaps={'always'}
                                      data={this.state.arrTypeOfTokens}
                                      extraData={this.state}
                                      keyExtractor={(item, index) => index}
                                      renderItem={({item, index}) =>
                                        this.renderTokenType(item, index)
                                      }
                                      contentContainerStyle={{padding: 0}}
                                    />
                                  </View>
                                ) : null}
                              </View>
                              <View style={styles.frm}>
                                <View style={styles.inline}>
                                  <Text
                                    style={[
                                      styles.label,
                                      {marginBottom: 0, paddingBottom: 0},
                                    ]}>
                                    {'SET TIMER FOR TASK'}
                                  </Text>
                                  <View style={{flex: 1, paddingLeft: 15}}>
                                    <TouchableOpacity
                                      style={styles.dropdownButton}
                                      onPress={() =>
                                        this.toggleTimeForTokenDropdown()
                                      }>
                                      <Text style={styles.dropdownButtonText}>
                                        {this.state.taskTime
                                          ? this.state.taskTime + ' Minutes'
                                          : ''}
                                      </Text>
                                      <Image
                                        source={Images.downarrow}
                                        style={styles.downarrow}
                                      />
                                    </TouchableOpacity>
                                  </View>
                                  {this.state.timeForTaskDropdown ? (
                                    <View
                                      style={[
                                        styles.dropdown,
                                        styles.dropdownSmall,
                                      ]}>
                                      <FlatList
                                        keyboardShouldPersistTaps={'always'}
                                        data={this.state.arrTaskTime}
                                        extraData={this.state}
                                        keyExtractor={(item, index) => index}
                                        renderItem={({item, index}) =>
                                          this.renderTaskTime(item, index)
                                        }
                                        contentContainerStyle={{padding: 0}}
                                      />
                                    </View>
                                  ) : null}
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
                      this.setIconModel(false);
                    }}>
                    <View style={[styles.modal, styles.modalRandTrans]}>
                      <SafeAreaView style={styles.SafeAreaView}>
                        <KeyboardAvoidingView
                          style={styles.mainContainer}
                          behavior={'padding'}>
                          <ScrollView contentContainerStyle={styles.ScrollView}>
                            <View style={styles.modalHeader}>
                              <View style={styles.modalHeaderRight} />
                              <View style={styles.modalHeaderRight}>
                                <TouchableOpacity
                                  onPress={() => {
                                    this.setIconModel(false);
                                  }}>
                                  <Icon name="times" size={26} color={'#fff'} />
                                </TouchableOpacity>
                              </View>
                            </View>
                            <View style={styles.modalBody}>
                              <Text style={[styles.h1, styles.textCenter]}>
                                {'SELECT ICON'}
                              </Text>
                              <View style={[styles.container]}>
                                <View style={styles.containerBody}>
                                  <View style={styles.taskList}>
                                    {this.state.arrCustomCategoryIcons.length >
                                    0 ? (
                                      <FlatList
                                        keyboardShouldPersistTaps={'always'}
                                        data={this.state.arrCustomCategoryIcons}
                                        extraData={this.state}
                                        numColumns={4}
                                        renderItem={({item, index}) =>
                                          this.renderSelectIconImages(
                                            item,
                                            index,
                                          )
                                        }
                                        keyExtractor={(item, index) => index}
                                      />
                                    ) : (
                                      <Text>
                                        {'NO CUSTOM ICONS AVAILABLE YET'}
                                      </Text>
                                    )}
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
    );
  }
  //#endregion
}
