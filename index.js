/**
 * @format
 */

import 'react-native-gesture-handler';
import {LogBox, AppRegistry} from 'react-native';
import App from './App/Containers/App';
import {name as appName} from './app.json';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

AppRegistry.registerComponent(appName, () => App);
