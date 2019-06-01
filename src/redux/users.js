import * as Google from './google'

const SET_USER = 'SET_USER'

export function initialize() {
  return dispatch => {
    try {
      Google.configure()
    } catch (error) {
      console.log({ error })
      // dispatch(setError(error))
    }
  }
}

export function signIn() {
  return async dispatch => {
    try {
      user = await Google.signIn()
      dispatch(setUser(user))
    } catch (error) {
      console.log({ error })
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
      console.log({ error })
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
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, data: action.user }
    default:
      return state
  }
}
