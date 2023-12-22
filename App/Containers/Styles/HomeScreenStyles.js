import { StyleSheet, Dimensions } from 'react-native'
import { Metrics, ApplicationStyles, Colors } from '../../Themes/'
let CIRCLE_RADIUS = 36;
let Window = Dimensions.get('window');
export default StyleSheet.create({
  ...ApplicationStyles.screen,
  logo: {
    alignSelf: 'center',
    width: Metrics.screenWidth / 2,
    height: Metrics.screenWidth / 1.5,
    marginBottom: 45
  },
  container: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: Colors.transparent,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  colorContainer: {
    flex: 1,
    backgroundColor: '#00FFFF',
  },
  modalBody: {
    flexGrow: 1,
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 20,
    paddingBottom: 15,
  },
  bigTaskIcon: {
    width: Metrics.screenWidth / 2.5,
    height: Metrics.screenWidth / 2.5,
    alignSelf: 'center',
    resizeMode: 'contain'
  },

  dropZone: {
    height: 100,
    backgroundColor: '#2c3e50'
  },
  text: {
    marginTop: 25,
    marginLeft: 5,
    marginRight: 5,
    textAlign: 'center',
    color: '#fff'
  },
  draggableContainer: {
    position: 'absolute',
    top: Window.height / 2 - CIRCLE_RADIUS,
    left: Window.width / 2 - CIRCLE_RADIUS,
  },
  circle: {
    backgroundColor: '#1abc9c',
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS
  },


  ballContainer: {
    height:200
  },
  row: {
    flexDirection: "row"
  },  
  dropZone: {
    height: 200,
    backgroundColor: "#00334d"
  },
  text: {
    marginTop: 25,
    marginLeft: 5,
    marginRight: 5,
    textAlign: "center",
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold"
  }
})
