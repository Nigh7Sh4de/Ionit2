import { SAVE_EVENTS, ADD_EVENT, UPDATE_EVENT, DELETE_EVENT } from './events'
export const MOVE_TAG = 'MOVE_TAG'

export function setKeyword(keyword) {
  return (dispatch, getState, { getFirestore }) => {
    getFirestore().set(
      { collection: 'keywords', doc: keyword.keyword },
      keyword
    )
  }
}

export function unsetKeyword(keyword) {
  return (dispatch, getState, { getFirestore }) => {
    getFirestore().delete({ collection: 'keywords', doc: keyword })
  }
}

export function addCategory(category) {
  return (dispatch, getState, { getFirestore }) => {
    getFirestore().set(
      { collection: 'categories', doc: category.category },
      category
    )
  }
}

export function deleteCategory(category) {
  return (dispatch, getState, { getFirestore }) => {
    getFirestore().delete({ collection: 'categories', doc: category })
  }
}

//TODO<: Deprecate this after 2020-01-01
export function moveTag({ src, dst }) {
  console.warn('This is going to be deprecated soon')
  return {
    type: MOVE_TAG,
    src,
    dst,
  }
}

const initialState = {
  //TODO<: Deprecate data after 2020-01-01
  data: {
    Sorted: {
      name: 'Sorted',
      events: {},
      tags: {},
    },
    Unsorted: {
      name: 'Unsorted',
      events: {},
      tags: {},
    },
    warning: 'This is going to be deprecated soon',
  },
  keywords: {},
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SAVE_EVENTS:
      return addBulkEventsTags(state, action)
    case ADD_EVENT:
      return addEventTags(state, action)
    case UPDATE_EVENT:
      return addEventTags(removeEventTags(state, action), action)
    case DELETE_EVENT:
      return removeEventTags(state, action)
    case MOVE_TAG:
      return processMoveTag(state, action)
    default:
      return state
  }
}

function mergeUnsortedTags(data) {
  const result = {
    ...data,
    Sorted: { ...data.Sorted, tags: { ...data.Sorted.tags } },
    Unsorted: { ...data.Unsorted, tags: { ...data.Unsorted.tags } },
  }

  let tagList = [data.Sorted]
  while (tagList.length) {
    const next = tagList.pop()
    for (let tag in next.tags) {
      next.tags[tag] = { ...next.tags[tag], tags: { ...next.tags[tag].tags } }
      tagList.push(next.tags[tag])
      if (result.Unsorted.tags[tag]) {
        next.tags[tag].events = {
          ...next.tags[tag].events,
          ...result.Unsorted.tags[tag].events,
        }
        delete result.Unsorted.tags[tag]
      }
    }
  }

  return result
}

function addBulkEventsTags(state, { events }) {
  const data = {
    ...state.data,
    Unsorted: { ...state.data.Unsorted, tags: { ...state.data.Unsorted.tags } },
  }

  for (let event of events) {
    if (
      event.extendedProperties &&
      event.extendedProperties.private &&
      event.extendedProperties.private.tags &&
      typeof event.extendedProperties.private.tags === 'string'
    ) {
      event.extendedProperties.private.tags.split(',').forEach(tag => {
        if (tag.length) {
          if (data.Unsorted.tags[tag]) {
            data.Unsorted.tags[tag] = {
              ...data.Unsorted.tags[tag],
              events: {
                ...data.Unsorted.tags[tag].events,
                [event.id]: true,
              },
            }
          } else {
            data.Unsorted.tags[tag] = {
              name: tag,
              events: {
                [event.id]: true,
              },
            }
          }
        }
      })
    }
  }

  return {
    ...state,
    data: mergeUnsortedTags(data),
  }
}

function addEventTags(state, { event }) {
  const data = {
    ...state.data,
    Unsorted: { ...state.data.Unsorted, tags: { ...state.data.Unsorted.tags } },
  }

  if (
    event.extendedProperties &&
    event.extendedProperties.private &&
    event.extendedProperties.private.tags &&
    typeof event.extendedProperties.private.tags === 'string'
  ) {
    event.extendedProperties.private.tags.split(',').forEach(tag => {
      if (tag.length) {
        if (data.Unsorted.tags[tag]) {
          data.Unsorted.tags[tag] = {
            ...data.Unsorted.tags[tag],
            events: {
              ...data.Unsorted.tags[tag].events,
              [event.id]: true,
            },
          }
        } else {
          data.Unsorted.tags[tag] = {
            name: tag,
            events: {
              [event.id]: true,
            },
          }
        }
      }
    })
  }

  return {
    ...state,
    data: mergeUnsortedTags(data),
  }
}

function removeEventTags(state, { event: { id } }) {
  const data = {
    ...state.data,
    Sorted: { ...state.data.Sorted, tags: { ...state.data.Sorted.tags } },
    Unsorted: { ...state.data.Unsorted, tags: { ...state.data.Unsorted.tags } },
  }

  let tagList = [data.Sorted, data.Unsorted]
  while (tagList.length) {
    const next = tagList.pop()
    for (let tag in next.tags) {
      next.tags[tag] = { ...next.tags[tag], tags: { ...next.tags[tag].tags } }
      tagList.push(next.tags[tag])
      if (next.tags[tag].events[id]) {
        next.tags[tag].events = { ...next.tags[tag].events }
        delete next.tags[tag].events[id]
      }
    }
  }

  return {
    ...state,
    data: mergeUnsortedTags(data),
  }
}

function generatePath(tree, path, target) {
  for (let prop in tree) {
    if (prop === target) {
      return path
    }
    const deepSearch = generatePath(tree[prop], [...path, prop], target)
    if (deepSearch) {
      return deepSearch
    }
  }
}

function processMoveTag(state, { src, dst }) {
  const dstPath = generatePath(state.data, [], dst) || []
  const srcPath = generatePath(state.data, [], src) || []

  const tags = { ...state.data }
  let srcPointer = tags
  for (let prop of srcPath) {
    srcPointer[prop] = { ...srcPointer[prop] }
    srcPointer = srcPointer[prop]
  }

  let dstPointer = tags
  for (let prop of dstPath) {
    dstPointer[prop] = { ...dstPointer[prop] }
    dstPointer = dstPointer[prop]
  }

  dstPointer[dst] = {
    ...dstPointer[dst],
    [src]: srcPointer[src] || {},
  }
  delete srcPointer[src]

  return {
    ...state,
    data: tags,
  }
}
