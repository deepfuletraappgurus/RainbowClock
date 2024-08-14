
import { Platform, Dimensions } from 'react-native';
import Fonts from './Fonts'
import Metrics from './Metrics'
import Colors from './Colors'
import DeviceInfo from 'react-native-device-info';
import colors from './Colors';

// This file is for a reusable grouping of Theme items.
// Similar to an XML fragment layout in Android

// This file is for a reusable grouping of Theme items.
// Similar to an XML fragment layout in Android

// This file is for a reusable grouping of Theme items.
// Similar to an XML fragment layout in Android
const X_WIDTH = 375;
const X_HEIGHT = 812;
const PAD_WIDTH = 768;
const PAD_HEIGHT = 1024;

const { height: D_HEIGHT, width: D_WIDTH } = Dimensions.get('window');

const isIPhoneX = (() => {
  return(Platform.OS === 'ios' && DeviceInfo.hasNotch());
})();

const ApplicationStyles = {
  screen: {
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.transparent
    },
    // backgroundImage: {
    //   position: 'absolute',
    //   top: 0,
    //   left: 0,
    //   bottom: 0,
    //   right: 0
    // },
    backgroundImage:{
     flex:1,
     backgroundColor:colors.navCyan,
      paddingTop:Platform.OS === 'ios' ? isIPhoneX ? Metrics.navBarHeight + 40 : Metrics.navBarHeight + 20 : Metrics.navBarHeight + 20
    },
    backgroundImageWithoutPadding:{
      flex:1,
       
     },
    SafeAreaView:{
      flex:1
    },
    container: {
      flexGrow: 1,
      backgroundColor: Colors.transparent,
      padding:15,
    },
    center:{
      justifyContent:'center',
      alignItems:'center'
    },
    justifySpaceBetween:{
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'space-between',
      flex:1
    },
    ScrollView:{
      flexGrow:1,      
    },
    logo:{
      alignSelf:'center',
      width:Metrics.screenWidth/3,
      height:Metrics.screenWidth/2.2,
      marginBottom:45
    },
    form:{
      paddingLeft:15,
      paddingRight:15,
    },
    formControl:{
      flexDirection:'row',
      alignItems:'center',
      width:'100%',
      borderBottomWidth:0.5,
      borderColor:'#fff',
      marginBottom:35
    },
    disable: {
      opacity: 0.5
    },
    formControlSmall:{
      marginBottom:15
    },
    input:{
      fontFamily:Fonts.type.base,
      fontSize:16,
      color:Colors.snow,
      fontWeight:'700',
      flex:1,
      paddingLeft:0,
      paddingRight:15,
      height:50,
    },
    inputItem:{
      fontFamily:Fonts.type.base,
      fontSize:16,
      backgroundColor:'#fff',
      color:Colors.titleColor,
      fontWeight:'700',
      flex:1,
      paddingLeft:10,
      paddingRight:10,
      height:40,
      borderRadius:4
    },
    inputIcon:{
      width:40,
      height:40,  
      marginRight:15,    
    },
    formFooter:{
      marginTop:20,
      marginBottom:20
    },
    button:{
      backgroundColor:Colors.blue,
      height:50,
      borderRadius:5,
      alignItems:'center',
      justifyContent:'center',
      marginBottom:15,
      marginTop:15,
      borderBottomWidth:5,
      borderColor: Colors.darkBlue,
      width:'100%',
    },
    buttonYellow:{
      backgroundColor:Colors.yellow,
      height:50,
      borderRadius:5,
      alignItems:'center',
      justifyContent:'center',
      marginBottom:15,
      marginTop:15,
      borderBottomWidth:5,
      borderColor: Colors.dark_yellow_button,
      width:'45%',
    },
    buttonPrimary:{
      backgroundColor:Colors.pink,
      borderColor:Colors.darkPink,
    },
    buttonBlue:{
      backgroundColor:'#6799e8',
      borderColor:'#4580d5',
    },
    buttonCarrot:{
      backgroundColor:Colors.carrot,
      borderColor:Colors.darkCarrot,
    },
    buttonText:{
      fontFamily:Fonts.type.base,
      fontSize:16,
      color:Colors.snow,
      fontWeight:'700',
      paddingLeft:20,
      paddingRight:20,
    },
    waitText:{
      fontFamily:Fonts.type.base,
      fontSize:16,
      color:Colors.snow,
      width:"100%",
      fontWeight:'700',
      paddingLeft:15,
      paddingRight:15,
    },
    smallWaitText:{
      fontFamily:Fonts.type.base,
      fontSize:12,
      color:Colors.gray,
      width:"100%",
      fontWeight:'500',
      justifyContent:'center',
      textAlign:'center',
    },
    smallButton:{
      height:35,
      alignSelf:'center',
      width:null,
      paddingLeft:15,
      paddingRight:15,
    },
    smallButtonText:{
      fontFamily:Fonts.type.base,
      fontSize:14,
      color:Colors.snow,
      fontWeight:'700',
      paddingLeft:15,
      paddingRight:15,
    },
    mediumButtonText:{
      fontFamily:Fonts.type.base,
      fontSize:16,
      color:Colors.snow,
      fontWeight:'700',      
    },
    link:{
      alignSelf:'center',
      marginTop:10,
      marginBottom:10
    },
    linkText:{
      fontSize: 18,
      color:Colors.pink,
      fontFamily: Fonts.type.base,
      fontWeight: 'bold',
      textAlign:'center'
    },
    linkButton:{
      marginBottom:15,
      marginTop:15,
    },
    linkButtonText:{
      fontSize: 20,
      color: Colors.carrot,
      fontFamily: Fonts.type.base,
      fontWeight: 'bold',
      textAlign:'center',
      lineHeight:30
    },
    nextButton:{
      alignSelf:'center',
      marginTop:10,
      marginBottom:10
    },
    circleArrow:{
      height:55,
      width:55
    },
    title:{
      fontFamily:Fonts.type.base,
      fontSize:18,
      color:Colors.snow,
      fontWeight:'700',
      lineHeight:26,
      flexWrap:'wrap'
    },
    rescheduleTitle:{
      fontFamily:Fonts.type.base,
      fontSize:25,
      color:Colors.black,
      fontWeight:'700',
      lineHeight:26,
      flexWrap:'wrap',
      marginTop: 10,
      marginBottom:15
    },
    titleSmall:{
      fontSize:16
    },
    textCenter:{
      textAlign:'center',
    },
    textRight:{
      textAlign:'center',
    },
    minComplete:{
      fontFamily:Fonts.type.bold,
      fontSize:22,
      color:Colors.snow,
      fontWeight:'700',
      lineHeight:28
    },
    fromTimeMl:{
        paddingTop:10,
        width:'100%',
        paddingHorizontal:10,
        borderRadius:5,
        height:40,
        position: 'absolute',
        paddingHorizontal:10,
        backgroundColor:'#fff'
    },
    label:{
      fontFamily:Fonts.type.base,
      fontSize:14,
      color:Colors.snow,
      fontWeight:'700',
      marginBottom:15
    },
    SmallLabel:{
      fontFamily:Fonts.type.base,
      fontSize:13,
      color:Colors.snow,
      fontWeight:'700',
    },
    marginBottomNull:{
      marginBottom:0
    },
    pinForm:{
      marginTop:30,
      marginBottom:30
    },
    pinFormParentsPortal:{
      marginTop:30,
      marginBottom:-40
    },
    pinRow:{
      marginBottom:30
    },
    pinFrm:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',
    },
    pinBox:{
      height:60,
      width:60,
      borderWidth:1,
      borderColor:Colors.snow,
    },
    h1:{
      fontSize: 20,
      color: Colors.snow,
      fontFamily: Fonts.type.base,
      fontWeight: 'bold',
    },
    heading1:{
      fontSize: 30,
      color: Colors.snow,
      fontFamily: Fonts.type.base,
      fontWeight: 'bold',
    },
    heading2:{
      fontSize: 22,
      color: Colors.snow,
      fontFamily: Fonts.type.base,
      fontWeight: 'bold',
    },
    justifyFooter:{
      paddingTop:40,
      paddingLeft:20,
      paddingBottom:20,
      paddingRight:20,
      width:'100%',
    },
    shareButtonSection:{
      paddingLeft:25,
      paddingBottom:30,
      paddingRight:25,
      width:'100%',
    },
    selectUserList:{
      flex:1,
      justifyContent:'center',
      alignItems:'center',
      paddingLeft:40,
      paddingRight:40
    },
    selectUser:{
      flexDirection:'row',
      alignItems:'center',
      marginTop:15,
      marginBottom:15
    },
    avatarWrapper: {
      height: 70,
      width: 70,
      borderRadius: 70/2,
      borderWidth: 3,
      borderColor:'#fff',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      zIndex:1,
    },
    avatar: {
      height: 70,
      width: 70,
    },
    userImage:{
      height:70,
      width:70,
      borderRadius:70/2,
      borderWidth:3,
      borderColor:'#fff',
      position:'relative',
      zIndex:1,
    },
    userName:{
      backgroundColor:Colors.snow,
      paddingLeft:10,
      paddingRight:10,
      alignSelf:'center',
      borderRadius:5,
      marginLeft:-7,
    },
    userNameText:{
      color:'#262262',
      padding:8,
      fontSize:16,
      fontFamily: Fonts.type.base,
      fontWeight: 'bold',  
    },
    topHeader:{
      marginBottom:40
    },
    imageUploader:{
      marginTop:20,
      marginBottom:0
    },
    uploadView:{
      width:Metrics.screenWidth/2.8,
      height:Metrics.screenWidth/2.8,
      borderRadius:5,
      backgroundColor:'#fff',
      alignSelf:'center',
      alignItems:'center',
      justifyContent:'center',
      overflow:'hidden',
    },
    uploadPlaceholder:{
      width:Metrics.screenWidth/5,
      height:Metrics.screenWidth/5
    },
    uploadViewCircle:{
      borderRadius:Metrics.screenWidth/5,
      overflow:'hidden',
      borderWidth:2,
      borderColor:'#fff'
    },
    uploadedImage:{
      position:'absolute',
      left:0,
      top:0,
      right:0,
      bottom:0,
      width:null,
      height:null,
      resizeMode:'cover'
    },
    clock:{
      alignSelf:'center',
      marginTop:20,
      marginBottom:0,
      position:'relative',
      justifyContent:'center',
      alignItems:'center',
    },
    clockImage:{
      width:Platform.OS === 'ios' ? isIPhoneX ? Metrics.screenWidth/1.2 :  Metrics.screenWidth/1.4 :  Metrics.screenWidth/1.4,
      height:Platform.OS === 'ios' ? isIPhoneX ? Metrics.screenWidth/1.2 :  Metrics.screenWidth/1.4 :  Metrics.screenWidth/1.4
    },
    clockTimerView:{
      position:'absolute',
      left:0,
      top:0,
      bottom:0,
      right:0,
      zIndex:1,  
      justifyContent:'center',
      alignItems:'center'
    },
    clockTimer:{
      width: Metrics.screenWidth/3.8,
      height:Metrics.screenWidth/1.8,  
      bottom: 0,
      right:(Metrics.screenWidth/3.8) / 4,
      
    },
    clockChartView:{
      position: 'absolute',
      height: null,
      width: null,//Metrics.screenWidth/1.4,
      left: 20,
      top: 20,
      right: 20,
      bottom: 20
    },
    miniClock:{
     // position: 'absolute',
      // height: null,
      // width: Metrics.screenWidth/4,
      // height: Metrics.screenWidth/4,
      // left: 0,
      // top: 0,
      // right: 0,
      // bottom: 0,
      // borderWidth:2.0,
      // borderColor:Colors.snow,
      // borderRadius:Metrics.screenWidth/4,
      // alignSelf:'center',
      // justifyContent:'center',
      // alignItems:'center',
      // marginTop:10,
      // marginBottom:10
    },
    miniClockPieChart:{
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
    SafeAreaFooter:{
      backgroundColor:Colors.clear,
    },
    footer:{
      height:60,
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center'
    },
    pinkBG:{
      backgroundColor:Colors.pink
    },
    footerIconList:{
      flex:1,
      height:'100%',
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'center',
      paddingLeft:30,
      paddingRight:30
    },
    iconTouch:{
      alignItems:'center',
      justifyContent:'center',
      height:'100%',
      padding:15
    },
    icon:{
      width:Metrics.screenWidth/8,
      height:Metrics.screenWidth/8,
      resizeMode:'contain'
    },
    iconTaskList:{
      width:Metrics.screenWidth/6,
      height:Metrics.screenWidth/6,
      resizeMode:'contain'
    },
    fadedIcon :{
      width:Metrics.screenWidth/8,
      height:Metrics.screenWidth/8,
      opacity: 0.5,
      resizeMode:'contain'
    },
    iconSmall:{
      width:Metrics.screenWidth/7,
      height:Metrics.screenWidth/7
    },
    arrowTouch:{
      height:'100%',
      paddingLeft:15,
      paddingRight:15,
      alignItems:'center',
      justifyContent:'center',
    },
    footerArrow:{
      width:15,
      height:30,     
    },
    clockBottom:{
      flexDirection:'row',
      justifyContent:'space-between',
      width:'100%'
    },
    clockBottomItem:{
      flex:1,      
    },
    bellTouch:{
      marginBottom:10,
      marginTop:-30,
      marginLeft:20
    },
    bellAbsolute:{
      position:'absolute',
      top:-30,
      left:Metrics.screenWidth/10
    },
    bell:{
      width:Metrics.screenWidth/13,
      height:Metrics.screenWidth/9
    },
    alarmClock:{
      width:Metrics.screenWidth/4.8,
      height:Metrics.screenWidth/4.8,
      resizeMode:'contain'
    },
    school:{
      width:Metrics.screenWidth/8.5,
      height:Metrics.screenWidth/7
    },
    schoolBus:{
      width:Metrics.screenWidth/4.4,
      height:Metrics.screenWidth/3.6
    },
    Switch:{
      backgroundColor:Colors.black,
      height:35,
      borderRadius:35/2,
      width:75,
      marginTop:10,
      marginBottom:10,
      justifyContent:'space-between',
      alignItems:'center',
      flexDirection:'row'
    },
    SwitchHide:{
      backgroundColor:Colors.black,
      height:35,
      borderRadius:35/2,
      width:75,
      marginTop:10,
      marginBottom:10,
      justifyContent:'space-between',
      alignItems:'center',
      flexDirection:'row',
      display:'none'
    },
    SwitchText:{
      fontSize:12,
      color:'#fff',
      backgroundColor:Colors.transparent,
      paddingLeft:10,
      paddingRight:10,
      fontWeight:'700'
    },
    SwitchText24Hrs:{
      fontSize:12,
      color:'#fff',
      backgroundColor:Colors.transparent,
      paddingLeft:5,
      paddingRight:5,
      fontWeight:'700'
    },
    SwitchButton:{
      height:35,
      width:35,
      borderRadius:35/2,
      backgroundColor:'#fff',
      marginLeft:-10
    },
    SwitchButton24Hrs:{
      height:35,
      width:35,
      borderRadius:35/2,
      backgroundColor:'#fff',
      marginLeft:0
    },
    switch24Hrs:{
      backgroundColor:Colors.darkYellow,
    },
    switch12Hrs:{
      backgroundColor:Colors.blue,
    },
    calendarIcon:{
      width:Metrics.screenWidth/6.2,
      height:Metrics.screenWidth/6.2,
      marginLeft:10
    },
    modal:{
      backgroundColor:'#b47feb',
      flex:1,
    },
    rescheduleModal:{
      backgroundColor: 'rgba(0.0,0.0,0.0,0.3)',
      flex:1,
    },
    scheduleBG:{
      backgroundColor: 'rgba(180.0,127.0,235.0,1.0)',
    },
    modalBlueTrans:{
      backgroundColor:'rgba(103,153,232,0.9)'
    },
    modalRandTrans:{
      backgroundColor:'rgba(140,140,140,0.9)'
    },
    modalHeader:{
      height:Metrics.navBarHeight,
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center'
    },
    modalHeaderRight:{
      padding:15
    },
    modalBody:{
      flexGrow:1
    },
    taskList:{
      flexDirection:'row',
      flexWrap:'wrap',
    },
    taskIconTouch:{
      padding:10
    },
    taskIcon:{
      width:Metrics.screenWidth / 4.5,
      height:Metrics.screenWidth / 4.5,
      resizeMode:"contain"
    },
    fadedTaskIcon:{
      width:Metrics.screenWidth / 4.5,
      height:Metrics.screenWidth / 4.5,
      opacity: 0.5,
      resizeMode:"contain"
    },
    taskIconLarge:{
      width:Metrics.screenWidth / 5.5,
      height:Metrics.screenWidth / 5.5
    },
    modalFooter:{
      paddingRight:40,
      paddingLeft:40,
      paddingTop:20,
      paddingBottom:20
    },
    frmRow:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',      
    },
    inputField:{
      backgroundColor:'#fff',
      height: 40,
      borderRadius:5,
      width:'100%',
      paddingHorizontal:10,
      color:Colors.titleColor,
    },
    inputView:{
      backgroundColor:'#fff',
      height: 40,
      borderRadius:5,
      width:'100%',
      paddingHorizontal:10,
    },
    dayUnSelected:{
      backgroundColor:'#fff',
      height: 40,
      borderRadius:5,
      width:'100%',
      alignItems:'center',
      justifyContent:'center'
    },
    daySelected:{
      backgroundColor:Colors.carrot,
      height: 40,
      borderRadius:5,
      width:'100%',
      alignItems:'center',
      justifyContent:'center'
    },
    tick:{
      height: 26,
      width:26,
    },
    tickRepeatTask:{
      height: 18,
      width:18,
    },
    frmInline:{
      flex:0.48
    },
    coloun:{
      fontSize:36,
      color: '#FFFFFF',
      lineHeight:36
    },
    frm:{
      marginTop:10,
      marginBottom:20
    },
    rescheduleTimeSlotBox:{
      height: 150, 
      backgroundColor: '#FFFFFF', 
      marginTop: -15, 
      shadowOpacity: 0.6,
      shadowOffset: { width: 0.5 ,height: 0.5 },
      shadowColor:'#000000',
      shadowRadius:1,
      borderRadius: 5,
    },
    frmRowMinus:{
      marginHorizontal:-4
    },
    frmInner:{
      flex:1,
      paddingHorizontal:4
    },
    topSmallMargin:{
      marginTop:10
    },
    dropdownContainer:{
      width:'100%',
      marginBottom:10,
      position:'relative',
    },
    dropdownButton:{
      backgroundColor:'#fff',
      padding:13,
      borderRadius:4,
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between'
    },
    buttonBorder:{
      borderWidth:1,
      borderColor:Colors.blue
    },
    dropdownButtonLarge:{
      padding:15,
      borderRadius:4,
    },
    dropdownButtonText:{
      fontFamily:Fonts.type.base,
      fontSize:14,
      color:Colors.titleColor,
      fontWeight:'700',
    },
    dropdownLargeButtonText:{
      fontSize:16,
    },
    downarrow:{
      width:18,
      height:18,
    },
    dropdown:{
      backgroundColor:'#fff',
      borderTopLeftRadius:0,
      borderTopRightRadius:0,
      borderBottomLeftRadius:4,
      borderBottomRightRadius:4,
      width:'100%',
      //height:Metrics.screenHeight/2,
      position:'absolute',
      left:0,
      right:0,
      top:'100%',
      marginTop:-5,
      zIndex:9999,
      paddingTop:5,
      overflow:'scroll'
    },
  
    dropdownLarge:{
      borderBottomLeftRadius:4,
      borderBottomRightRadius:4,
      marginTop:0,
      paddingTop:0,
      maxHeight:Metrics.screenHeight/1.5,
    },
    dropdownSmall:{
      borderBottomLeftRadius:5,
      borderBottomRightRadius:5,
      marginTop:0,
      paddingTop:0,
      maxHeight:Metrics.screenHeight/4.3,
      shadowOpacity: 1,
      shadowOffset: { height: 2 },
      shadowColor:'#efefef',
      elevation: 8,
      shadowRadius:5,
    },
    dropdownBoxshadow:{
      shadowOffset: { height: 2 },
      shadowColor: 'black',
      shadowOpacity: 1.0,
      elevation: 8,
      shadowRadius:5,
      borderWidth:1,
      borderBottomWidth:4,
      borderColor:'#efefef'
    },
    bottomRadiusNull:{
      borderBottomLeftRadius:0,
      borderBottomRightRadius:0,
    },
    dropdownItem:{
      borderBottomWidth:1,
      borderColor:'#ddd',
      padding:10
    },
    dropdownItemText:{
      fontFamily:Fonts.type.base,
      fontSize:14,
      color:Colors.titleColor,
    },
    dropdownImage:{
      height: 20,
      width: 20,
    },
    scheduleEditImage:{
      height: 24,
      width: 24,
    },
    bodyClose:{
      position:'absolute',
      left:0,
      top:0,
      right:0,
      bottom:0,
      backgroundColor:Colors.transparent,
      width:Metrics.screenWidth,
      height:Metrics.screenHeight
    },
    editTouch:{
      marginLeft:10
    },
    editIcon:{
      width:38,
      height:40,
    },
    colorPreview:{
      height:40,
      width:40,
      borderWidth:2,
      borderColor:'#fff',
      marginLeft:10,
      marginRight:10
    },
    inline:{
      flexDirection:'row',
      alignItems:'center'
    },
    paddingNull:{
      paddingLeft:0,
      paddingRight:0,
      paddingTop:0,
      paddingBottom:0
    },
    Calendar:{
      width: '100%', 
      borderRadius:10, 
      backgroundColor: '#689be5',
      borderBottomWidth:5,
      borderColor: '#4983c1',
    },
    modalView:{
      flex:1,
    },
    modalDialog:{
      backgroundColor:'#fff',
      borderRadius:15,
    },
    modalTopheader:{
      justifyContent:'center',
      alignItems:'center'
    },
    divider:{
      height:2,
      width:'100%',
      backgroundColor:Colors.blue,
      marginTop:5,
      marginBottom:10
    },
    rewardTouch:{
      width:50,
      height:50,
      borderRadius:50/2,
      margin:6,     
      justifyContent:'center',
      alignItems:'center'
    },
    rewardTouchActive:{
      borderWidth:1.5,
      borderColor:'#fff',
    },
    rewardIconImage:{
      width:40,
      height:40
    },
    ColorPalette:{
      position:'absolute',
      left:0,
      top:'100%',
      right:0
    },
    ScheduleItem:{
      paddingTop:15,
      paddingBottom:15,
      paddingLeft:10,
      paddingRight:10,
      borderRadius:8,
      shadowOpacity: 0.5,
      shadowOffset: { height: 1 },
      shadowColor:Colors.gray,
      elevation: 6,
      marginTop:15
    },
    purple:{
      backgroundColor:Colors.pink
    },
    yellow:{
      backgroundColor:Colors.yellow,
    },
    carrot:{
      backgroundColor:'#f6706f'
    },
    timer:{
      fontSize:16,
      fontFamily:Fonts.type.base,
      color:Colors.snow,
      fontWeight:'bold',
      marginBottom:8
    },
    ScheduleTask:{
      flexDirection:'row',
      flexWrap:'wrap',
      // alignItems:'center',
    },
    inlineButtonGroup:{
      flexDirection:'row',
      justifyContent:'space-between'
    },    
    inlineButton:{
      flex:0.48,
    },
    rewardGridContainer:{
      flexDirection:'row',
      flexWrap:'wrap',
      justifyContent:'space-between',
      marginTop:20,
    },
    borderTop:{
      borderTopWidth:1,
      borderColor:Colors.snow,
      paddingTop:20
    },
    rewardsDate:{
      flexBasis:'100%',
      fontSize:14,
      color:'#fff',
      fontWeight:'bold',
      marginBottom:10,
    },
    rewardsItem:{      
      flexBasis:'50%',
      marginBottom:10,
      paddingLeft:5,
      paddingRight:5
    },
    fullrewardsItem:{
      flexBasis:'100%',
      backgroundColor:'#000'
    },
    rewardsItemContent:{
      padding:10,
      borderRadius:4,
      shadowOpacity: 0.5,
      shadowOffset: { height: 1 },
      shadowColor:'#000',
      elevation: 6,
      backgroundColor:'#fff',
      position:'relative',
      overflow:'hidden'
    },
    rewardOverlay:{
      backgroundColor:'rgba(103,153,232,0.8)',
      position:'absolute',
      left:5,
      top:0,
      width:'100%',
      height:'100%',
      zIndex:1,
      justifyContent:'center',
      alignItems:'center'
    },
    ClaimedText:{
      color:Colors.snow,
      fontSize:15,
      fontFamily:Fonts.type.bold,
      fontWeight:'bold',
    },
    rewardsItemHeader:{
      color:'#262262',
      fontSize:12,
      fontFamily:Fonts.type.bold,
      fontWeight:'bold',
      marginBottom:5
    },
    rewardItemImageContainer:{
      height:100,
      marginBottom:10
    },
    imagePlaceholder:{
      width:'100%',
      height:'100%',
      resizeMode:'cover'
    },
    rewardsItemFooter:{
      flexDirection:'row',
      justifyContent:'space-between'
    },
    rewardRating:{
      flexDirection:'row',
      alignItems:'center',
      backgroundColor:'#6799e8',
      borderBottomWidth:2,
      borderColor:'#4580d5',
      padding:3,
      borderRadius:4
    },
    rewardIcon:{
      width:18,
      height:18,
    },
    reward_star:{
      width:14,
      height:14,
    },
    rewardText:{
      fontSize:9,
      color:'#fff',
      fontWeight:'bold',
      marginLeft:2,
      marginRight:2
    },
    rewardClear:{
      backgroundColor:'#6799e8',
      borderBottomWidth:2,
      borderColor:'#4580d5',
      padding:5,
      alignItems:'center',
      justifyContent:'center',
      borderRadius:4,
      flex:1,
      marginLeft:3
    },
    shareButton:{
      backgroundColor:'#6799e8',
      borderBottomWidth:4,
      borderColor:'#4580d5',
      height:55,
      padding:5,
      alignItems:'center',    
      borderRadius:4,
      flexDirection:'row'
    },
    
    rewardClearText:{
      fontSize:9,
      color:'#fff',
      fontWeight:'bold',
      paddingLeft:3,
      paddingRight:3,
      textAlign:'center'
    },
    progressBar:{
      borderWidth:1,
      borderColor:'#d1d3d4',
      backgroundColor:"#f1f2f2",
      height:10,
      borderRadius:10,
      width:'100%',
      marginBottom:10,
      overflow:'hidden'
    },
    progressComplete:{
      height:'100%',
      backgroundColor:'#ff6e6d',
      width:'100%'
    },
    blueTransparent:{
      backgroundColor:'rgba(17,17,61,0.77)',
      flex:1,
    },    
    dialogContainer:{
      flex:1,
      justifyContent:'center',
      alignItems:'center',
      padding:30,
    },
    rewardClaim:{
      width:160,
      height:160,
      resizeMode: 'contain',
    },
    dialog:{
      backgroundColor:Colors.snow,
      padding:30,
      width:'100%',
      borderRadius:10,
      paddingTop:60,
      marginTop:-30
    },
    dialogText:{
      fontSize:22,
      color:'#262262',
      fontWeight:'bold',
      textAlign:'center'
    },
    taskItemDate:{
      fontSize:15,
      color:Colors.titleColor,
      fontWeight:'bold',
      fontFamily:Fonts.type.base,
      paddingLeft:10,
      paddingRight:10,
      marginBottom:10
    },
    taskItem:{
      padding:10,
      backgroundColor:'#fff',
      borderRadius:4,
      marginBottom:15
    },
    taskListReschedule:{
      flexDirection:'row',
      alignItems:'center',
      paddingLeft:10,
      borderBottomWidth:1,
      borderColor:'#ddd'
    },
    taskListLast:{
      borderBottomWidth:0
    },
    taskLeft:{
      flex:1,
      flexDirection:'row',
      alignItems:'center'
    },
    taskListText:{
      flex:1,
      paddingRight:20,
      paddingLeft:10,
      fontSize:14,
      color:Colors.titleColor,
      fontWeight:'bold',
    },
    taskReschedule:{
      flex:0.5,
      backgroundColor:Colors.pink,
      justifyContent:'center',
      alignItems:'center',
      height:30,
      borderRadius:4,
      paddingHorizontal:5
    },
    taskRecover:{
      backgroundColor:Colors.restoreGreen,
      justifyContent:'center',
      alignItems:'center',
      alignSelf:'center',
      height:30,
      borderRadius:3,
      width:'90%',
    },
    taskRescheduleText:{
      fontSize:10,
      color:'#fff',
      fontWeight:'bold',
    },
    taskRecoverText:{
      fontSize:13,
      color:'#fff',
      fontWeight:'bold',
    },
    typeTokens:{
      flexDirection:'row',
      justifyContent:'space-around',
      alignItems:'center',      
      flexWrap:'wrap',
      paddingTop:20,
      paddingBottom:10
    },
    tokensClick:{
      padding:10,
    },
    tokensIconView:{
      width:65,
      height:65,
      borderRadius:65/2,
      borderWidth:2,
      borderColor:'#fff',
      justifyContent:'center',
      alignItems:'center',
      alignSelf:'center'
    },
    tokensIcon:{
      width:45,
      height:45
    },
    tokensText:{
      fontSize:16,
      color:'#fff',
      fontWeight:'bold',
    },
    dropdownSpaceBottom:{
      marginBottom:150
    },
    colorCode:{
      height:30,
      width:30,
      backgroundColor:'#ff0',
      marginRight:15
    },
    marginBottom:{
      marginBottom:15
    },
    modalCloseTouch:{
      alignSelf:'flex-end',
      paddingTop:15,
      paddingRight:15,
      paddingLeft:15,
    },
    close:{
      width:20,
      height:20,
      resizeMode:'contain'
    },
    taskCompleteImage:{
      width:140,
      height:140,
      resizeMode:'contain',
      marginBottom:-10
    },
    taskRewardImage:{
      width:95,
      height:95,
      resizeMode:'contain',
      // position:'absolute',
      // right:0,
      // top:-6
    },
    taskNoEnoughTokens:{
      width:100,
      height:100,
      resizeMode: 'contain'
    },
    notFoundMessage:{
      flex:1,
      justifyContent:'center',
      alignItems:'center'
    },
    shapeView:{
      alignItems:'center',
      position:'absolute',
      right:'100%',
      top:0,
      bottom:0,
      justifyContent:'center',
      alignItems:'center',
      paddingRight:10
    },
    shapeJoke:{
      padding:8,
      paddingRight:15,
      width:Metrics.screenWidth / 3,
      minHeight:Metrics.screenWidth / 8,
      justifyContent:'center',
      alignItems:'center',
      backgroundColor: Colors.darkPink,
      borderRadius:5,
      alignSelf:'center'
    },
    shape:{
      padding:8,
      paddingRight:15,
      width:Metrics.screenWidth / 3,
      minHeight:Metrics.screenWidth / 8,
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:'#6799e8',
      borderRadius:5,
      alignSelf:'center'
    },
    shapeText:{
      fontFamily:Fonts.type.base,
      fontSize:10,
      color:Colors.snow,
      fontWeight:'700',
    },
    shapeRight:{
      width:15,
      height:15,
      position:'absolute',
      right:0,
    },
    specialRewardText:{
      fontSize:14,
      color:'#5cd0ba',
      fontWeight:'700',
      marginBottom:8
    },
    editTask:{
      width:20,
      height:20,
      marginRight:20,
      resizeMode:'contain'
    },

    repeatTaskForWeek:{
      width:30,
      height:30,
      marginLeft:10,
    },
    tooltipContainerStyle:{
    backgroundColor: '#6799e8',
    borderRadius: 50,
    position:'absolute'
    },
    Tips:{
    backgroundColor: '#6799e8', borderRadius: 50, elevation: 8, shadowOpacity: 0.5,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: '#000000',
    shadowRadius: 1,
    },
    tooltipArrowStyle:{ backgroundColor: "transparent", borderColor: 'transparent', borderTopColor: 'transparent' },
    tipstextStyle:{ fontSize: 11, fontWeight: '700', paddingLeft: 6, paddingRight: 6 },
    contentStyle:{ maxWidth: 200,backgroundColor:'red'}
  },
}

export default ApplicationStyles
