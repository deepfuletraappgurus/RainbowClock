import { StyleSheet } from 'react-native'
import { Metrics, ApplicationStyles } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  logo:{
    alignSelf:'center',
    width:Metrics.screenWidth/2,
    height:Metrics.screenWidth/1.5,
    marginBottom:45
  },
})
