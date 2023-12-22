import { StyleSheet } from 'react-native'
import { Metrics, ApplicationStyles, Colors, Fonts } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  itemList:{
    borderTopWidth:1,
    borderColor:'#ddd',
    padding:10,
    flexDirection:'row',
    alignItems:'center',
  }, 
})
