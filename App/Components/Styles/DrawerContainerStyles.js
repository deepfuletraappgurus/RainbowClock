import { StyleSheet } from 'react-native';
import { ApplicationStyles, Colors, Metrics, Fonts } from '../../Themes/';


export default StyleSheet.create({
  ...ApplicationStyles.screen,
  sidebar: {
    flex: 1,
  },
  parentSidebar: {
    flex: 1,
    backgroundColor:'#b47feb',
    opacity:1.0,
  },
  aideHeade: {
    paddingTop: 20,
    paddingBottom: 0,
    paddingLeft: 20,
    paddingRight: 20,
  },
  nav: {
    flexGrow: 1,
    padding: 15
  },
  navHeader: {
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeMenu: {
    height: 16,
    width: 16,
    margin: 5
  },
  navItem: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    borderTopWidth: 0.625,
    borderColor: 'rgba(255,255,255,0.5)',
    flexDirection:'row',
    alignItems:'center'
  },
  navItemText: {
    color: Colors.snow,
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: Fonts.type.base,
    flex:1,
    paddingLeft:10
  },
  navIcon:{
    width:40,
    height:40
  },
  navFooter: {
    padding: 20,
    paddingLeft: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  username: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '400',
  },
  logoutText: {
    color: '#FB4803',
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 10,
  },
  moreLinkText: {
    fontSize: 10,
    fontStyle: 'italic',
    fontWeight: '300',
  },
  switch: {
    height: 40,
    width: 90,
    borderRadius: 7,
    backgroundColor: '#03FBAF',
    padding: 3,
    flexDirection: 'row',
    marginBottom: 15,
    justifyContent: 'space-between'
  },
  switchOff: {
    height: 40,
    width: 90,
    borderRadius: 7,
    backgroundColor: '#F1F1F3',
    padding: 3,
    flexDirection: 'row-reverse',
    marginBottom: 15,
    justifyContent: 'space-between'
  },
  switchToogle: {
    width: 21,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  switchContent: {
    paddingLeft: 6,
    paddingRight: 6,
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center'
  },
  switchText: {
    fontSize: 12,
    fontWeight: '300',
    flexWrap: "wrap"
  },
  switchSmallText: {
    fontSize: 7,
    fontWeight: '300',
    flexWrap: "wrap",
    fontStyle: 'italic',
  },
})
