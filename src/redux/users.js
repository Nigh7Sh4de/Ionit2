import * as Google from './google'

const SET_USER = 'SET_USER'

export function initialize() {
  return dispatch => {
    try {
      Google.configure()
    } catch (error) {
      console.error(error)
      // dispatch(setError(error))
    }
  }
}

export function signIn() {
  return dispatch => {
    try {
      user = Google.signIn()
      dispatch(setUser(user))
    } catch (error) {
      console.error(error)
      //dispatch(setError(error))
    }
  }
}

export function signInSilently() {
  return async dispatch => {
    try {
      user = await Google.signInSilently()
      dispatch(setUser(user))
    } catch (error) {
      console.error(error)
      // dispatch(setError(error))
    }
  }
}

export function setUser(user) {
  return {
    type: SET_USER,
    user,
  }
}

const initialState = {
  data: {},
  auth: false,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, data: action.user, auth: true }
    default:
      return state
  }
}
