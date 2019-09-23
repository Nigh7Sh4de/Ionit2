import { combineReducers } from 'redux'
import { firestoreReducer } from 'redux-firestore'
import calendars from './calendars'
import settings from './settings'
import colors from './colors'
import times from './times'
import users from './users'
import events from './events'
import tags from './tags'
import calls from './calls'

export default combineReducers({
  firestore: firestoreReducer,
  calendars,
  settings,
  colors,
  times,
  users,
  events,
  tags,
  calls,
})
