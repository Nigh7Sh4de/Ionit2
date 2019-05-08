import { combineReducers } from 'redux'
import calendars from './calendars'
import times from './times'
import users from './users'
import events from './events'

export default combineReducers({ calendars, times, users, events })
