import { StyleSheet } from 'react-native'
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
})
