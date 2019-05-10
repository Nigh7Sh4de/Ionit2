import {
  GoogleSigninButton,
  GoogleSignin,
  statusCodes,
} from 'react-native-google-signin'

/**
 * On launch
 * configure()
 * //may be called from elsewhere
 */

/**
 * For each google api implementation:
 * 1.
 */

export async function configure() {
  await GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/calendar'],
    webClientId:
      '766343695982-orlkjjjl38772sjtrumgj4ak2daf95vg.apps.googleusercontent.com',
    offlineAccess: true,
  })
}

export async function signInSilently() {
  await GoogleSignin.hasPlayServices()
  const isSignedIn = await GoogleSignin.isSignedIn()
  if (isSignedIn) {
    return await GoogleSignin.getCurrentUser()
  } else {
    return await GoogleSignin.signInSilently()
  }
}

export async function signIn() {
  await GoogleSignin.hasPlayServices()
  return await GoogleSignin.signIn()
}

export async function getEvents({ calendar, timeMin, timeMax }) {
  const { accessToken } = await signInSilently()
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendar}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  const error = ({ items } = await response.json())
  if (items) return items
  else throw error
}
