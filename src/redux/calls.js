import { Alert } from 'react-native'
import * as Google from './google'

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

    errors.forEach(error => Alert.alert(error.toString()))
    completed.length && dispatch(completeCalls(completed))
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
      return {
        ...state,
        data: [...state.data, call],
      }
    case 'patchEvent':
      if (state.data.find(i => i.payload.event.id === payload.event.id)) {
        return {
          ...state,
          data: state.data.map(i =>
            i.payload.event.id === payload.event.id
              ? {
                  ...i,
                  payload: {
                    ...i.payload,
                    event: payload.event,
                  },
                }
              : i
          ),
        }
      } else {
        return {
          ...state,
          data: [...state.data, call],
        }
      }
    case 'deleteEvent':
      if (payload.event.etag) {
        return {
          ...state,
          data: [...state.data, call],
        }
      } else {
        return {
          ...state,
          data: [
            ...state.data.filter(i => i.payload.event.id === payload.event.id),
          ],
        }
      }
  }
}

function removeCallsFromQueue(state, { calls }) {
  return {
    ...state,
    data: state.data.filter(call => calls.indexOf(call) < 0),
  }
}
