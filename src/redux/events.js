import moment from 'moment'
import { getEvents, createEvent, patchEvent, deleteEvent } from './google'

export const SAVE_EVENTS = 'SAVE_EVENTS'
export const FETCH_DELAY = 60 * 1000

export function saveEvents(events, timeMin, timeMax) {
  return {
    type: SAVE_EVENTS,
    events,
    timeMin,
    timeMax,
  }
}

export function getGoogleCalendarEvents({ start, end }) {
  return async (dispatch, getState) => {
    const { settings } = getState().calendars
    const { lastFetch } = getState().events
    const timeMin = moment(start)
      .startOf('day')
      .toISOString()
    const timeMax = moment(end || start)
      .startOf('day')
      .add(1, 'day')
      .toISOString()

    if (
      lastFetch.timeCalled <= moment().add(FETCH_DELAY, 's') &&
      lastFetch.timeMin <= timeMin &&
      lastFetch.timeMax >= timeMax
    ) {
      return
    }

    let events = []
    for (let calendar of settings.incoming) {
      let newEvents = []
      try {
        newEvents = await getEvents({ calendar, timeMin, timeMax })
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
    dispatch(saveEvents(events, timeMin, timeMax))
  }
}

export function createGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { outgoing } = getState().calendars.settings
    const response = await createEvent({ calendar: outgoing, event })
    //TODO: deal with response errors

    dispatch(getGoogleCalendarEvents({ start: event.start.dateTime }))
  }
}

export function updateGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { calendar } = event
    const response = await patchEvent({ calendar, event })
    //TODO: deal with response errors

    dispatch(getGoogleCalendarEvents({ start: event.start.dateTime }))
  }
}

export function deleteGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { calendar } = event
    const response = await deleteEvent({ calendar, event })
    //TODO: deal with response errors

    dispatch(getGoogleCalendarEvents({ start: event.start.dateTime }))
  }
}

const initialState = {
  data: [],
  lastFetch: {},
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SAVE_EVENTS:
      return massageEventsResponse(state, action)
    default:
      return state
  }
}

function massageEventsResponse(state, { events, timeMin, timeMax }) {
  let { data, lastFetch } = state
  data = [
    ...data.filter(
      event => event.end.dateTime <= timeMin || event.start.dateTime >= timeMax
    ),
    ...events.filter(event => event.start.dateTime),
  ]

  return {
    ...state,
    data,
    lastFetch: {
      timeMin: lastFetch.timeMin
        ? moment.min(moment(timeMin), moment(lastFetch.timeMin))
        : timeMin,
      timeMax: lastFetch.timeMax
        ? moment.max(moment(timeMax), moment(lastFetch.timeMax))
        : timeMax,
      timeCalled: new Date(),
    },
  }
}
