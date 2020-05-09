import moment from 'moment-timezone'
import uuidv4 from 'uuid/v4'
import * as Google from '../lib/google'
import { addCall, processQueue } from './calls'
import { showMessage } from 'react-native-flash-message'
import { rrulestr } from 'rrule'

export const SAVE_EVENTS = 'SAVE_EVENTS'
export const SET_EVENT = 'SET_EVENT'
export const UPDATE_RECURRING_EVENT = 'UPDATE_RECURRING_EVENT'
export const DELETE_RECURRING_EVENT = 'DELETE_RECURRING_EVENT'
export const DELETE_EVENT = 'DELETE_EVENT'
export const FETCH_DELAY = 60

export function saveEvents(events, calendar, syncToken) {
  showMessage({
    message: 'Connected to Google',
    description: `${events.length} events updated in ${calendar} calendar`,
    type: 'success',
  })

  return {
    type: SAVE_EVENTS,
    events,
    calendar,
    syncToken,
  }
}

export function addEvent({ event, calendar }) {
  return {
    type: SET_EVENT,
    event,
    calendar,
  }
}

export function updateRecurringFutureEvent({ event, calendar, newId }) {
  return {
    type: UPDATE_RECURRING_EVENT,
    event,
    calendar,
    newId,
  }
}

export function deleteRecurringFutureEvent({ event, calendar }) {
  return {
    type: DELETE_RECURRING_EVENT,
    event,
    calendar,
  }
}

export function deleteEvent({ event, calendar }) {
  return {
    type: DELETE_EVENT,
    event,
    calendar,
  }
}

export function getGoogleCalendarEvents({ force } = {}) {
  return async (dispatch, getState) => {
    console.group('getGoogleCalendarEvents')
    await dispatch(processQueue())
    console.log('Queue processed.')

    const { calendars } = getState().settings
    const { lastFetch } = getState().events
    const delay = moment().subtract(FETCH_DELAY, 's')

    console.log('Use settings', { calendars, lastFetch, force })

    if (
      !force &&
      lastFetch.timeCalled &&
      moment(lastFetch.timeCalled) >= delay
    ) {
      console.log('Skip data fetch.')
      console.groupEnd()
      return
    }

    for (let calendar of calendars.incoming) {
      console.log({ calendar })
      try {
        const { items, syncToken } = await Google.getEvents({
          calendar,
          syncToken: lastFetch.syncTokens[calendar],
        })
        dispatch(
          saveEvents(
            items.map((event) => ({
              ...event,
              calendar,
            })),
            calendar,
            syncToken
          )
        )
      } catch (error) {
        console.log({ error })
      }
    }
    console.groupEnd()
  }
}

export function createGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { outgoing } = getState().settings.calendars
    const payload = {
      event: {
        ...event,
        id: uuidv4().replace(/-/g, ''),
      },
      calendar: outgoing,
    }
    dispatch(addEvent(payload))
    dispatch(addCall({ type: 'createEvent', payload }))
    dispatch(getGoogleCalendarEvents({ force: true }))
    return payload
  }
}

export function patchGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { outgoing } = getState().settings.calendars
    const payload = {
      event,
      calendar: outgoing,
    }
    dispatch(addEvent(payload))
    dispatch(addCall({ type: 'patchEvent', payload }))
    dispatch(getGoogleCalendarEvents({ force: true }))
    return payload
  }
}

export function patchRecurringFutureGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const events = getState().events.data
    const { outgoing } = getState().settings.calendars
    const payload = {
      newId: uuidv4().replace(/-/g, ''),
      event,
      recurringEvent: events[event.recurringEventId].event,
      calendar: outgoing,
    }
    dispatch(updateRecurringFutureEvent(payload))
    dispatch(addCall({ type: 'patchRecurringFutureEvent', payload }))
    dispatch(getGoogleCalendarEvents({ force: true }))
    return payload
  }
}

export function deleteRecurringFutureGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const events = getState().events.data
    const { outgoing } = getState().settings.calendars
    const payload = {
      event,
      calendar: outgoing,
      recurringEvent: events[event.recurringEventId].event,
    }
    dispatch(deleteRecurringEvent(payload))
    dispatch(addCall({ type: 'deleteRecurringFutureEvent', payload }))
    dispatch(getGoogleCalendarEvents({ force: true }))
    return payload
  }
}

export function deleteGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { outgoing } = getState().settings.calendars
    const payload = {
      event,
      calendar: outgoing,
    }
    dispatch(deleteEvent(payload))
    dispatch(addCall({ type: 'deleteEvent', payload }))
    dispatch(getGoogleCalendarEvents({ force: true }))
    return payload
  }
}

const initialState = {
  data: {},
  lastFetch: {
    syncTokens: {},
  },
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SAVE_EVENTS:
      return massageEventsResponse(state, action)
    case SET_EVENT:
      return setOfflineEvent(state, action)
    case UPDATE_RECURRING_EVENT:
      return updateOfflineRecurringFutureEvent(state, action)
    case DELETE_RECURRING_EVENT:
      return deleteOfflineRecurringFutureEvent(state, action)
    case DELETE_EVENT:
      return deleteOfflineEvent(state, action)
    default:
      return state
  }
}

function massageEventsResponse(state, { events, calendar, syncToken }) {
  const result = { ...state.data }

  let i = events.length
  console.groupCollapsed(`Constructing local data, count: ${i}`)
  const MAX_RECURRING_DATE = moment().add(1, 'year').toDate()
  const recurringEvents = []
  const singleEvents = []
  events.forEach((event) => {
    if (event.recurrence) recurringEvents.push(event)
    else singleEvents.push(event)
  })

  console.log(`Constructing recurring events, count: ${recurringEvents.length}`)
  recurringEvents.forEach((event) => {
    i--
    if (!event.start || !event.start.dateTime) {
      delete result[event.id]
      return
    }

    console.group(i, { id: event.id, event })
    result[event.id] = {
      event,
      singleEvents: {},
    }

    const FLOAT_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS'
    const duration = moment(event.end.dateTime).diff(event.start.dateTime)

    const DTSTART = moment(event.start.dateTime)
      .tz(event.start.timeZone)
      .format('YYYYMMDDTHHmmss')
    const recurrence = [
      ...event.recurrence,
      `DTSTART;TZID=${event.start.timeZone}:${DTSTART}`,
    ]
    console.log({ DTSTART, recurrence })

    const rset = rrulestr(recurrence.join('\n'), { forceset: true })
    const dates = rset.between(new Date(0), MAX_RECURRING_DATE)
    console.log({ rset, dates })
    console.groupEnd()

    for (let date of dates) {
      const start = moment(date.toISOString(), FLOAT_FORMAT).toISOString()
      const end = moment(start).add(duration).toISOString()
      const id = `${event.id}_${start.replace(/\.[0-9]{3}|-|:|\./g, '')}`
      result[event.id].singleEvents = {
        ...result[event.id].singleEvents,
        [id]: {
          ...event,
          id,
          recurringEventId: event.id,
          start: {
            ...event.start,
            dateTime: start,
          },
          end: {
            ...event.end,
            dateTime: end,
          },
        },
      }
    }
  })

  console.log(`Constructing single events, count: ${singleEvents.length}`)
  singleEvents.forEach((event) => {
    if (!event.start || !event.start.dateTime) {
      if (event.recurringEventId) {
        result[event.recurringEventId] = {
          ...result[event.recurringEventId],
        }
        result[event.recurringEventId].singleEvents = {
          ...result[event.recurringEventId].singleEvents,
        }
        delete result[event.recurringEventId].singleEvents[event.id]
      } else {
        delete result[event.id]
      }
      return
    }

    if (event.recurringEventId) {
      result[event.recurringEventId] = {
        ...result[event.recurringEventId],
      }
      result[event.recurringEventId].singleEvents = {
        ...result[event.recurringEventId].singleEvents,
        [event.id]: event,
      }
    } else {
      result[event.id] = event
    }
  })

  console.groupEnd()

  return {
    ...state,
    data: result,
    lastFetch: {
      syncTokens: {
        ...state.lastFetch.syncTokens,
        [calendar]: syncToken,
      },
      timeCalled: new Date(),
    },
  }
}

function setOfflineEvent(state, { event, calendar }) {
  const data = { ...state.data }
  if (event.recurringEventId) {
    data[event.recurringEventId] = {
      ...state.data[event.recurringEventId],
      singleEvents: {
        ...state.data[event.recurringEventId].singleEvents,
        [event.id]: {
          ...event,
          calendar,
        },
      },
    }
  } else {
    data[event.id] = {
      ...event,
      calendar,
    }
  }
  return {
    ...state,
    data,
  }
}

function updateOfflineRecurringFutureEvent(state, { event, newId }) {
  const data = {
    ...state.data,
    [event.recurringEventId]: {
      ...state.data[event.recurringEventId],
      singleEvents: {
        ...state.data[event.recurringEventId].singleEvents,
      },
    },
    [newId]: {
      event: {
        ...event,
        id: newId,
      },
      singleEvents: {},
    },
  }

  for (let sid in data[event.recurringEventId].singleEvents) {
    const s = data[event.recurringEventId].singleEvents[sid]
    if (s.start.dateTime >= event.start.dateTime) {
      const newEvent = {
        ...s,
        id: s.id.replace(s.recurringEventId, newId),
        recurringEventId: newId,
      }
      delete data[event.recurringEventId].singleEvents[sid]
      data[newId] = {
        ...data[newId],
        singleEvents: {
          ...data[newId].singleEvents,
          [newEvent.id]: newEvent,
        },
      }
    }
  }

  return {
    ...state,
    data,
  }
}

function deleteOfflineRecurringFutureEvent(state, { event, newId }) {
  const data = {
    ...state.data,
    [event.recurringEventId]: {
      ...state.data[event.recurringEventId],
      singleEvents: {
        ...state.data[event.recurringEventId].singleEvents,
      },
    },
  }

  for (let s of data[event.recurringEventId].singleEvents) {
    if (s.start.dateTime >= event.start.dateTime) {
      delete data[event.recurringEventId].singleEvents[s.id]
    }
  }

  return {
    ...state,
    data,
  }
}

function deleteOfflineEvent(state, { event }) {
  const data = { ...state.data }
  if (event.recurringEventId) {
    data[event.recurringEventId] = {
      ...state.data[event.recurringEventId],
      singleEvents: { ...state.data[event.recurringEventId].singleEvents },
    }
    delete data[event.recurringEventId].singleEvents[event.id]
  } else {
    delete data[event.id]
  }
  return {
    ...state,
    data,
  }
}
