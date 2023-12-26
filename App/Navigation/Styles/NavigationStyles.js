import { StyleSheet } from 'react-native'
import { Colors } from '../../Themes/'

export default StyleSheet.create({
  leftIcon:{
    height:'100%',
    alignItems:'center',
    justifyContent:'center',
    paddingLeft:10,
    paddingRight:10,
  },
  rightIcon:{
    height:'100%',
    alignItems:'flex-start',
    justifyContent:'center',
    paddingLeft:10,
    paddingRight:10,
    minWidth:46
  },
  hamburger:{
    width:26,
    height:26
  },
  rewardRow:{
    flexDirection:'row',
    alignItems:'center'
  },
  rewardIcon:{
    width:16,
    height:16,
    marginRight:5
  },
  rewardText:{
    fontSize:10,
    color:'#fff',
    fontWeight:'400'
  },
})
