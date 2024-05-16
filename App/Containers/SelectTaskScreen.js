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
  Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import BaseComponent from '../Components/BaseComponent';
import Constants from '../Components/Constants';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import {Colors, Images, Metrics} from '../Themes';
import Moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';
import RBSheet from 'react-native-raw-bottom-sheet';

// Styles
import styles from './Styles/SelectTaskScreenStyles';
import images from '../Themes/Images';
import colors from '../Themes/Colors';

// Global Variables
const objSecureAPI = Api.createSecure();

export default class SelectTaskScreen extends BaseComponent {
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
      selectedCategory: {
        id: 230,
        image: '',
        name: 'All Categories',
        parent_id: 0,
      },
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
      isAllCategoriesSelected: true,
      isCustomSelected: false,
      isSavedSelected: false,
      isSaveForFuture: 0,
      savedTaskList: [],
      createdTaskCount: 0,
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
    this.getTaskCategories();
    this.getChildDetail();
    this.navFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        Helper.getChildRewardPoints(this.props.navigation);
      },
    );
  }
  //#endregion

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
          this.getSavedtask();
        });
      }
    });
  };

  setCreateTask() {
    this.setState({createTask: !this.state.createTask}, () => {
      this.state.taskType = this.state.createTask
        ? Constants.TASK_TYPE_CUSTOM
        : '';
      this.state.customTaskName = '';
      this.state.taskCustomImage = '';
      this.state.taskCustomImagePath = '';
      this.setState({});
    });
  }

  setIconModel = boolVar => {
    this.setState({selectIconModel: boolVar});
  };

  createCustomTask = () => {
    if (this.state.taskCustomImagePath === '') {
      Helper.showErrorMessage(Constants.MESSAGE_CREATE_TASK_NO_IMAGE);
      return false;
    } else {
      this.addTask();
    }
  };

  addTask = () => {
    if (this.isValidator()) {
      this.callAddTask();
    }
  };

  isValidator = () => {
    if (
      (this.state.taskType === Constants.TASK_TYPE_DEFAULT
        ? this.state.taskName
        : this.state.customTaskName
      ).trim() == ''
    ) {
      Helper.showErrorMessage(Constants.MESSAGE_NO_TASK_NAME);
      return false;
    }
    // else if (this.state.taskTime.trim() == '') {
    //   Helper.showErrorMessage(Constants.MESSAGE_SELECT_TASK_TIME);
    //   return false;
    // }
    // else if (this.state.taskNumberOfToken.trim() == '') {
    //     Helper.showErrorMessage(Constants.MESSAGE_NO_TASK_TOKEN);
    //     return false;
    // }
    // else if ((this.state.taskType === Constants.TASK_TYPE_CUSTOM) && this.state.taskCustomImagePath === '') {
    //     Helper.showErrorMessage(Constants.MESSAGE_NO_TASK_ICON);
    //     return false;
    // }
    // else if (this.state.totalTaskSlotMinutes <  this.state.taskTime){
    //     Helper.showErrorMessage(Constants.MESSAGE_NO_GREATER_TASK);
    //     return false;
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
    const res = objSecureAPI.getCategories().then(resJSON => {
      if (resJSON.ok && resJSON.status == 200) {
        this.setState({isLoading: false});
        if (resJSON.data.success) {
          const allCategories = {
            id: 230,
            image: '',
            name: 'All Categories',
            parent_id: 0,
          };
          console.log('RESSSSSSS', resJSON.data.data);
          var arrAllCategoriesData = resJSON.data.data;
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
              return item.name === 'Custom';
            },
          )[0];
          this.state.arrCustomCategoryIcons = arrAllCategoriesData.filter(
            item => {
              return item.parent_id == this.state.customCategory.id;
            },
          );
          this.setState({});
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

  getSavedtask = () => {
    this.setState({isLoading: true});
    const res = objSecureAPI
      .getSavedtask(this.state.objSelectedChild.id)
      .then(resJSON => {
        if (resJSON.ok && resJSON.status == 200) {
          this.setState({isLoading: false});
          console.log('resJSON.data.data',resJSON.data.data)
          if (resJSON.data.success) {
            this.state.savedTaskList = resJSON.data.data;
            this.setState({});
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

  callAddTask = () => {
    this.setState({isLoading: true});
    var childId = this.state.objSelectedChild.id;
    var mainCatId = this.state.selectedCategory.id;
    var subCatId = this.state.selectedSubCategory;
    var taskType = this.state.taskType;
    var timeSloteName = this.state.dictCreateTask['taskName'];
    var taskName =
      taskType === Constants.TASK_TYPE_DEFAULT
        ? this.state.taskName
        : this.state.customTaskName;
    var taskDescription = this.state.customTaskDescription;
    var taskFromTime = this.state.dictCreateTask['fromTime'];
    var taskToTime = this.state.dictCreateTask['toTime'];
    var taskTime = this.state.taskTime;
    var taskColor = this.state.dictCreateTask['taskColor'];
    var taskTokenType = this.state.taskTokenType || '';
    var taskNumberOfTokens = this.state.taskNumberOfToken;
    var taskDates = this.state.dictCreateTask['task_date'].join();
    var frequency = this.state.dictCreateTask['frequency'];
    var taskCustomIcon = this.state.taskCustomImage;
    var is_date = this.state.dictCreateTask['is_date'];
    var is_school_clock = this.state.dictCreateTask['is_school_clock'];
    var is_saved_for_future = this.state.isSaveForFuture;
    var task_id = this.state.dictCreateTask['task_id'];
    var from_listing = this.state.dictCreateTask['from_listing'];
    var is_new = this.state.dictCreateTask['is_new'];

    const res = objSecureAPI
      .addTask(
        childId,
        mainCatId,
        subCatId,
        taskType,
        timeSloteName,
        taskName,
        taskDescription,
        taskFromTime,
        taskToTime,
        taskTime,
        taskColor,
        taskTokenType,
        taskNumberOfTokens,
        taskDates,
        taskCustomIcon,
        frequency,
        is_date,
        is_school_clock,
        is_saved_for_future,
        task_id,
        from_listing,
        is_new,
      )
      .then(resJSON => {
        if (resJSON.ok && resJSON.status == 200) {
          this.setState({isLoading: false});
          if (resJSON.data.success) {
            this.state.totalTaskSlotMinutes =
              this.state.totalTaskSlotMinutes - this.state.taskTime;
            try {
              AsyncStorage.setItem(
                Constants.KEY_SELECTED_CHILD,
                JSON.stringify(resJSON.data.data[0]),
              );
              this.getChildDetail();
              this.setState({
                createdTaskCount: this.state.createdTaskCount + 1,
              });
              this.setState({
                taskName: '',
                taskTokenType: '',
                taskNumberOfToken: '',
                taskImage: '',
                taskTime: '',
                taskCustomImage: '',
                taskCustomImagePath: '',
                isSaveForFuture: 0
              });
              Helper.showConfirmationMessagesignleAction(
                resJSON.data.message,
                'Ok',
              ).then(action => {
                if (action) {
                  if (this.state.taskType === Constants.TASK_TYPE_DEFAULT) {
                    this.setTaskModelVisible();
                    // this.moveToParentHomeScreen();
                  } else {
                    this.setCreateTask();
                    this.getTaskCategories();
                  }
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
        style={[styles.dropdownItem, {flex: 1, paddingVertical: 15}]}
        onPress={() => this.categorySelected(item)}>
        <Text style={styles.dropdownItemText}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  categorySelected = category => {
    this.state.selectedCategory = category;
    this.state.arrSelectedCategoryImages =
      this.state.arrAllCategoriesImages.filter(item => {
        return item.parent_id == category.id;
      });
    this.setState({});
    this.RBSheet.close();
  };

  renderTokenType(item, index) {
    return (
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => this.tokenTypeSelected(item)}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          {index == 0 ? (
            <Image source={Images.everyday} style={[styles.dropdownImage]} />
          ) : (
            <Image source={Images.special} style={[styles.dropdownImage]} />
          )}
          <Text style={[styles.dropdownItemText]}>{item}</Text>
        </View>
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
        <Text style={styles.dropdownItemText}>{`${item} - Minute`}</Text>
      </TouchableOpacity>
    );
  }

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

  taskTimeSelected = time => {
    this.setState({
      taskTime: time,
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
          {
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            width: '22%',
          },
        ]}
        onPress={() => this.setTaskModelVisible(item)}>
        <Image source={{uri: item.image}} style={styles.taskIcon} />
      </TouchableOpacity>
    );
  }

  renderSavedTaskList(item, index) {
    return (
      <TouchableOpacity
        style={[
          styles.taskIconTouch,
          this.state.arrSelectedTasksSubCatIds.includes(item.id)
            ? styles.taskIconTouchActive
            : '',
          {
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            width: '22%',
          },
        ]}
        onPress={() => this.setSavedTaskModelVisible(item)}>
        <Image source={{uri: item.image}} style={styles.taskIcon} />
        <TouchableOpacity
          onPress={() => this.onsavedTaskDeletePress(item)}
          style={{
            padding: 5,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: Colors.snow,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 10000,
          }}>
          <Image
            source={Images.bin}
            style={{
              width: 15,
              height: 15,
              // tintColor: colors.black,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  onsavedTaskDeletePress = item => {
    Helper.showConfirmationMessageActions(
      'Are You sure you want to delete this saved task ?',
      'No',
      'Yes',
      () => {},
      () => this.onActionYes(item),
    );
  };

  onActionYes = item => {
    const res = objSecureAPI
      .deleteSavedtask(item?.id, this.state.objSelectedChild.id)
      .then(resJSON => {
        if (resJSON.ok && resJSON.status == 200) {
          this.setState({isLoading: false});
          if (resJSON.data.success) {
            this.getSavedtask();
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

  setTaskModelVisible(item) {
    // if (
    //   this.state.selectedCategory == '' &&
    //   item &&
    //   !this.state.arrSelectedTasksSubCatIds.includes(item.id)
    // ) {
    //   this.state.selectedCategory = this.state.arrAllCategories.filter(
    //     objCat => {
    //       return objCat.id == item.parent_id;
    //     },
    //   )[0];
    // }

    this.state.taskType = item ? Constants.TASK_TYPE_DEFAULT : '';
    this.state.taskImage = item ? item.image : '';
    this.state.selectedSubCategory = item ? item.id : '';

    if (!item) {
      // this.state.selectedCategory = '';
      this.state.taskName = '';
      this.state.taskTime = '';
      this.state.taskNumberOfToken = '';
      this.state.taskTokenType = '';
      (this.state.timeForTaskDropdown = false),
        (this.state.typeOfTokensDropdown = false);
    }

    const aModelVisible = item ? !this.state.selectTaskModel : false;
    this.setState({selectTaskModel: aModelVisible, showDropdown: false});
  }

  setSavedTaskModelVisible(item) {
    // this.state.taskType = item ? Constants.TASK_TYPE_DEFAULT : ''
    // this.state.taskName = item?.task_name;
    // this.state.taskTime = item?.task_time;
    // this.state.taskNumberOfToken = item?.no_of_token;
    // this.state.taskTokenType = item?.token_type;
    // this.state.taskImage = item.image;
    // const aModelVisible = item ? !this.state.selectTaskModel : false;
    // this.state.isSaveForFuture = true
    // this.setState({})
    // this.setState({selectTaskModel: aModelVisible, showDropdown: false});

    this.state.taskType = item ? Constants.TASK_TYPE_DEFAULT : '';
    this.state.taskImage = item ? item.image : '';
    this.state.selectedSubCategory = item ? item.ccid : '';

    if (!item) {
      // this.state.selectedCategory = '';
      this.state.taskName = '';
      this.state.taskTime = '';
      this.state.taskNumberOfToken = '';
      this.state.taskTokenType = '';
      (this.state.timeForTaskDropdown = false),
        (this.state.typeOfTokensDropdown = false);
    } else {
      this.state.taskName = item?.task_name;
      this.state.taskTime = item?.task_time;
      this.state.taskNumberOfToken = item?.no_of_token;
      this.state.taskTokenType = item?.token_type;
      this.state.isSaveForFuture = true;
      this.setState({});
    }

    const aModelVisible = item ? !this.state.selectTaskModel : false;
    this.setState({selectTaskModel: aModelVisible, showDropdown: false});
  }

  moveToParentHomeScreen() {
    Helper.showConfirmationMessageActions(
      'Have you finished adding tasks to this block of time?',
      'No',
      'Yes',
      () => {},
      () => this.onFinishAddingYes(),
    );
    // this.props.navigation.push('ParentHomeScreen')
  }

  onFinishAddingYes() {
    Helper.showConfirmationMessageSingleAction(
      'If you wish to add, edit or delete tasks or blocks of time you can do so from the Schedule in the menu bar',
      'OK',
      () => this.onActionOK(),
    );
  }

  onActionOK() {
    this.setState({createdTaskCount: 0});
    Helper.getChildRewardPoints(this.props.navigation);
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

  onAllCategoiresClick = () => {
    this.setState({
      isAllCategoriesSelected: true,
      isSavedSelected: false,
      isCustomSelected: false,
    });
  };

  onCustomClick = () => {
    this.setState({
      isAllCategoriesSelected: false,
      isSavedSelected: false,
      isCustomSelected: true,
    });
  };

  onSavedClick = () => {
    this.setState({
      isAllCategoriesSelected: false,
      isSavedSelected: true,
      isCustomSelected: false,
    });
  };

  renderCategoriesBottomSheet = () => {
    return (
      <View style={{flex: 1, padding: 15}}>
        <FlatList
          keyboardShouldPersistTaps={'always'}
          data={this.state.arrAllCategories.sort((a, b) =>
            a.name.localeCompare(b.name),
          )}
          extraData={this.state}
          keyExtractor={(item, index) => index}
          renderItem={({item, index}) => this.renderRow(item, index)}
          contentContainerStyle={{paddingVertical: 15}}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

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

  renderAllCategoriesView = () => {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          onPress={() => this.RBSheet.open()}
          style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={[styles.tokensText]}>
            {this.state.selectedCategory.name}
          </Text>
          <Image
            source={Images.arrowDown}
            style={[styles.downarrow, {marginLeft: 3}]}
          />
        </TouchableOpacity>
        <RBSheet
          ref={ref => {
            this.RBSheet = ref;
          }}
          height={Dimensions.get('window').height / 1.4}
          width={Dimensions.get('window').width}
          openDuration={250}>
          {this.renderCategoriesBottomSheet()}
        </RBSheet>
        <View style={[{marginTop: 15, flex: 1}]}>
          <FlatList
            keyboardShouldPersistTaps={'always'}
            data={
              this.state.selectedCategory?.id === 230
                ? this.state.arrAllCategoriesImages
                : this.state.arrSelectedCategoryImages
            }
            numColumns={4}
            horizontal={false}
            renderItem={({item, index}) => this.renderImages(item, index)}
            keyExtractor={(item, index) => index}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    );
  };

  renderCustomView = () => {
    return (
      <View style={{flex: 1}}>
        <View style={[{marginTop: 15, flex: 1}]}>
          <FlatList
            keyboardShouldPersistTaps={'always'}
            data={this.state.arrCustomCategoryIcons}
            numColumns={4}
            horizontal={false}
            renderItem={({item, index}) => this.renderImages(item, index)}
            keyExtractor={(item, index) => index}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    );
  };

  renderSavedView = () => {
    return (
      <View style={{flex: 1}}>
        <View style={[{marginTop: 15, flex: 1}]}>
          <FlatList
            keyboardShouldPersistTaps={'always'}
            data={this.state.savedTaskList}
            numColumns={4}
            horizontal={false}
            renderItem={({item, index}) =>
              this.renderSavedTaskList(item, index)
            }
            keyExtractor={(item, index) => index}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    );
  };

  render() {
    return (
      <View
        style={styles.mainContainer}
        pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        <ImageBackground
          source={Images.blueBackground}
          style={styles.backgroundImage}>
          <View style={[styles.clockHeader, {paddingHorizontal: 20, flex: 1}]}>
            <Text style={[styles.h1, styles.textCenter]}>
              {'Select Task'.toUpperCase()}
            </Text>
            <View
              style={{
                width: '100%',
                height: 0.8,
                backgroundColor: Colors.snow,
                marginVertical: 20,
              }}
            />

            <View
              style={{
                width: '100%',
                paddingVertical: 10,
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 10,
                backgroundColor: Colors.BgEarlyMorning,
                // flex:1
              }}>
              <TouchableOpacity
                onPress={this.onAllCategoiresClick}
                style={{
                  paddingVertical: 15,
                  // paddingHorizontal: 10,
                  backgroundColor: this.state.isAllCategoriesSelected
                    ? Colors.white
                    : 'transparent',
                  borderRadius: 10,
                  flex: 0.32,
                }}>
                <Text
                  style={[
                    styles.dropdownButtonText,
                    styles.textCenter,
                    {
                      color: this.state.isAllCategoriesSelected
                        ? Colors.black
                        : Colors.white,
                    },
                  ]}>
                  All Categories
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.onCustomClick}
                style={{
                  paddingVertical: 15,
                  // paddingHorizontal: 10,
                  backgroundColor: this.state.isCustomSelected
                    ? Colors.white
                    : 'transparent',
                  borderRadius: 10,
                  flex: 0.32,
                }}>
                <Text
                  style={[
                    styles.dropdownButtonText,
                    styles.textCenter,
                    {
                      color: this.state.isCustomSelected
                        ? Colors.black
                        : Colors.white,
                    },
                  ]}>
                  Custom
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.onSavedClick}
                style={{
                  paddingVertical: 15,
                  // paddingHorizontal: 10,
                  backgroundColor: this.state.isSavedSelected
                    ? Colors.white
                    : 'transparent',
                  borderRadius: 10,
                  flex: 0.32,
                }}>
                <Text
                  style={[
                    styles.dropdownButtonText,
                    styles.textCenter,
                    {
                      color: this.state.isSavedSelected
                        ? Colors.black
                        : Colors.white,
                    },
                  ]}>
                  Saved
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{flex: 1, marginTop: 20}}>
              {this.state.isAllCategoriesSelected &&
                this.renderAllCategoriesView()}

              {this.state.isCustomSelected && this.renderCustomView()}

              {this.state.isSavedSelected && this.renderSavedView()}
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 15,
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: Colors.pink,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 15,
                }}
                onPress={() => {
                  this.setCreateTask();
                }}>
                <Image
                  source={Images.add}
                  style={[
                    styles.reward_star,
                    {tintColor: Colors.white, marginRight: 10},
                  ]}
                />
                <Text style={styles.mediumButtonText}>Add Custom Task</Text>
              </TouchableOpacity>

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  disabled={this.state.createdTaskCount == 0 ? false : true}
                  style={[
                    styles.nextButton,
                    {opacity: this.state.createdTaskCount == 0 ? 1 : 0.4},
                  ]}
                  onPress={() => this.props.navigation.goBack()}>
                  <Image
                    source={Images.circleArrowLeft}
                    style={[styles.circleArrow]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextButton, {marginLeft: 15}]}
                  onPress={() => {
                    if (this.state.createdTaskCount) {
                      this.moveToParentHomeScreen();
                    } else {
                      Helper.showErrorMessage(
                        Constants.MESSAGE_NO_CREATE_TASK_ERROR,
                      );
                    }
                  }}>
                  <Image
                    source={Images.circleArrowRight}
                    style={styles.circleArrow}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.selectTaskModel}
          onRequestClose={() => {}}>
          <View style={[styles.modal, styles.modalBlueTrans]}>
            <KeyboardAvoidingView
              style={[styles.mainContainer]}
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
                          onPress={() => this.addTask()}>
                          {this.state.isLoading ? (
                            <Spinner color={'#FFFFFF'} size={'small'} />
                          ) : (
                            <Text style={styles.buttonText}>{'SAVE'}</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                      <View style={{flexGrow: 1}}>
                        <View style={styles.modalTopheader}>
                          <TouchableOpacity
                            style={styles.modalCloseTouch}
                            onPress={() => {
                              this.setState({isLoading: false});
                              this.setTaskModelVisible();
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
                              onPress={() => this.RBSheetTimer?.open()}
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
                              placeholder={'Number of tokens'.toUpperCase()}
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
                                isSaveForFuture:
                                  this.state.isSaveForFuture == 0 ? 1 : 0,
                              });
                            }}>
                            <Image
                              source={
                                this.state.isSaveForFuture
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
            <KeyboardAvoidingView
              style={styles.mainContainer}
              behavior={'padding'}>
              <ScrollView
                style={[styles.modalDialog, {paddingVertical: 15}]}
                contentContainerStyle={styles.ScrollView}>
                <View style={[styles.container]}>
                  {/* <TouchableOpacity
                    style={styles.modalCloseTouch}
                    onPress={() => {
                      this.setCreateTask();
                    }}>
                    <Image source={Images.close} style={[styles.close]} />
                  </TouchableOpacity> */}
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
                        onPress={() => this.createCustomTask()}>
                        {this.state.isLoading ? (
                          <Spinner color={'#FFFFFF'} size={'small'} />
                        ) : (
                          <Text style={styles.buttonText}>{'SAVE'}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    <View style={styles.modalBody}>
                      <View style={styles.modalTopheader}>
                        <TouchableOpacity
                          style={styles.modalCloseTouch}
                          onPress={() => {
                            this.setCreateTask();
                          }}>
                          <Image
                            source={Images.close}
                            style={[styles.close, {tintColor: Colors.black}]}
                          />
                        </TouchableOpacity>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 20,
                          }}>
                          <View
                            style={[
                              styles.uploadView,
                              {backgroundColor: Colors.gray + 20},
                            ]}>
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
                      </View>

                      <View style={{marginTop: 30}}>
                        <View style={{marginVertical: 10}}>
                          <Text style={[styles.dropdownButtonText]}>
                            Enter Task Name
                          </Text>
                          <TextInput
                            value={this.state.customTaskName.toUpperCase()}
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
                            onChangeText={customTaskName =>
                              this.setState({customTaskName})
                            }
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
                            onPress={() => this.RBSheetTimer?.open()}
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
                            placeholder={'Number of tokens'.toUpperCase()}
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
                                isSaveForFuture:
                                  this.state.isSaveForFuture == 0 ? 1 : 0,
                              });
                            }}>
                            <Image
                              source={
                                this.state.isSaveForFuture
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
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>
    );
  }
  //#endregion
}
