import { Alert } from 'react-native'
import * as Google from '../lib/google'
import { showMessage } from 'react-native-flash-message'

export const ADD_CALL = 'ADD_CALL'
export const COMPLETE_CALLS = 'COMPLETE_CALLS'

export function addCall(call) {
  return {
    type: ADD_CALL,
    call,
  }
}

export function processQueue() {
  return async (dispatch, getState) => {
    const { data } = getState().calls
    const completed = []
    const errors = []

    for (let call of data) {
      try {
        const response = await Google[call.type](call.payload)
        completed.push(call)
      } catch (error) {
        errors.push(error)
      }
    }

    errors.forEach((error) => Alert.alert(error.toString()))

    if (completed.length) {
      showMessage({
        message: `Connected to Google`,
        description: `${completed.length}/${data.length} cached actions completed`,
        type: completed.length < data.length ? 'warning' : 'success',
      })
      dispatch(completeCalls(completed))
    }
  }
}

export function completeCalls(calls) {
  return {
    type: COMPLETE_CALLS,
    calls,
  }
}

const initialState = {
  data: [],
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_CALL:
      return addCallToQueue(state, action)
    case COMPLETE_CALLS:
      return removeCallsFromQueue(state, action)
    default:
      return state
  }
}

function addCallToQueue(state, { call }) {
  const { type, payload } = call
  switch (type) {
    case 'createEvent':
    case 'deleteEvent':
      return {
        ...state,
        data: [
          ...state.data.filter(
            (call) =>
              call.payload.event.id !== payload.event.id &&
              call.payload.event.recurringEventId !== payload.event.id
          ),
          call,
        ],
      }
    case 'patchEvent':
    case 'updateEvent':
      const data = state.data.filter(
        (call) =>
          !(
            (call.type === 'deleteEvent') &
            (call.payload.event.id === payload.event.id ||
              call.payload.event.id === payload.event.recurringEventId)
          ) || !(call.payload.event.recurringEventId === payload.event.id)
      )
      if (data.find((call) => call.payload.event.id === payload.event.id)) {
        return {
          ...state,
          data: data.map((call) =>
            call.payload.event.id === payload.event.id
              ? {
                  ...call,
                  payload: {
                    ...call.payload,
                    event: {
                      ...call.payload.event,
                      ...payload.event,
                    },
                  },
                }
              : call
          ),
        }
      } else {
        return {
          ...state,
          data: [...data, call],
        }
      }
    case 'deleteRecurringFutureEvent':
    case 'patchRecurringFutureEvent':
      return {
        ...state,
        data: [
          ...state.data
            .filter(
              (call) =>
                !(
                  call.payload.event.recurringEventId === payload.event.id &&
                  call.payload.event.start &&
                  call.payload.event.start.dateTime >=
                    payload.event.start.dateTime
                )
            )
            .map((call) =>
              call.payload.event.id === payload.event.id
                ? {
                    ...call,
                    payload: {
                      ...call.payload,
                      event: {
                        ...call.payload.event,
                        ...payload.event,
                      },
                    },
                  }
                : call
            ),
          call,
        ],
      }
  }
}

function removeCallsFromQueue(state, { calls }) {
  return {
    ...state,
    data: state.data.filter((call) => calls.indexOf(call) < 0),
  }
}
