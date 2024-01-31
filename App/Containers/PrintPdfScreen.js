import React from 'react';
import {
  Dimensions,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import BaseComponent from '../Components/BaseComponent';
import {Colors, Images, Metrics} from '../Themes';
import styles from './Styles/SelectTaskScreenStyles';
import Pdf from 'react-native-pdf';
import {WebView} from 'react-native-webview';
import {BackHandler} from 'react-native';

export default class PrintPdfScreen extends BaseComponent {
  componentWillMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  handleBackButtonClick() {
    this.props.navigation.goBack();
    return true;
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

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  //#region -> Component Methods
  componentDidMount() {
    super.componentDidMount();
  }

  LoadingIndicatorView() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          height: Dimensions.get('window').height,
          width: Dimensions.get('window').width,
        }}>
        <ActivityIndicator color="#393D3C" size="large" />
      </View>
    );
  }
  render() {
    // const source = { uri:, cache: false};

    console.log(
      'PDFFFF ',
      'https://drive.google.com/viewerng/viewer?embedded=true&url=' +
        this.props.navigation.getParam('pdfUrl', 'nothing sent'),
    );
    return (
      // <View style={styles.mainContainer}>

      <SafeAreaView style={[styles.containerPdf, {backgroundColor: 'white'}]}>
        <TouchableOpacity
          onPress={() => this.props.navigation.goBack()}
          style={{alignSelf: 'flex-start', marginLeft: 20, marginBottom: 20}}
          hitSlop={{left: 20, right: 20, top: 20, bottom: 20}}>
          <Image
            source={Images.prev}
            style={[
              {
                tintColor: 'black',
                height: 20,
                width: 20,
                resizeMode: 'contain',
              },
            ]}
          />
        </TouchableOpacity>
        <WebView
          source={{
            uri:
              'https://drive.google.com/viewerng/viewer?embedded=true&url=' +
              this.props.navigation.getParam('pdfUrl', 'nothing sent'),
          }}
          style={{
            flex: 1,
            height: Dimensions.get('window').height,
            width: Dimensions.get('window').width,
          }}
          androidHardwareAccelerationDisabled={true}
          nestedScrollEnabled={true}
          renderLoading={this.LoadingIndicatorView}
          startInLoadingState={true}
          originWhitelist={['*']}
          automaticallyAdjustContentInsets={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          decelerationRate="normal"
          thirdPartyCookiesEnabled={true}
          androidLayerType="software"
        />
      </SafeAreaView>
      //  </View>
    );
  }
}
