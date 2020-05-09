import { GoogleSignin } from 'react-native-google-signin'
import moment from 'moment-timezone'
import { RRule } from 'rrule'

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
  const { accessToken } = await GoogleSignin.getTokens()
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

export async function getColors() {
  const { accessToken } = await GoogleSignin.getTokens()
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/colors',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  const colors = await response.json()
  return colors
}

export async function getEvent({ calendar, id }) {
  const { accessToken } = await GoogleSignin.getTokens()
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendar}/events/${id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  return await response.json()
}

export async function getEvents({ calendar, syncToken }) {
  const { accessToken } = await GoogleSignin.getTokens()
  let nextPageToken = null
  let nextSyncToken = syncToken
  let items = []
  do {
    let url = `https://www.googleapis.com/calendar/v3/calendars/${calendar}/events`
    if (nextPageToken) {
      url += `?pageToken=${nextPageToken}`
    }
    if (nextSyncToken) {
      url += `?syncToken=${nextSyncToken}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const json = await response.json()
    console.log({ json })
    if (!json.items) {
      throw json
    }
    items = [...items, ...json.items]
    nextPageToken = json.nextPageToken
    nextSyncToken = json.nextSyncToken
  } while (nextPageToken)
  return { items, syncToken: nextSyncToken }
}

export async function createEvent({ calendar, event }) {
  const { accessToken } = await GoogleSignin.getTokens()
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
  const { accessToken } = await GoogleSignin.getTokens()
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
  return response.ok
}

export async function patchEvent({ calendar, event }) {
  const { accessToken } = await GoogleSignin.getTokens()
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

export async function patchRecurringFutureEvent({
  calendar,
  event,
  recurringEvent,
  newId,
}) {
  try {
    await deleteRecurringFutureEvent({ calendar, event, recurringEvent })

    const newEvent = {
      ...recurringEvent,
      ...event,
      id: newId,
    }
    delete newEvent.iCalUID
    delete newEvent.recurringEventId
    delete newEvent.originalStartTime
    await createEvent({ calendar, event: newEvent })
  } catch (e) {
    console.error(e)
  }
}

export async function deleteRecurringFutureEvent({
  calendar,
  event,
  recurringEvent,
}) {
  try {
    const oldEventPatch = {
      id: event.recurringEventId,
      recurrence: limitRecurrence(recurringEvent.recurrence, event.start),
    }
    return await patchEvent({ calendar, event: oldEventPatch })
  } catch (e) {
    console.error(e)
  }
}

function limitRecurrence(recurrence, start) {
  const FLOAT_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS\\Z'
  const floatTimezoneString = moment
    .tz(start.dateTime, start.timeZone)
    .subtract(1)
    .format(FLOAT_FORMAT)

  const options = RRule.parseString(recurrence.join('\n'))
  delete options.count
  options.until = moment(floatTimezoneString).toDate()

  return RRule.optionsToString(options).split('\n')
}
