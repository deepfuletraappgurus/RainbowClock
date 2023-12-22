
import createReducer from '../helpers/createReducer'
import * as types from '../actions/types'
import AppNavigation from '../../Navigation/AppNavigation'

const initialAction = AppNavigation.router.getActionForPathAndParams('loginStack')
const initialNavState = AppNavigation.router.getStateForAction(initialAction)

const loggedInStatus = createReducer({}, {
  [types.SET_LOGGED_IN_STATE] (state, action) {
    return action
  }
})

const nav = (state = initialNavState, action) => {
  const nextState = AppNavigation.router.getStateForAction(action, state)

  //   if (action.routeName === 'TurnOnNotifications' || action.routeName === 'LoggedIn') {
  //     StatusBar.setBarStyle('dark-content', true);
  //   }

  return nextState || state
}

export {
  loggedInStatus,
  nav
}
