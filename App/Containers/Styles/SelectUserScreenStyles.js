import { StyleSheet } from 'react-native'
import { Metrics, ApplicationStyles } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  deleteIcon:{
    height: 14,
    width: 14,
  },
  deleteWrapper:
  {
    position:'absolute', 
    borderWidth:2, 
    borderColor:'red',
    left:0, 
    top:15,
    height: 25,
    width: 25,
    borderRadius:10,
    justifyContent:'center',
    alignItems:'center'
  }
})
