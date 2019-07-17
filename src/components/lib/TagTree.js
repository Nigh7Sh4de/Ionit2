import React, { PureComponent } from 'react'
import { View, Text, FlatList } from 'react-native'

export default class Tags extends PureComponent {
  parseTree(tree, depth, unsorted) {
    let result = []
    for (let tag in tree) {
      result = [
        ...result,
        { tag, depth, unsorted },
        ...this.parseTree(tree[tag], depth + 1, unsorted || tag === 'Unsorted'),
      ]
    }
    return result
  }

  render() {
    const props = {
      data: this.parseTree(this.props.tags, 0, false),
      ...this.props,
    }
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600' }}>Tags</Text>
        <FlatList {...props} />
      </View>
    )
  }
}
