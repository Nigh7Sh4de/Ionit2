export const ADD_EVENT = 'ADD_EVENT'

export function addEvent(event) {
  return {
    type: ADD_EVENT,
    event,
  }
}

const initialState = {
  data: [],
}
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_EVENT:
      return { ...state, data: [...state.data, action.event] }
    default:
      return state
  }
}
