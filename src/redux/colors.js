import { getColors } from '../lib/google'

export const SET_COLORS = 'SET_COLORS'

export function setColors(colors) {
  return {
    type: SET_COLORS,
    colors,
  }
}

export function getGoogleCalendarColors() {
  return async (dispatch, getState) => {
    let colors = {}
    try {
      colors = await getColors()
    } catch (error) {
      console.log({ error })
      // dispatch(setError(error))
    }

    if (colors.event) {
      dispatch(setColors(colors))
    }
  }
}

const initialState = {
  event: {},
  calendar: {},
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_COLORS:
      return massageColorsResponse(state, action)
    default:
      return state
  }
}

function massageColorsResponse(state, { colors }) {
  return {
    ...state,
    ...colors,
  }
}
