export const MOVE_TAG = 'MOVE_TAG'

export function setKeyword(keywordObject) {
  return (dispatch, getState, { getFirestore }) => {
    getFirestore().set(
      { collection: 'keywords', doc: keywordObject.keyword },
      keywordObject
    )
  }
}

export function unsetKeyword(keyword) {
  return (dispatch, getState, { getFirestore }) => {
    getFirestore().delete({ collection: 'keywords', doc: keyword })
  }
}

export function addCategory(categoryObject) {
  return (dispatch, getState, { getFirestore }) => {
    getFirestore().set(
      { collection: 'categories', doc: categoryObject.category },
      categoryObject
    )
  }
}

export function deleteCategory(category) {
  return (dispatch, getState, { getFirestore }) => {
    getFirestore().delete({ collection: 'categories', doc: category })
  }
}

export function updateFirestoreEvent(eventObject) {
  return (dispatch, getState, { getFirestore }) => {
    getFirestore().set(
      { collection: 'events', doc: eventObject.id },
      eventObject
    )
  }
}

export function deleteFirestoreEvent(eventObject) {
  return (dispatch, getState, { getFirestore }) => {
    getFirestore().delete({ collection: 'events', doc: eventObject.id })
  }
}

export function deleteRecurringFutureFirestoreEvent(eventObject) {
  return (dispatch, getState, { getFirestore }) => {
    const events = getState().events.data
    const recurringEvent = events[eventObject.recurringEventId]
    if (!recurringEvent || !recurringEvent.singleEvents) {
      //TODO: throw error
    }

    Object.values(recurringEvent.singleEvents)
      .filter((event) => event.start.dateTime >= eventObject.start.dateTime)
      .forEach((event) =>
        getFirestore().delete({ collection: 'events', doc: event.id })
      )
  }
}
