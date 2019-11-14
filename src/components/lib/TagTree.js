import React from 'react'

//TODO: deprecate this after 2020-01-01
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

//TODO: deprecate this after 2020-01-01
export function asTagTreeConsumer(WrappedComponent) {
  return props => (
    <WrappedComponent tagList={parseTree(props.tags, 0, false)} {...props} />
  )
}
