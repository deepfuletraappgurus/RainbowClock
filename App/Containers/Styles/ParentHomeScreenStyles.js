import { StyleSheet } from 'react-native'
import { Metrics, ApplicationStyles, Colors, Fonts } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  logo:{
    alignSelf:'center',
    width:Metrics.screenWidth/2,
    height:Metrics.screenWidth/1.5,
    marginBottom:45
  },
  container: {
    flexGrow: 1,
    backgroundColor: Colors.transparent,
    padding:20,
    justifyContent:'space-between',
    alignItems:'center',
    flexDirection: 'column-reverse'
  },
  modalBody:{
    flexGrow:1,
    padding:30,
  },
  schoolBag:{
    width:Metrics.screenWidth / 2.5,
    height:Metrics.screenWidth / 1.5,
    alignSelf:'center'
  },
  userName:{
    backgroundColor:Colors.snow,
    paddingHorizontal:10,
    alignSelf:'center',
    borderRadius:5,
    marginBottom:20,
  },
  userNameText:{
    color:'#262262',
    padding:8,
    fontSize:16,
    fontFamily: Fonts.type.base,
    fontWeight: 'bold',  
  },
  clockHeader: {
    justifyContent:'center',
    alignItems:'center'
  }
})
