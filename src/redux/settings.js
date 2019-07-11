export const SET_SETTINGS_CALENDARS = 'SET_SETTINGS_CALENDARS'

export function setSettingsCalendars(settings) {
  return {
    type: SET_SETTINGS_CALENDARS,
    settings,
  }
}

const initialState = {
  calendars: {
    incoming: [],
    outgoing: null,
  },
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_SETTINGS_CALENDARS:
      return { ...state, calendars: action.settings }
    default:
      return state
  }
}
