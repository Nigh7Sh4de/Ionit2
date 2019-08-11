import { getCalendars } from '../lib/google'

export const SET_CALENDARS = 'SET_CALENDARS'

export function setCalendars(calendars) {
  return {
    type: SET_CALENDARS,
    calendars,
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
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_CALENDARS:
      return { ...state, data: action.calendars }
    default:
      return state
  }
}
