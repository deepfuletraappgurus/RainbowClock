import { StyleSheet } from 'react-native'
import { Metrics, ApplicationStyles } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  leftIcon:{
    alignItems:'center',
    justifyContent:'center',
    paddingLeft:15,
    paddingRight:10,
  },
  backButton:{
    width:24,
    height:24
  },
})
