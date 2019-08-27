import React from 'react'

export function parseTree(tags, depth, unsorted) {
  let result = []
  for (let tag in tags) {
    result = [
      ...result,
      { tag, depth, unsorted },
      ...parseTree(tags[tag].tags, depth + 1, unsorted || tag === 'Unsorted'),
    ]
  }
  return result
}

export function asTagTreeConsumer(WrappedComponent) {
  return props => (
    <WrappedComponent tagList={parseTree(props.tags, 0, false)} {...props} />
  )
}
