import React from 'react';
import { View } from 'react-native';
import BaseComponent from '../Components/BaseComponent';
import { Colors, Metrics } from '../Themes';
import styles from './Styles/SelectTaskScreenStyles';
import Pdf from 'react-native-pdf';
import { WebView } from 'react-native-webview';
export default class PrintPdfScreen extends BaseComponent {

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

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false
        }
    }

    //#region -> Component Methods
    componentDidMount(){
        super.componentDidMount()
        
    }

    render() {

        // const source = { uri:, cache: false};
        
        // console.log('PDFFFF ',source)
        return (
            // <View style={styles.mainContainer}>

            //    <View style={styles.containerPdf}>
            <WebView
             source={{ uri: 'https://drive.google.com/viewerng/viewer?embedded=true&url='+this.props.navigation.getParam('pdfUrl', 'nothing sent') }} 
            style={{ flex: 1,height: 500, width: 400 }}
            nestedScrollEnabled={true}
             />
                // <Pdf
                //     source={source}
                //     onLoadComplete={(numberOfPages,filePath) => {
                //         console.log(`Number of pages: ${numberOfPages}`);
                //     }}
                //     onPageChanged={(page,numberOfPages) => {
                //         console.log(`Current page: ${page}`);
                //     }}
                //     onError={(error) => {
                //         console.log(error);
                //     }}
                //     onPressLink={(uri) => {
                //         console.log(`Link pressed: ${uri}`);
                //     }}
                //     style={styles.pdf}/>
            // </View>
            //  </View>
        )
    }
}