export const ADD_EVENT = 'ADD_EVENT'
export const SET_CALENDARS = 'SET_CALENDARS'
export const SET_SETTINGS = 'SET_SETTINGS'

export function addEvent(event) {
  return {
    type: ADD_EVENT,
    event,
  }
}

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

export function getGoogleCalendarList(accessToken) {
  return async dispatch => {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    const calendars = await response.json()
    if (calendars.items) dispatch(setCalendars(calendars.items))
  }
}

const initialState = {
  calendars: [],
  settings: {
    incoming: {},
    outgoing: {},
  },
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_EVENT:
      return { ...state, data: [...state.data, action.event] }
    case SET_CALENDARS:
      return { ...state, calendars: action.calendars }
    case SET_SETTINGS:
      return { ...state, settings: action.settings }
    default:
      return state
  }
}
