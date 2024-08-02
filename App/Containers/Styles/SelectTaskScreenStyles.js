import { StyleSheet,Dimensions } from 'react-native'
import { Metrics, ApplicationStyles, Colors } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  container: {
    flexGrow: 1,
    backgroundColor: Colors.transparent,
    padding:20,
    justifyContent:'space-between',
    flexDirection: 'column-reverse',
  },
  containerPdf:{
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
  },
  pdf: {
    flex:1,
    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
},
  containerBody:{
    flexGrow:1,
  },
  clockHeader:{
    marginBottom:20
  },
  taskList:{
    flex:1,
    flexGrow:1,
    flexDirection:'row',
    flexWrap:'wrap',
  },
  taskIconTouch:{
   padding:6,
   margin:6
  },
  taskIconTouchActive:{
    borderWidth:2,
    borderColor:'#fff',
    borderRadius:8,
  },
  taskIcon:{
    width:Metrics.screenWidth / 7,
    height:Metrics.screenWidth / 7
  },
  content:{
   padding:20
  },
  imageUploader:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginBottom:20
  },
  uploadView:{
    width:Metrics.screenWidth/3.5,
    height:Metrics.screenWidth/3.5,
    borderRadius:5,
    backgroundColor:'#fff',
    alignSelf:'center',
    alignItems:'center',
    justifyContent:'center',
    overflow:'hidden',
  },
  uploadPlaceholder:{
    width:Metrics.screenWidth/7,
    height:Metrics.screenWidth/7
  },
  buttonRight:{
    paddingLeft:15
  },
  modalFooter:{
    paddingTop:0,
    paddingBottom:20,
    paddingLeft:40,
    paddingRight:40
  },
})
