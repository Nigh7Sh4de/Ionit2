export const SET_SETTINGS_CALENDARS = 'SET_SETTINGS_CALENDARS'
export const SET_SETTINGS_INTERVAL = 'SET_SETTINGS_INTERVAL'

export function setSettingsCalendars(calendars) {
  return {
    type: SET_SETTINGS_CALENDARS,
    calendars,
  }
}

export function setSettingsInterval(interval) {
  return {
    type: SET_SETTINGS_INTERVAL,
    interval,
  }
}

const initialState = {
  calendars: {
    incoming: [],
    outgoing: null,
  },
  interval: 60,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_SETTINGS_CALENDARS:
      return { ...state, calendars: action.calendars }
    case SET_SETTINGS_INTERVAL:
      return { ...state, interval: action.interval }
    default:
      return state
  }
}
