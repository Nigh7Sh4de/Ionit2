import { GoogleSignin, statusCodes } from 'react-native-google-signin'

const SET_USER = 'SET_USER'

export function initialize() {
  GoogleSignin.configure({
    webClientId:
      '766343695982-orlkjjjl38772sjtrumgj4ak2daf95vg.apps.googleusercontent.com',
    offlineAccess: true,
  })
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
