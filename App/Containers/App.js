import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {Platform, View} from 'react-native';
import {NavigationActions, StackActions} from 'react-navigation';
import {Provider} from 'react-redux';
import Constants from '../Components/Constants';
import '../Config';
import DebugConfig from '../Config/DebugConfig';
import {configureStore, Root} from '../Navigation/ReduxNavigation';
import EventEmitter from '../Lib/EventEmitter';
import * as Helper from '../Lib/Helper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { requestUserPermission } from '../Lib/firebaseService';

// create our store
const store = configureStore({});

/**
 * Provides an entry point into our application.  Both index.ios.js and index.android.js
 * call this component first.
 *
 * We create our Redux store here, put it into a provider and then bring in our
 * RootContainer.
 *
 * We separate like this to play nice with React Native's hot reloading.
 */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  intervalID = 0;
  componentDidMount() {
    if (Platform.OS === 'android') {
    }
    requestUserPermission()
    try {
      AsyncStorage.setItem(Constants.KEY_ACCESS_AS_PARENTS, '0');
      AsyncStorage.getItem(Constants.KEY_IS_LOGIN, (err, result) => {
        this.setState({loading: true}, () => {
          if (result === '1') {
            AsyncStorage.getItem(
              Constants.KEY_USER_HAVE_CHILDREN,
              (err, result) => {
                this.setState({loading: true}, () => {
                  if (result === '1') {
                    const navigateAction = StackActions.reset({
                      index: 0,
                      key: null,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'drawerStack',
                        }),
                      ],
                    });
                    store.dispatch(navigateAction);
                  } else {
                    const navigateAction = StackActions.reset({
                      index: 0,
                      key: null,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'getStartedStack',
                        }),
                      ],
                    });
                    store.dispatch(navigateAction);
                  }
                });
              },
            );
          }
        });
      });
    } catch (error) {
    }
    
    this.intervalID = setInterval(() => this.getImageBg(), 5000);
    // this.intervalID = setInterval(() => this.getImageBg(), 100);
  }
  getImageBg = () => {
    Helper.getBackgroudImage((image, navHeaderColor) => {
      // this.props.navigation.setParams({ navHeaderColor });
      AsyncStorage.setItem(Constants.BACKGROUND_IMAGE, JSON.stringify(image))
      AsyncStorage.setItem(Constants.NAV_COLOR, JSON.stringify(navHeaderColor))
      // this.setState({ imageBg: image });
    });
  };
  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  render() {
    if (this.state.loading) {
      return (
        <GestureHandlerRootView style={{flex: 1}}>
        <Provider store={store}>
          <Root />
        </Provider>
        </GestureHandlerRootView>
      );
    } else {
      return (
        //remove this for showing blank screen while loading
        <View />
      );
    }
  }
}

// allow reactotron overlay for fast design in dev mode
export default App;
