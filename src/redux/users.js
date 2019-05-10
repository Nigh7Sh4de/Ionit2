import Google from './google'

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
    let user = {}

    try {
      user = Google.signIn()
    } catch (error) {
      console.error(error)
      //dispatch(setError(error))
    }

    return user
  }
}

export function signInSilently() {
  return async dispatch => {
    let user = {}

    try {
      user = Google.signInSilently()
    } catch (error) {
      console.error(error)
      // dispatch(setError(error))
    }

    return user
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
