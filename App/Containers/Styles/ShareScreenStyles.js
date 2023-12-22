import { StyleSheet } from 'react-native'
import { Metrics, ApplicationStyles, Colors, Fonts } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
 
  buttonText:{
    fontFamily:Fonts.type.base,
    fontSize:18,
    color:Colors.snow,
    fontWeight:'700',
    paddingLeft:15,
    paddingRight:15,
    width:'100%',
  },
  socialIcon:{
    height:24,
    width:24,
    resizeMode:'contain',
    marginLeft:15
  },
})
