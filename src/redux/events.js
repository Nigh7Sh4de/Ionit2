import moment from 'moment'
import { getEvents, createEvent, patchEvent, deleteEvent } from './google'

export const SAVE_EVENTS = 'SAVE_EVENTS'
export const FETCH_DELAY = 60

export function saveEvents(events, timeMin, timeMax) {
  return {
    type: SAVE_EVENTS,
    events,
    timeMin,
    timeMax,
  }
}

export function getGoogleCalendarEvents({ start, end, force }) {
  return async (dispatch, getState) => {
    const { settings } = getState().calendars
    const { lastFetch } = getState().events
    const timeMin = moment(start).startOf('day')
    const timeMax = moment(end || start)
      .startOf('day')
      .add(1, 'day')
    const delay = moment().subtract(FETCH_DELAY, 's')

    if (
      !force &&
      lastFetch.timeCalled &&
      moment(lastFetch.timeCalled) >= delay &&
      moment(lastFetch.timeMin) <= timeMin &&
      moment(lastFetch.timeMax) >= timeMax
    ) {
      return
    }

    for (let calendar of settings.incoming) {
      try {
        const newEvents = await getEvents({ calendar, timeMin, timeMax })
        dispatch(
          saveEvents(
            newEvents.map(event => ({
              ...event,
              calendar,
            })),
            timeMin,
            timeMax
          )
        )
      } catch (error) {
        console.error(error)
      }
    }
  }
}

export function createGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { outgoing } = getState().calendars.settings

    try {
      await createEvent({ calendar: outgoing, event })
      await dispatch(
        getGoogleCalendarEvents({
          start: event.start.dateTime,
          force: true,
        })
      )
    } catch (error) {
      console.error(error)
    }
  }
}

export function updateGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { calendar } = event
    try {
      await patchEvent({ calendar, event })
      await dispatch(
        getGoogleCalendarEvents({
          start: event.start.dateTime,
          force: true,
        })
      )
    } catch (error) {
      console.error(error)
    }
  }
}

export function deleteGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { calendar } = event
    try {
      await deleteEvent({ calendar, event })
      await dispatch(
        getGoogleCalendarEvents({
          start: event.start.dateTime,
          force: true,
        })
      )
    } catch (error) {
      console.error(error)
    }
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
