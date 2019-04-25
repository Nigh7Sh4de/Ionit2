import { combineReducers } from 'redux'
import events from './events'
import times from './times'
import users from './users'

export default combineReducers({ events, times, users })
