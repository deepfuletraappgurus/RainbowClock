import { StyleSheet } from 'react-native'
import { Metrics, ApplicationStyles, Colors } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  alarmClock:{
    width:Metrics.screenWidth/2.5,
    height:Metrics.screenWidth/2.5,
    alignSelf:'center',
    marginBottom:10
  },
})
