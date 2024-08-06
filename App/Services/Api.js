// a library to wrap and simplify api calls
import AsyncStorage from '@react-native-async-storage/async-storage';
import apisauce from 'apisauce';
import Constants from '../Components/Constants';

//BASE URL
//const base_url = 'https://myrainbowclock.dev-applications.net/api/v1'; //Dev
// const base_url = ''; //Live
const base_url = 'https://myrainbowclock.clouddownunder.com.au/public/api/v1';

// our "constructor"
const create = (baseURL = base_url) => {
  // ------
  // STEP 1
  // ------
  //
  // Create and configure an apisauce-based api object.
  //
  const api = apisauce.create({
    // base URL is read from the "constructor"
    baseURL,
    // here are some default headers
    headers: {
      'Cache-Control': 'no-cache',
    },
    // 10 second timeout...
    timeout: 10000,
  });

  // api.addResponseTransform(response => {
  //   console.log('RESPONSE  API RESPONSE--------------',response)
  //   if (response.data && response.data.error === "no user found") {
  //     // Call logout function here
  //   }
  // });

  // const apiMonitor = (response) => {
  // }
  // api.addMonitor(apiMonitor)

  // ------
  // STEP 2
  // ------
  //
  // Define some functions that call the api.  The goal is to provide
  // a thin wrapper of the api layer providing nicer feeling functions
  // rather than "get", "post" and friends.
  //
  // I generally don't like wrapping the output at this level because
  // sometimes specific actions need to be take on `403` or `401`, etc.
  //
  // Since we can't hide from that, we embrace it by getting out of the
  // way at this level.
  //

  const getUser = username => api.get('search/users', {q: username});
  const doSignUp = (
    username,
    email,
    password,
    device_id,
    device_type,
    device_token,
  ) =>
    api.post('/signup', {
      username: username,
      email: email,
      password: password,
      device_id: device_id,
      device_type: device_type,
      device_token: device_token,
    });
  const doLogIn = (username, password, device_id, device_type, device_token) =>
    api.post('/login', {
      username: username,
      password: password,
      device_id: device_id,
      device_type: device_type,
      device_token: device_token,
    });
  const getRewardIcons = () => api.get('/icons');
  const doForgotPassword = username =>
    api.post('/forgot', {username: username});

  // ------
  // STEP 3
  // ------
  //
  // Return back a collection of functions that we would consider our
  // interface.  Most of the time it'll be just the list of all the
  // methods in step 2.
  //
  // Notice we're not returning back the `api` created in step 1?  That's
  // because it is scoped privately.  This is one way to create truly
  // private scoped goodies in JavaScript.
  //
  return {
    // a list of the API functions from step 2
    getUser,
    doSignUp,
    doLogIn,
    getRewardIcons,
    doForgotPassword,
  };
};

const createSecure = (baseURL = base_url) => {
  // ------
  // STEP 1
  // ------
  //
  // Create and configure an apisauce-based api object.
  //

  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);

  // NetInfo.isConnected.fetch().then(isConnected => {
  //   if (isConnected) {
  const api = apisauce.create({
    // base URL is read from the "constructor"
    baseURL,
    // here are some default headers
    headers: {
      'Cache-Control': 'no-cache',
      Connection: 'close',
    },
    // 15 second timeout...
    timeout: 20000,
  });
  // }

  api.addAsyncRequestTransform(request => async () => {
    request.headers.Authorization =
      'Bearer ' + (await AsyncStorage.getItem(Constants.KEY_USER_TOKEN));
  });

  const apiMonitor = response => {};
  api.addMonitor(apiMonitor);

  // api.addResponseTransform(response => {
  //   console.log('API RESPONSE--------------',response)
  //   if (response.data && response.data.error === "no user found") {
  //     // Call logout function here
  //   }
  // });

  // ------
  // STEP 2
  // ------
  //
  // Define some functions that call the api.  The goal is to provide
  // a thin wrapper of the api layer providing nicer feeling functions
  // rather than "get", "post" and friends.
  //
  // I generally don't like wrapping the output at this level because
  // sometimes specific actions need to be take on `403` or `401`, etc.
  //
  // Since we can't hide from that, we embrace it by getting out of the
  // way at this level.
  //

  const doSetPin = pin => {
    const data = new FormData();
    data.append('pin', pin);
    return api.post('/setpin', data);
  };

  const addchild = (name, photo, startDate, endDate) => {
    const data = new FormData();
    data.append('name', name);
    data.append('startTime', startDate);
    data.append('endTime', endDate);
    if (
      photo != undefined &&
      photo != null &&
      photo.trim != '' &&
      photo.mime &&
      photo.path
    ) {
      const mime = photo.mime;
      const arrMime = mime.split('/').reverse();
      const strExtension = arrMime[0];

      data.append('profile_pic', {
        uri: photo.path,
        type: mime,
        name: timestamp + '.' + strExtension,
      });
    }

    return api.post('/addchild', data);
  };

  const getChildren = () => {
    return api.get('/children');
  };

  const getCategories = () => {
    return api.get('/categories');
  };

  const getSavedtask = child_id => {
    const data = new FormData();
    data.append('child_id', child_id);
    return api.post('/futuretasks', data);
  };

  const deleteSavedtask = (tid, child_id) => {
    const data = new FormData();
    data.append('tid', tid);
    data.append('child_id', child_id);
    return api.post('/deleteFutureTask', data);
  };

  const updateChild = (childId, name, photo, rewardIcon) => {
    const data = new FormData();
    //Parms
    data.append('cid', childId);
    data.append('name', name);
    data.append('icon', rewardIcon);

    if (
      photo != undefined &&
      photo != null &&
      photo.trim != '' &&
      photo.mime &&
      photo.path
    ) {
      const mime = photo.mime;
      const arrMime = mime.split('/').reverse();
      const strExtension = arrMime[0];

      data.append('profile_pic', {
        uri: photo.path,
        type: mime,
        name: timestamp + '.' + strExtension,
      });
    }

    return api.post('/updatechild', data);
  };

  const doVerifyPin = pin => {
    const data = new FormData();
    data.append('pin', pin);
    return api.post('/verify', data); //Need to change endpoint
  };

  const doForgotPin = () => {
    return api.post('/pin', null);
  };

  const doUpdateShoolHours = (childId, dayJSON) => {
    const data = new FormData();
    //Parms
    data.append('cid', childId);
    data.append('hours', dayJSON);
    return api.post('/schoolhours', data);
  };

  const getJokeOfTheDay = day => {
    const data = new FormData();
    //Parms
    // data.append('day', day);
    return api.get('/jokes');
  };

  const doUpdateParentProfile = (
    username,
    email,
    pin,
    device_id,
    device_type,
    device_token,
  ) => {
    const data = new FormData();
    //Parms
    data.append('username', username);
    data.append('email', email);
    data.append('pin', pin);
    data.append('device_id', device_id);
    data.append('device_type', device_type);
    data.append('device_token', device_token);
    return api.post('/updateprofile', data);
  };

  const addTask = (
    childId,
    mainCatId,
    subCatId,
    taskType,
    timeSloteName,
    taskName,
    taskDescription,
    taskFromTime,
    taskToTime,
    taskTime,
    taskColor,
    taskTokenType,
    taskNumberOfTokens,
    taskDates,
    taskCustomIcon,
    frequency,
    is_date,
    is_school_clock,
    is_saved_for_future,
    task_id,
    from_listing,
    is_new,
  ) => {
    const data = new FormData();
    //Parms
    data.append('child_id', childId);
    data.append('mcid', mainCatId);
    data.append('ccid', subCatId);
    data.append('type', taskType);
    data.append('name', timeSloteName);
    data.append('task_name', taskName);
    data.append('description', taskDescription);
    data.append('time_from', taskFromTime);
    data.append('time_to', taskToTime);
    data.append('task_time', taskTime);
    data.append('color', taskColor);
    data.append('token_type', taskTokenType);
    data.append('no_of_token', taskNumberOfTokens);
    data.append('task_date', taskDates);
    data.append('is_date', is_date);
    data.append('is_school_clock', is_school_clock?.toString());
    data.append('is_saved_for_future', is_saved_for_future?.toString());
    data.append('task_id', task_id);
    data.append('from_listing', from_listing);
    data.append('is_new', is_new);
    if (frequency) {
      data.append('frequency', frequency);
    }

    if (
      taskCustomIcon != undefined &&
      taskCustomIcon != null &&
      taskCustomIcon.trim != '' &&
      taskCustomIcon.mime &&
      taskCustomIcon.path
    ) {
      const mime = taskCustomIcon.mime;
      const arrMime = mime.split('/').reverse();
      const strExtension = arrMime[0];

      data.append('cicon', {
        uri: taskCustomIcon.path,
        type: mime,
        name: timestamp + '.' + strExtension,
      });
    }

    console.log('ADD TASK', data);
    return api.post('/addtask', data);
  };

  const checkTaskAvaibalilty = (
    fromTime,
    toTime,
    task_date,
    child_id,
    is_date,
  ) => {
    const data = new FormData();
    //Parms
    data.append('child_id', child_id);
    data.append('time_from', fromTime);
    data.append('time_to', toTime);
    data.append('task_date', task_date);
    data.append('is_date', is_date);

    return api.post('/check_time_exist', data);
  };

  const updateTask = (
    taskId,
    childId,
    mainCatId,
    subCatId,
    taskType,
    taskName,
    taskTime,
    taskTokenType,
    taskNumberOfTokens,
    is_saved_for_future,
  ) => {
    const data = new FormData();
    //Parms
    data.append('tid', taskId);
    data.append('child_id', childId);
    data.append('mcid', mainCatId);
    data.append('ccid', subCatId);
    data.append('type', taskType);
    data.append('task_name', taskName);
    data.append('task_time', taskTime);
    data.append('token_type', taskTokenType);
    data.append('no_of_token', taskNumberOfTokens);
    data.append('is_saved_for_future', is_saved_for_future);

    // if (
    //   taskCustomIcon != undefined &&
    //   taskCustomIcon != null &&
    //   taskCustomIcon.trim != '' &&
    //   taskCustomIcon.mime &&
    //   taskCustomIcon.path
    // ) {
    //   const mime = taskCustomIcon.mime;
    //   const arrMime = mime.split('/').reverse();
    //   const strExtension = arrMime[0];

    //   data.append('cicon', {
    //     uri: taskCustomIcon.path,
    //     type: mime,
    //     name: timestamp + '.' + strExtension,
    //   });
    // }
    console.log('UPDATE TASK ______', data);
    return api.post('/subTaskUpdate', data);
  };

  const updateSchedule = (
    tid,
    child_id,
    name,
    time_from,
    time_to,
    color,
    task_date,
    is_date,
    is_new,
    is_school_clock,
  ) => {
    const data = new FormData();
    //Parms
    data.append('tid', tid);
    data.append('child_id', child_id);
    data.append('name', name);
    data.append('time_from', time_from);
    data.append('time_to', time_to);
    data.append('color', color);
    data.append('task_date', task_date.join(','));
    data.append('is_date', is_date);
    data.append('is_new', is_new);
    data.append('description', '');
    data.append('is_school_clock', is_school_clock);

    console.log('UPDATE SCHEDULE',data)

    return api.post('/updatetask', data);
  };

  const deleteSchedule = (tid, child_id, is_new) => {
    const data = new FormData();
    //Parms
    data.append('tid', tid);
    data.append('child_id', child_id);
    data.append('is_new', is_new);

    return api.post('/deletetask', data);
  };

  const deleteSubTask = (tid, child_id) => {
    const data = new FormData();
    //Parms
    data.append('tid', tid);
    data.append('child_id', child_id);

    return api.post('/deleteSubTask', data);
  };

  const childTasksList = (childId, childStatus, date, is_week = '0',next_day=0) => {
    const data = new FormData();
    data.append('child_id', childId);
    data.append('status', childStatus);
    data.append('date', date);
    data.append('is_week', is_week);
    data.append('next_day',next_day)
    return api.post('tasks', data);
  };

  const childRewardPoints = childId => api.post('points', {child_id: childId});

  const createReward = (name, type, numberOfToken, imageData, child_id) => {
    const data = new FormData();
    data.append('name', name);
    data.append('type', type ? 'Special' : 'Standard');
    data.append('no_of_tokens', numberOfToken);
    data.append('icon', {
      uri: imageData.path,
      type: imageData.mime,
      name: timestamp + '.' + imageData.mime.split('/').reverse()[0],
    });
    data.append('child_id', child_id);

    return api.post('rewards/add', data); //type = Special,Standard
  };

  const updateReward = (id, name, type, numberOfToken, imageData) => {
    const data = new FormData();
    data.append('rid', id);
    data.append('name', name);
    data.append('type', type ? 'Special' : 'Standard');
    data.append('no_of_tokens', numberOfToken);
    if (imageData && typeof imageData === 'object' && imageData.path && imageData.mime) {
      data.append('icon', {
        uri: imageData.path,
        type: imageData.mime,
        name: timestamp + '.' + imageData.mime.split('/').reverse()[0],
      });
    }
    console.log('UPDATE REWARD DATA',data)
    return api.post('rewards/update', data);
  };

  const printTask = (childId, taskDate) =>
    api.post('/print', {child_id: childId, task_date: taskDate}); //MP

  const parentRewardList = (status = '') =>
    api.post('rewards/all', {status: status});

  const clearReward = rewardId => api.post('rewards/clear', {rid: rewardId});

  const deleteReward = rewardId => api.post('rewards/delete', {rid: rewardId})

  const claimReward = (rewardId, childId) =>
    api.post('rewards/claim', {rid: rewardId, child_id: childId});
  const clearRewardNotification = childId =>
    api.post('rewards/clearcount', {child_id: childId});

  const childReward = childId =>
    api.post('rewards/crewards', {child_id: childId});

  const updateTaskStatus = (taskId, childId, status, is_new) => {
    const data = new FormData();
    data.append('tid', taskId);
    data.append('child_id', childId);
    data.append('status', status);
    data.append('is_new', is_new);
    console.log('ISSSSSSSSSSSSS', data);
    return api.post('status', data);
  };

  const restoreTask = (taskId, childId) => {
    const data = new FormData();
    data.append('tid', taskId);
    data.append('child_id', childId);
    console.log('RESTORE CALL', data);
    return api.post('restore', data);
  };

  const deleteTask = (taskId, childId) => {
    const data = new FormData();
    data.append('tid', taskId);
    data.append('child_id', childId);
    return api.post('deletetask', data);
  };

  const deleteChild = cid => {
    return api.delete(`removeChild?cid=${cid}`);
  };

  const deleteProfile = () => {
    return api.delete('delete-profile');
  };

  const logout = () => {
    return api.get('logout');
  };
  return {
    doSetPin,
    deleteProfile,
    addchild,
    getChildren,
    getCategories,
    updateChild,
    doVerifyPin,
    doForgotPin,
    doUpdateShoolHours,
    doUpdateParentProfile,
    clearRewardNotification,
    addTask,
    checkTaskAvaibalilty,
    updateTask,
    childTasksList,
    childRewardPoints,
    parentRewardList,
    deleteTask,
    updateTaskStatus,
    createReward,
    updateReward,
    clearReward,
    claimReward,
    childReward,
    restoreTask,
    getJokeOfTheDay,
    deleteChild,
    printTask,
    getSavedtask,
    updateSchedule,
    deleteSchedule,
    deleteSubTask,
    deleteSavedtask,
    logout,
    deleteReward
  };
};

// let's return back our create method as the default.
export default {
  create,
  createSecure,
};
