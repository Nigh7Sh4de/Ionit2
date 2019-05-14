export const ADD_TIME = 'ADD_TIME'
export const TEMP_START = 'TEMP_START'

export function addTime(time) {
  return {
    type: ADD_TIME,
    time,
  }
}

export function setTempStart(tempStart) {
  return {
    type: TEMP_START,
    tempStart,
  }
}

const initialState = {
  data: [],
  tempStart: null,
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
