import { combineReducers } from 'redux'
import calendars from './calendars'
import colors from './colors'
import times from './times'
import users from './users'
import events from './events'
import calls from './calls'

export default combineReducers({
  calendars,
  colors,
  times,
  users,
  events,
  calls,
})
