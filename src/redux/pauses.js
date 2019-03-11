export const START_PAUSE = 'START_PAUSE'
export const STOP_PAUSE = 'STOP_PAUSE'

export function startPause(date) {
  return {
    type: START_PAUSE,
    date,
  }
}

export function stopPause(date) {
  return {
    type: STOP_PAUSE,
    date,
  }
}

const initialState = {
  data: [],
  active: null,
}
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case START_PAUSE:
      return { ...state, active: action.date }
    case STOP_PAUSE:
      return {
        ...state,
        data: [...state.data, { start: state.active, stop: action.date }],
        active: null,
      }
    default:
      return state
  }
}
