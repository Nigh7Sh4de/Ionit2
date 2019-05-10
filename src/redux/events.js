import moment from 'moment'
import { getEvents, createEvent, patchEvent } from './google'

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
    const timeMin = moment(start)
      .startOf('day')
      .toISOString()
    const timeMax = moment(end || start)
      .endOf('day')
      .toISOString()

    let events = []
    for (let calendar of settings.incoming) {
      let newEvents = []
      try {
        newEvents = await getEvents({ calendar, timeMin, timeMax })
        console.log({ newEvents })
      } catch (error) {
        console.error(error)
        // dispatch(setError(error))
      }
      events = events.concat(
        newEvents.map(event => ({
          ...event,
          calendar,
        }))
      )
    }
    dispatch(addEvents(events))
  }
}

export function createGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { outgoing } = getState().calendars.settings
    const response = await createEvent({ calendar: outgoing, event })
    //TODO: deal with response errors
  }
}

export function updateGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { calendar } = event
    const response = await patchEvent({ calendar, event })
    //TODO: deal with response errors
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
  const all = [...newEvents, ...events]
  const seen = {}
  return all.filter(event => {
    if (!event.start.dateTime) return false
    if (seen[event.id] === true) return false
    seen[event.id] = true
    return true
  })
}
