import moment from 'moment'
import uuidv4 from 'uuid/v4'
import { getEvents } from '../lib/google'
import { addCall, processQueue } from './calls'
import { showMessage } from 'react-native-flash-message'

export const SAVE_EVENTS = 'SAVE_EVENTS'
export const ADD_EVENT = 'ADD_EVENT'
export const UPDATE_EVENT = 'UPDATE_EVENT'
export const UPDATE_RECURRING_EVENT = 'UPDATE_RECURRING_EVENT'
export const DELETE_EVENT = 'DELETE_EVENT'
export const FETCH_DELAY = 60

export function saveEvents(events, timeMin, timeMax) {
  const from = moment(timeMin).format('YYYY-MM-DD')
  const to = moment(timeMax).format('YYYY-MM-DD')
  showMessage({
    message: 'Connected to Google',
    description: `Events retreived for ${from} - ${to}`,
    type: 'success',
  })

  return {
    type: SAVE_EVENTS,
    events,
    timeMin,
    timeMax,
  }
}

export function addEvent({ event, calendar }) {
  return {
    type: ADD_EVENT,
    event,
    calendar,
  }
}

export function updateEvent({ event, calendar }) {
  return {
    type: UPDATE_EVENT,
    event,
    calendar,
  }
}

export function updateRecurringEvent({ event, calendar, newId }) {
  return {
    type: UPDATE_RECURRING_EVENT,
    event,
    calendar,
    newId,
  }
}

export function deleteEvent({ event, calendar }) {
  return {
    type: DELETE_EVENT,
    event,
    calendar,
  }
}

export function getGoogleCalendarEvents({ start, end, force }) {
  return async (dispatch, getState) => {
    console.group('getGoogleCalendarEvents')
    await dispatch(processQueue())
    console.log('Queue processed.')

    const { calendars } = getState().settings
    const { lastFetch } = getState().events
    const timeMin = moment(start).startOf('day')
    const timeMax = moment(end || start)
      .startOf('day')
      .add(1, 'day')
    const delay = moment().subtract(FETCH_DELAY, 's')

    console.log('Use settings', { calendars, start, end, lastFetch, force })

    if (
      !force &&
      lastFetch.timeCalled &&
      moment(lastFetch.timeCalled) >= delay &&
      moment(lastFetch.timeMin) <= timeMin &&
      moment(lastFetch.timeMax) >= timeMax
    ) {
      console.log('Skip data fetch.')
      console.groupEnd()
      return
    }

    for (let calendar of calendars.incoming) {
      console.log({ calendar })
      try {
        const newEvents = await getEvents({ calendar, timeMin, timeMax })
        console.log({ newEvents })
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
    dispatch(
      getGoogleCalendarEvents({
        start: event.start.dateTime,
        force: true,
      })
    )
  }
}

export function patchGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { outgoing } = getState().settings.calendars
    const payload = {
      event,
      calendar: outgoing,
    }
    dispatch(updateEvent(payload))
    dispatch(addCall({ type: 'patchEvent', payload }))
    dispatch(
      getGoogleCalendarEvents({
        start: event.start.dateTime,
        force: true,
      })
    )
  }
}

export function patchRecurringGoogleCalendarEvent(event) {
  return async (dispatch, getState) => {
    const { outgoing } = getState().settings.calendars
    const payload = {
      newId: uuidv4().replace(/-/g, ''),
      event,
      calendar: outgoing,
    }
    dispatch(updateRecurringEvent(payload))
    dispatch(addCall({ type: 'patchRecurringEvent', payload }))
    dispatch(
      getGoogleCalendarEvents({
        start: event.start.dateTime,
        force: true,
      })
    )
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
    dispatch(
      getGoogleCalendarEvents({
        start: event.start.dateTime,
        force: true,
      })
    )
  }
}

const initialState = {
  data: {},
  lastFetch: {},
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SAVE_EVENTS:
      return massageEventsResponse(state, action)
    case ADD_EVENT:
      return addOfflineEvent(state, action)
    case UPDATE_EVENT:
      return updateOfflineEvent(state, action)
    case UPDATE_RECURRING_EVENT:
      return updateOfflineRecurringEvent(state, action)
    case DELETE_EVENT:
      return deleteOfflineEvent(state, action)
    default:
      return state
  }
}

function massageEventsResponse(state, { events, timeMin, timeMax }) {
  let { data, lastFetch } = state

  const start = moment(timeMin).toISOString()
  const end = moment(timeMax).toISOString()
  const result = {}

  events.forEach(event => event.start.dateTime && (result[event.id] = event))
  for (let event of Object.values(data)) {
    if (event.start.dateTime <= start || event.end.dateTime >= end) {
      result[event.id] = event
    }
  }

  return {
    ...state,
    data: result,
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

function addOfflineEvent(state, { event, calendar }) {
  return {
    ...state,
    data: {
      ...state.data,
      [event.id]: {
        ...event,
        calendar,
      },
    },
  }
}

function updateOfflineEvent(state, { event }) {
  return {
    ...state,
    data: {
      ...state.data,
      [event.id]: event,
    },
  }
}

function updateOfflineRecurringEvent(state, { event, newId }) {
  const data = {
    ...state.data,
  }
  const oldEvent = state.data[event.id]
  const oldStart = {
    hours: moment(oldEvent.start.dateTime).toObject().hours,
    minutes: moment(oldEvent.start.dateTime).toObject().minutes,
    seconds: moment(oldEvent.start.dateTime).toObject().seconds,
  }
  const oldEnd = {
    hours: moment(oldEvent.end.dateTime).toObject().hours,
    minutes: moment(oldEvent.end.dateTime).toObject().minutes,
    seconds: moment(oldEvent.end.dateTime).toObject().seconds,
  }
  const startDiff = moment(event.start.dateTime).diff(oldEvent.start.dateTime)
  const endDiff = moment(event.end.dateTime).diff(oldEvent.end.dateTime)

  for (let id in data) {
    if (
      data[id].recurringEventId === event.recurringEventId &&
      data[id].start.dateTime >= event.start.dateTime
    ) {
      data[id] = {
        ...data[id],
        ...event,
        start: {
          dateTime: moment(data[id].start.dateTime)
            .add(startDiff)
            .toISOString(),
        },
        end: {
          dateTime: moment(data[id].end.dateTime)
            .add(endDiff)
            .toISOString(),
        },
        id: newId + '_' + moment(data[id].start.dateTime).toISOString(),
      }
    }
  }

  return {
    ...state,
    data,
  }
}

function deleteOfflineEvent(state, { event }) {
  const data = { ...state.data }
  delete data[event.id]
  return {
    ...state,
    data,
  }
}
