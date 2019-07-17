import React from 'react'

export function parseTree(tree, depth, unsorted) {
  let result = []
  for (let tag in tree) {
    result = [
      ...result,
      { tag, depth, unsorted },
      ...parseTree(tree[tag], depth + 1, unsorted || tag === 'Unsorted'),
    ]
  }
  return result
}

export function asTagTreeConsumer(WrappedComponent) {
  return props => (
    <WrappedComponent tagList={parseTree(props.tags, 0, false)} {...props} />
  )
}
