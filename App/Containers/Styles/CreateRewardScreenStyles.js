import { StyleSheet } from 'react-native'
import { Metrics, ApplicationStyles, Colors } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  content:{
   padding:20
  },
  imageUploader:{  
    marginBottom:20,
    justifyContent:'center',
    alignItems:'center'
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
    paddingLeft:0
  },
})
