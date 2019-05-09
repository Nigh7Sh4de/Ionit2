import moment from 'moment'

export const ADD_EVENTS = 'ADD_EVENTS'

export function addEvents(events) {
  return {
    type: ADD_EVENTS,
    events,
  }
}

export function getGoogleCalendarEvents(start, end) {
  return async (dispatch, getState) => {
    const { settings } = getState().calendars
    const { accessToken } = getState().users.data
    const timeMin = moment(start).startOf('day')
    const timeMax = moment(end || start).endOf('day')
    let events = []
    for (let id in settings.incoming) {
      if (!settings.incoming[id]) continue

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${id}/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      newEvents = await response.json()
      if (newEvents.items) events = events.concat(newEvents.items)
    }
    dispatch(addEvents(events, { timeMin, timeMax }))
  }
}

export function createGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    // const { settings } = getState().calendars
    const { accessToken } = getState().users.data
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${'primary'}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(event),
      }
    )
    const result = await response.json()
    console.log({ result })
  }
}

const initialState = {
  data: [],
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_EVENTS:
      return {
        ...state,
        data: massageEventsResponse(state.data, action.events),
      }
    default:
      return state
  }
}

function massageEventsResponse(events, newEvents) {
  const all = [...events, ...newEvents]
  const seen = {}
  return all.filter(event => {
    if (!event.start.dateTime) return false
    if (seen[event.id] === true) return false
    seen[event.id] = true
    return true
  })
}
