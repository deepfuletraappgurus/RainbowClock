import React from 'react'
import { compose, legacy_createStore as createStore, applyMiddleware } from 'redux'
import {
  createReduxContainer,
  createReactNavigationReduxMiddleware
} from 'react-navigation-redux-helpers'
import { createLogger } from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import { connect } from 'react-redux'
import AppNavigation from './AppNavigation'
import reducer from '../Redux/reducers/'

const middleware = createReactNavigationReduxMiddleware(
  state => state.nav,
  'root'
)

const mapStateToProps = state => ({
  state: state.nav
})

const AppNavigator = createReduxContainer(AppNavigation, 'root')
const AppWithNavigationState = connect(mapStateToProps)(AppNavigator)

const loggerMiddleware = createLogger({ predicate: () => false})

const configureStore = (initialState) => {
  const enhancer = compose(
    applyMiddleware(
      middleware,
      thunkMiddleware,
      loggerMiddleware
    )
  )
  return createStore(reducer, initialState, enhancer)
}

const Root = () => <AppWithNavigationState />

export {
  configureStore,
  Root
}
