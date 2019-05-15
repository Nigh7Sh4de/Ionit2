import { GoogleSignin } from 'react-native-google-signin'

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
  return await GoogleSignin.signInSilently()
}

export async function signIn() {
  await GoogleSignin.hasPlayServices()
  return await GoogleSignin.signIn()
}

export async function getCalendars() {
  const { accessToken } = await signInSilently()
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  const calendars = await response.json()
  if (calendars.items) return calendars.items
  else throw calendars
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

export async function createEvent({ calendar, event }) {
  const { accessToken } = await signInSilently()
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendar}/events`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(event),
    }
  )
  return await response.json()
}

export async function deleteEvent({ calendar, event: { id } }) {
  const { accessToken } = await signInSilently()
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendar}/events/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  return await response.json()
}

export async function patchEvent({ calendar, event }) {
  const { accessToken } = await signInSilently()
  const { id } = event
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendar}/events/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(event),
    }
  )
  return await response.json()
}
