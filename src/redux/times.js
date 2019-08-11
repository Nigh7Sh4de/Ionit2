export const ADD_TIME = 'ADD_TIME'
export const TEMP_START = 'TEMP_START'

//TODO(dplotnik): Deprecate this after 2019-09-01
export function addTime(time) {
  console.warn('This is going to be deprecated soon')
  return {
    type: ADD_TIME,
    time,
  }
}

//TODO(dplotnik): Deprecate this after 2019-09-01
export function setTempStart(tempStart) {
  console.warn('This is going to be deprecated soon')
  return {
    type: TEMP_START,
    tempStart,
  }
}

//TODO(dplotnik): Deprecate this after 2019-09-01
const initialState = {
  data: [],
  tempStart: null,
  warning: 'This is going to be deprecated soon',
}
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_TIME:
      return _addTime(state, action)
    case TEMP_START:
      return _tempStart(state, action)
    default:
      return state
  }
}

export function _addTime(state, { time }) {
  return {
    ...state,
    data: [...state.data, time],
  }
}

export function _tempStart(state, { tempStart }) {
  return {
    ...state,
    tempStart,
  }
}
