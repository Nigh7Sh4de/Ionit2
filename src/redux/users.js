import { GoogleSignin, statusCodes } from 'react-native-google-signin'

export function initialize() {
  GoogleSignin.configure({
    webClientId:
      '766343695982-orlkjjjl38772sjtrumgj4ak2daf95vg.apps.googleusercontent.com',
    offlineAccess: true,
  })
}

const initialState = {
  data: {},
}
export default function reducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state
  }
}
