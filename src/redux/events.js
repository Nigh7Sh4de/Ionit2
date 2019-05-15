import moment from 'moment'
import { getEvents, createEvent, patchEvent, deleteEvent } from './google'

export const ADD_EVENTS = 'ADD_EVENTS'

export function addEvents(events, timeMin, timeMax) {
  return {
    type: ADD_EVENTS,
    events,
    timeMin,
    timeMax,
  }
}

export function getGoogleCalendarEvents(start, end) {
  return async (dispatch, getState) => {
    const { settings } = getState().calendars
    const timeMin = moment(start)
      .startOf('day')
      .toISOString()
    const timeMax = moment(end || start)
      .startOf('day')
      .add(1, 'day')
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
    dispatch(addEvents(events, timeMin, timeMax))
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

export function deleteGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { calendar } = event
    const response = await deleteEvent({ calendar, event })
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
        data: massageEventsResponse(state, action),
      }
    default:
      return state
  }
}

function massageEventsResponse({ data }, { events, timeMin, timeMax }) {
  return [
    ...events.filter(event => event.start.dateTime),
    ...data.filter(
      event => event.end.dateTime <= timeMin || event.start.dateTime >= timeMax
    ),
  ]
}
