import { Images } from '../Themes/';

const Constants = {

    APP_NAME: 'My Rainbow Clock',
    SERVER_ERROR: 'Server error! Please try again later.',
    IS_LOGIN: false,

    HOME_TIPS: '@homeTips',
    PARENT_HOME_TIPS: '@parentHomeTips',
    TASK_TIPS: '@taskTips',

    TASK_TYPE_DEFAULT: 'Default',
    TASK_TYPE_CUSTOM: 'Custom',
    TASK_TOKEN_SPECIAL: 'Special',
    TASK_TOKEN_STANDARD: 'Standard',
    TASK_STATUS_START: 'Start',
    TASK_STATUS_COMPLETED: 'Completed',


    CHILD_HOME_TIPS: [
        "colorWedge",
        // "hourSwitch",
        "bell",
        "house",
        "rewards"
    ],
    CHILD_TASK_TIPS: [
        "complate",
        "information"
    ],
    PARENT_HOME_SCREEN_TIPS: [
        // "colorWedge",
        "bell",
        "rewards",
    ],

    //Navigation
    ARR_DRAWER: [
        { title: 'Clock', img: Images.navIcon1, screen: 'HomeScreen' },
        { title: 'Reward', img: Images.navIcon2, screen: 'ChildClaimedRewardsScreen' },
        { title: 'Schedule', img: Images.navIcon3, screen: 'ScheduleScreen' },
        { title: 'User Profile', img: Images.navIcon4, screen: 'ChildProfileScreen' },
        { title: 'Admin Portal', img: Images.navIcon11, screen: 'ParentsPortalPinScreen' },
        // { title: 'Edit Clock', img: Images.navIcon5, screen: 'ParentsPortalPinScreen' },
        { title: 'Change User', img: Images.navIcon6, screen: 'SelectUserScreen' },
        { title: 'Share This App', img: Images.navIcon7, screen: 'ShareScreen' },
        { title: 'Logout', img: Images.navIcon8, screen: '' },
    ],

    ARR_PARENT_PORTAL_DRAWER: [
        { title: 'Clock', img: Images.navIcon1, screen: 'ParentHomeScreen' },
        { title: 'Schedule', img: Images.navIcon3, screen: 'ScheduleScreen' },
        // { title: 'School Hours', img: Images.navIcon9, screen: 'SchoolHoursScreen' },
        { title: 'Reward', img: Images.navIcon2, screen: 'RewardScreen' },
        { title: 'My Tasks', img: Images.navIcon10, screen: 'RescheduleScreen' },
        { title: 'Change User', img: Images.navIcon6, screen: 'ParentsSelectChildScreen' },
        // { title: 'Admin Profile', img: Images.navIcon11, screen: 'ParentsProfileScreen' },
        { title: 'Admin Profile', img: Images.navIcon11, screen: 'ParentsUpdateProfileScreen' },
        { title: 'Exit Admin Portal', img: Images.navIcon12, screen: 'ParentsPortalPinScreen' },
        { title: 'Share This App', img: Images.navIcon7, screen: 'ShareScreen' },
        { title: 'Logout', img: Images.navIcon8, screen: '' },
    ],

    WEEK_DAYS: '{ "MON":{ "FROM":"", "TO": "", "isSelected":false}, "TUE":{"FROM":"","TO":"", "isSelected":false},'
        + ' "WED":{"FROM":"","TO":"", "isSelected":false}, "THU":{"FROM":"", "TO": "", "isSelected":false},'
        + ' "FRI":{"FROM":"","TO":"", "isSelected":false} }',

    //EventEmitter
    EVENT_CHILD_UPDATE: 'child_update',
    EVENT_DRAWER_UPDATE: 'drawer_update',
    EVENT_REWARD_COIN_UPDATE: 'reward_coin_update',

    // AsyncStorage Keys
    KEY_USER: 'user',
    KEY_IS_LOGIN: 'is_login',
    KEY_USER_TOKEN: 'user_token',
    KEY_USER_IMAGE: 'user_image',
    KEY_USER_NAME: 'user_name',
    KEY_USER_PIN: 'user_pin',
    KEY_USER_HAVE_CHILDREN: 'user_have_children',
    KEY_SELECTED_CHILD: 'selected_child',
    KEY_IS_24HRS_CLOCK: 'is_24hrsClock',
    KEY_ACCESS_AS_PARENTS: 'is_access_as_parents',
    KEY_LAST_APP_ACCESS_DAY: 'is_last_access_day',

    // Share options
    KEY_FACEBOOK: 'Facebook',
    KEY_TWITTER: 'Twitter',
    KEY_EMAIL: 'Email',

    // Message
    MESSAGE_NO_INTERNET: "Sorry You're Not Connected to the Internet.",
    MESSAGE_NO_USERNAME: "Please enter username.",
    MESSAGE_NO_CHILDNAME: "Please enter child name.",
    MESSAGE_VALID_USERNAME: "Please enter valid username.",
    MESSAGE_NO_EMAIL: "Please enter email.",
    MESSAGE_VALID_EMAIL: "Please enter valid email address.",
    MESSAGE_NO_PASSWORD: "Please enter password.",
    MESSAGE_PASSWORD_LENGTH: "Password must be of minimum 8 characters.",
    MESSAGE_USERNAME_LENGTH: "Username must be of minimum 7 characters.",
    MESSAGE_NO_CONFIRMPASSWORD: "Please enter confirm password.",
    MESSAGE_NOTMATCH_CONFIRMPASSWORD: "Password and Confirm Password does not match.",
    MESSAGE_PASSWORD_ERROR: "Password should have at least one uppercase, one lowercase, one number and one special character.", //MP
    MESSAGE_PIN_LENGTH: "PIN and Confirm PIN must be of 4 digit.",
    MESSAGE_ONLY_PIN_LENGTH: "PIN must be of 4 digit.",
    MESSAGE_NOTMATCH_CONFIRMPIN: "PIN and Confirm PIN does not match.",
    MESSAGE_VALID_CHILD_NAME: "Please enter valid childs name.",
    MESSAGE_EDIT_CHILD_INFO: "Please edit child profile to update it.",
    MESSAGE_SELECT_BOTH_TIME: "Please select From and To time.",
    MESSAGE_SELECT_DAY_SH: "Please select at least one day to update the school hours.",
    MESSAGE_SELECT_FROM_TIME: "Please select FROM time for the task.",
    MESSAGE_SELECT_TO_TIME: "Please select TO time for the task.",
    MESSAGE_FROM_LESSTHAN_TO: "You can not choose TO time before FROM time.",
    MESSAGE_CAN_NOT_CHOOSE_TIME: 'This time block is already choosen.',
    MESSAGE_NO_TASK_NAME: "Please enter task name.",
    MESSAGE_SELECT_TASK_TIME: "Please select task time.",
    MESSAGE_SELECT_TASK_TOKEN_TYPE: "Please select task token type.",
    MESSAGE_NO_TASK_TOKEN: "Please enter number of tokens for the task.",
    MESSAGE_NO_TASK_ICON: "Please add the icon for the task.",
    MESSAGE_NO_DAY_SELECT: "Please select at least one date to schedule a task.",
    MESSAGE_NO_FUTURE_TASK: "You can not start or complete tasks for future date and time.",
    MESSAGE_NO_GREATER_TASK: "The choosen task time should not be greater than the available time slot.",
    MESSAGE_NO_NEWPASSWORD: "Please enter new password.",
    MESSAGE_NO_OLDPASSWORD: "Please enter old assword.",
    MESSAGE_NEWPASSWORD_LENGTH: "New password must be of minimum 6 characters.",
    MESSAGE_NO_VERIFICATIONCODE: "Please enter verification code.",
    MESSAGE_NOTMATCH_NEWCONFIRMPASSWORD: "New Password and Confirm Password does not match.",
    MESSAGE_NO_NAME: "Please enter name.",
    MESSAGE_NO_BIRTHDATE: "Please enter birthdate.",
    MESSAGE_NO_BESTPICTURE: "Please add your best picture.",
    MESSAGE_ACCOUNT_DELETE: "Are you sure you want to delete account?",
    MESSAGE_USER_LOGOUT: "Are you sure you want to logout?",
    MESSAGE_ONE_IMAGE_REQUIRE: "We need at least your one picture",
    MESSAGE_NO_CONTACT_NUMBER: 'Please enter contact number.',
    MESSAGE_NO_VALID_CONTACT_NUMBER: 'Please enter valid contact number.',
    MESSAGE_NO_MESSAGE: "Please enter message.",
    MESSAGE_VALID_COMMUNITY: "Please enter valid community.",
    MESSAGE_VALID_ABOUTME: "Please enter valid about me.",
    MESSAGE_VALID_OCCUPATION: "Please enter valid occupation.",
    MESSAGE_NO_TASK_ON_DAY: "You don't have any tasks or time slots on this day.",
    MESSAGE_SELECT_DAY_RESCHEDULE: "Please select a day to reschedule a task.",
    MESSAGE_SELECT_TIME_RESCHEDULE: "Please select a time slot to reschedule a task.",
    MESSAGE_NO_REPEAT: "It's SUNDAY. \n Please try to repeat the task on some other day",
    MESSAGE_NO_DAY_SELECT_SCHEDULE: "Please select at least one day to schedule a task.",
    MESSAGE_SCHOOL_DAY_VALIDATION:'School Task Must be 6 AM to 6PM',
    MESSAGE_CREATE_TASK_TIME_VALIDATION:'Start and End times cannot be more than 24 hours or less than 15min.  Please select a time frame between this.',
    //Other Messages 
    TEXT_FATCHING_CHILD: 'FETCHING YOUR USERS',
    TEXT_FATCHING_TASKS: 'FETCHING YOUR TASKS...',
    TEXT_NO_TASKS: "YOU DON'T HAVE ANY TASK",
    TEXT_NO_CHILD_ADDED_YET: "YOU HAVEN'T ADDED ANY CHILD YET. LET'S EXPERIENCE THE MY RAINBOW CLOCK BY ADDING YOUR CHILD",
    ADD_CHILD_CONFIRMATION_NO:'If you wish to add another child later you can do so in the Admin Profile which you can access from the menu bar.', //MP
    ADD_CHILD_SUCCESS:'Child has been added successfully!',//MP
    //Planet Messages
    MONDAY_MESSAGE: `It's MONDAY.\nI was named after the moon. I am a natural satellite that orbits the earth.`,
    TUESDAY_MESSAGE: `It's TUESDAY.\nI was named after Mars, also known as the Red Planet.`,
    WEDNESDAY_MESSAGE: `It's WEDNESDAY.\nI was named after Mercury, the smallest planet in our solar system.`,
    THURSDAY_MESSAGE: `It's THURSDAY.\nI was named after the planet Jupiter, a gas giant.`,
    FRIDAY_MESSAGE: `It's FRIDAY.\nI was named after Venus the second planet from the Sun.`,
    SATURDAY_MESSAGE: `It's SATURDAY.\nI was named after Saturn. I am the second largest planet in our solar system.`,
    SUNDAY_MESSAGE: `It's SUNDAY.\nI was named after the Sun. I am a Star. All the planets in our solar system orbit around me.`,

    // URL Keys
    URL_PRIVACY_POLICY: "",
    URL_TERMS_OF_USE: "",

    //Rewards
    standardReward: 0,
    specialReward: 0,
    standardRewardIcon: Images.reward_star,


    //Background Image
    BACKGROUND_IMAGE : 'backgroundImage',
    NAV_COLOR:'navColor'
}

export default Constants