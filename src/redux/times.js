export const ADD_TIME = 'ADD_TIME'

export function addTime(time) {
  return {
    type: ADD_TIME,
    time,
  }
}

const initialState = {
  data: [],
}
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_TIME:
      return _addTime(state, action)
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
