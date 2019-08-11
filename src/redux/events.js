import moment from 'moment'
import { getEvents } from '../lib/google'
import { addCall, processQueue } from './calls'
import { showMessage } from 'react-native-flash-message'

export const SAVE_EVENTS = 'SAVE_EVENTS'
export const ADD_EVENT = 'ADD_EVENT'
export const UPDATE_EVENT = 'UPDATE_EVENT'
export const DELETE_EVENT = 'DELETE_EVENT'
export const MOVE_TAG = 'MOVE_TAG'
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

export function deleteEvent({ event, calendar }) {
  return {
    type: DELETE_EVENT,
    event,
    calendar,
  }
}

export function moveTag({ src, dst }) {
  return {
    type: MOVE_TAG,
    src,
    dst,
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
      event,
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
  data: [],
  tags: {
    Sorted: {},
    Unsorted: {},
  },
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
    case DELETE_EVENT:
      return deleteOfflineEvent(state, action)
    case MOVE_TAG:
      return processMoveTag(state, action)
    default:
      return state
  }
}

function massageEventsResponse(state, { events, timeMin, timeMax }) {
  let { data, lastFetch } = state

  const start = moment(timeMin).toISOString()
  const end = moment(timeMax).toISOString()
  const ids = {}
  const tags = { ...state.tags, Unsorted: { ...state.tags.Unsorted } }

  events.forEach(event => (ids[event.id] = true))
  data = [
    ...data.filter(
      event =>
        !ids[event.id] &&
        (event.start.dateTime <= start || event.end.dateTime >= end)
    ),
    ...events.filter(event => event.start.dateTime),
  ]

  data.forEach(event => {
    if (
      event.extendedProperties &&
      event.extendedProperties.private &&
      event.extendedProperties.private.tags &&
      typeof event.extendedProperties.private.tags === 'string'
    ) {
      event.extendedProperties.private.tags.split(',').forEach(tag => {
        if (tag.length) {
          tags.Unsorted[tag] = {}
        }
      })
    }
  })
  let tagList = [tags.Sorted]
  while (tagList.length) {
    const next = tagList.pop()
    for (let tag in next) {
      tagList.push(tags[tag])
      if (tags.Unsorted[tag]) delete tags.Unsorted[tag]
    }
  }

  return {
    ...state,
    data,
    tags,
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
    data: [
      ...state.data,
      {
        ...event,
        calendar,
      },
    ],
  }
}

function updateOfflineEvent(state, { event }) {
  return {
    ...state,
    data: state.data.map(e => (e.id === event.id ? event : e)),
  }
}

function deleteOfflineEvent(state, { event: { id } }) {
  return {
    ...state,
    data: state.data.filter(event => event.id !== id),
  }
}

function generatePath(tree, path, target) {
  for (let prop in tree) {
    if (prop === target) {
      return path
    }
    const deepSearch = generatePath(tree[prop], [...path, prop], target)
    if (deepSearch) {
      return deepSearch
    }
  }
}

function processMoveTag(state, { src, dst }) {
  const dstPath = generatePath(state.tags, [], dst) || []
  const srcPath = generatePath(state.tags, [], src) || []

  const tags = { ...state.tags }
  let srcPointer = tags
  for (let prop of srcPath) {
    srcPointer[prop] = { ...srcPointer[prop] }
    srcPointer = srcPointer[prop]
  }

  let dstPointer = tags
  for (let prop of dstPath) {
    dstPointer[prop] = { ...dstPointer[prop] }
    dstPointer = dstPointer[prop]
  }

  dstPointer[dst] = {
    ...dstPointer[dst],
    [src]: srcPointer[src] || {},
  }
  delete srcPointer[src]

  return {
    ...state,
    tags,
  }
}
