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
