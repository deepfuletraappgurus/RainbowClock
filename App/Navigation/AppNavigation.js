import React, {Component} from 'react';
import {createAppContainer} from 'react-navigation'; //NavigationActions
import {createStackNavigator} from 'react-navigation-stack';
import {createDrawerNavigator} from 'react-navigation-drawer';
import {
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Platform,
  View,
  Text,
} from 'react-native';
import {Colors, Fonts, Images, Metrics} from '../Themes/';
import DrawerComponent from '../Components/DrawerComponent';
import * as Helper from '../Lib/Helper';
import LaunchScreen from '../Containers/LaunchScreen';
import SignupScreen from '../Containers/SignupScreen';
import ForgotpasswordScreen from '../Containers/ForgotpasswordScreen';
import PinScreen from '../Containers/PinScreen';
import GetStartedScreen from '../Containers/GetStartedScreen';
import SelectUserScreen from '../Containers/SelectUserScreen';
import AddUserScreen from '../Containers/AddUserScreen';
import HomeScreen from '../Containers/HomeScreen';
import ChildProfileScreen from '../Containers/ChildProfileScreen';
import SchoolHoursScreen from '../Containers/SchoolHoursScreen';
import ParentsPortalPinScreen from '../Containers/ParentsPortalPinScreen';
import ParentsSelectChildScreen from '../Containers/ParentsSelectChildScreen';
import ParentsAddUserScreen from '../Containers/ParentsAddUserScreen';
import ParentsProfileScreen from '../Containers/ParentsProfileScreen';
import ParentsUpdateProfileScreen from '../Containers/ParentsUpdateProfileScreen';
import ParentHomeScreen from '../Containers/ParentHomeScreen';
import SetupTimeBlockScreen from '../Containers/SetupTimeBlockScreen';
import SelectTaskScreen from '../Containers/SelectTaskScreen';
import ScheduleTaskScreen from '../Containers/ScheduleTaskScreen';
import ScheduleScreen from '../Containers/ScheduleScreen';
import RewardScreen from '../Containers/RewardScreen';
import ClaimedRewardsScreen from '../Containers/ClaimedRewardsScreen';
import RescheduleScreen from '../Containers/RescheduleScreen';
import ShareScreen from '../Containers/ShareScreen';

import styles from './Styles/NavigationStyles';
import ChildClaimedRewardsScreen from '../Containers/ChildClaimedRewardsScreen';
import EditRewardsScreen from '../Containers/EditRewardsScreen';
import CreateRewardScreen from '../Containers/CreateRewardScreen';
import EditScheduleScreen from '../Containers/EditScheduleScreen';
import EditSelectTaskScreen from '../Containers/EditSelectTaskScreen';
import PrintPdfScreen from '../Containers/PrintPdfScreen'

const noTransitionConfig = () => ({
  transitionSpec: {
    duration: 0,
    timing: Animated.timing,
    easing: Easing.step0,
  },
});

const transitionConfig = () => {
  return {
    transitionSpec: {
      duration: 300,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true,
    },
    screenInterpolator: sceneProps => {
      const {layout, position, scene} = sceneProps;

      const thisSceneIndex = scene.index;

      // if (scene.route.routeName == 'MapConnectTempDetails') {

      //   const width = layout.initWidth
      //   const height = layout.initHeight

      //   const translateY = position.interpolate({
      //     inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
      //     outputRange: [height, 0, 0]
      //   })
      //   return { transform: [{ translateY }] }
      // }
      // else {
      const inputRange = [
        thisSceneIndex - 1,
        thisSceneIndex,
        thisSceneIndex + 1,
      ];
      // const opacity = position.interpolate({
      //   inputRange,
      //   outputRange: [0.8, 1, 1],
      // });
      const scaleY = position?.interpolate({
        inputRange,
        outputRange: [1, 1, 1],
      });
      return {transform: [{scaleY}]};
      // }
    },
  };
};

const drawerStack = createStackNavigator(
  {
    // ClockScreen: { screen: ClockScreen, navigationOptions: { title: 'My Rainbow Clock'.toUpperCase() } },
    SelectUserScreen: {
      screen: SelectUserScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase(), headerRight : () => <></>},
    },
    PrintPdfScreen: {
      screen: PrintPdfScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase(),headerShown:false,},
    },

    HomeScreen: {
      screen: HomeScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    RescheduleScreen: {
      screen: RescheduleScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    RewardScreen: {
      screen: RewardScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    ClaimedRewardsScreen: {
      screen: ClaimedRewardsScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    EditRewardsScreen: {
      screen: EditRewardsScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    ChildClaimedRewardsScreen: {
      screen: ChildClaimedRewardsScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    ScheduleScreen: {
      screen: ScheduleScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    GetStartedScreen: {
      screen: GetStartedScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    AddUserScreen: {
      screen: AddUserScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    ChildProfileScreen: {
      screen: ChildProfileScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    SchoolHoursScreen: {
      screen: SchoolHoursScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    ParentsPortalPinScreen: {
      screen: ParentsPortalPinScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    ParentsSelectChildScreen: {
      screen: ParentsSelectChildScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase(), headerRight : () => <></>},
    },
    ParentsAddUserScreen: {
      screen: ParentsAddUserScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    ParentsProfileScreen: {
      screen: ParentsProfileScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    ParentsUpdateProfileScreen: {
      screen: ParentsUpdateProfileScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase(), headerRight : () => <></>},
    },
    SelectTaskScreen: {
      screen: SelectTaskScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    EditSelectTaskScreen: {
      screen: EditSelectTaskScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    SetupTimeBlockScreen: {
      screen: SetupTimeBlockScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    EditScheduleScreen: {
      screen: EditScheduleScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    ParentHomeScreen: {
      screen: ParentHomeScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase(),},
    },
    ScheduleTaskScreen: {
      screen: ScheduleTaskScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    CreateRewardScreen: {
      screen: CreateRewardScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
    ShareScreen: {
      screen: ShareScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
  },
  {
    // transitionConfig,
    headerMode: 'screen',
    navBarTransparent: false,
    defaultNavigationOptions: ({navigation}) => {
      return {
        headerStyle: {
          backgroundColor: navigation.getParam(
            'navHeaderColor',
            Colors.darkBlue,
          ),
          shadowOpacity: 0,
          shadowOffset: {height: 0},
          elevation: 0,
          height: Metrics.navBarHeight,
          borderBottomWidth: 0,
        },
        headerTransparent: true,

        headerTitleStyle: {
          color: Colors.snow,
          alignSelf: 'center',
          fontSize: 14,
          fontWeight: 'bold',
          textAlign: 'center',
          flexGrow: 1,
          marginHorizontal: 0,
        },

        headerLeft: (
          <TouchableOpacity
            activeOpacity={0.2}
            style={styles.leftIcon}
            onPress={() => {
              navigation.dispatch(navigation.openDrawer());
            }}>
            <Image source={Images.hamburger} style={styles.hamburger} />
          </TouchableOpacity>
        ),

        headerRight: (
          <TouchableOpacity
            activeOpacity={0.2}
            style={styles.rightIcon}
            onPress={() => {
              //navigation.dispatch(NavigationActions.navigate({ routeName: 'DrawerOpen' }));
            }}>
            <View style={styles.rewardRow}>
              <Image
                source={navigation.getParam(
                  'standardRewardIcon',
                  Images.reward_star,
                )}
                style={styles.rewardIcon}
              />
              <Text style={styles.rewardText}>
                {navigation.getParam('standardReward', '0')}
              </Text>
            </View>
            <View style={styles.rewardRow}>
              <Image source={Images.reward} style={styles.rewardIcon} />
              <Text style={styles.rewardText}>
                {navigation.getParam('specialReward', '0')}
              </Text>
            </View>
          </TouchableOpacity>
        ),
      };
    },
  },
);

const getStartedStack = createStackNavigator(
  {
    GetStartedScreen: {
      screen: GetStartedScreen,
      navigationOptions: {title: 'My Rainbow Clock'.toUpperCase()},
    },
  },
  {
    transitionConfig,
    headerMode: 'screen',
    defaultNavigationOptions: ({navigation}) => {
      return {
        headerStyle: {
          backgroundColor: navigation.getParam(
            'navHeaderColor',
            Colors.darkBlue,
          ),
          shadowOpacity: 0,
          shadowOffset: {height: 0},
          elevation: 0,
          height: Metrics.navBarHeight,
          borderBottomWidth: 0,
        },
        headerTransparent: true,

        headerTitleStyle: {
          color: Colors.snow,
          alignSelf: 'center',
          fontSize: 15,
          fontWeight: 'bold',
          textAlign: 'center',
          flexGrow: 1,
        },

        headerLeft: (
          <TouchableOpacity
            activeOpacity={0.2}
            style={styles.leftIcon}
            onPress={() => {
              navigation.dispatch(navigation.openDrawer());
            }}>
            <Image source={Images.hamburger} style={styles.hamburger} />
          </TouchableOpacity>
        ),
      };
    },
  },
);

const DrawerNavigation = createDrawerNavigator(
  {
    drawerStack: {screen: drawerStack},
  },
  {
    contentComponent: DrawerComponent,
    drawerPosition: 'left',
    drawerWidth: 300,
    drawerOpenRoute: 'DrawerOpen',
    drawerCloseRoute: 'DrawerClose',
    drawerToggleRoute: 'DrawerToggle',
    drawerBackgroundColor: 'transparent',
    // navigationOptions: {
    //   drawerLockMode: 'locked-closed'
    // },
  },
);

const GetStartedDrawerNavigation = createDrawerNavigator(
  {
    getStartedStack: {screen: getStartedStack},
  },
  {
    contentComponent: DrawerComponent,
    drawerPosition: 'left',
    drawerWidth: 300,
    drawerOpenRoute: 'DrawerOpen',
    drawerCloseRoute: 'DrawerClose',
    drawerToggleRoute: 'DrawerToggle',
    drawerBackgroundColor: 'transparent',
    navigationOptions: {
      drawerLockMode: 'locked-closed',
    },
  },
);

// login stack
const LoginStack = createStackNavigator(
  {
    LaunchScreen: {screen: LaunchScreen},
    ForgotpasswordScreen: {screen: ForgotpasswordScreen},
    SignupScreen: {screen: SignupScreen},
    PinScreen: {screen: PinScreen},
  },
  {
    headerMode: 'none',
  },
);

// Manifest of possible screens
const PrimaryNav = createStackNavigator(
  {
    loginStack: {screen: LoginStack},
    drawerStack: {screen: DrawerNavigation},
    getStartedStack: {screen: GetStartedDrawerNavigation},
  },
  {
    // Default config for all screens
    headerMode: 'none',
    initialRouteName: 'loginStack',
    transitionConfig: noTransitionConfig,
  },
);

export default createAppContainer(PrimaryNav);
