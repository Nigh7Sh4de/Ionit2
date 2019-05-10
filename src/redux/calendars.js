import { getCalendars } from './google'

export const SET_CALENDARS = 'SET_CALENDARS'
export const SET_SETTINGS = 'SET_SETTINGS'

export function setCalendars(calendars) {
  return {
    type: SET_CALENDARS,
    calendars,
  }
}

export function setSettings(settings) {
  return {
    type: SET_SETTINGS,
    settings,
  }
}

export function getGoogleCalendarList() {
  return async dispatch => {
    const calendars = await getCalendars()
    dispatch(setCalendars(calendars))
  }
}

const initialState = {
  data: [],
  settings: {
    incoming: [],
    outgoing: null,
  },
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_CALENDARS:
      return { ...state, data: action.calendars }
    case SET_SETTINGS:
      return { ...state, settings: action.settings }
    default:
      return state
  }
}
