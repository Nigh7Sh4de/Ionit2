import { combineReducers } from 'redux'
import events from './events'
import pauses from './pauses'

export default combineReducers({ events, pauses })
