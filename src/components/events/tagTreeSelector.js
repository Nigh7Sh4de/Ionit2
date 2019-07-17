import React, { Component } from 'react'
import { Text, View, TouchableOpacity, Modal } from 'react-native'
import { connect } from 'react-redux'

import TagTree from '../lib/TagTree'

export class TagTreeSelector extends Component {
  onSelectTag = tag => {
    this.props.onSelectTag(tag)
  }

  onUnselectTag = tag => {
    this.props.onUnselectTag(tag)
  }

  renderItem = ({ item }) => {
    const selected = this.props.selected.indexOf(item.tag) >= 0

    let button = null
    if (!selected) {
      button = (
        <TouchableOpacity onPress={this.onSelectTag.bind(this, item.tag)}>
          <Text>Add</Text>
        </TouchableOpacity>
      )
    } else {
      button = (
        <TouchableOpacity onPress={this.onUnselectTag.bind(this, item.tag)}>
          <Text>Remove</Text>
        </TouchableOpacity>
      )
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingLeft: item.depth * 10,
          backgroundColor: selected[item.tag] ? '#aaaaff' : 'none',
        }}
      >
        <Text>{item.tag}</Text>
        {button}
      </View>
    )
  }

  render() {
    return (
      <Modal visible={this.props.visible}>
        <TagTree tags={this.props.tags} renderItem={this.renderItem} />
        <TouchableOpacity onPress={this.props.onClose}>
          <Text>Done</Text>
        </TouchableOpacity>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    tags: state.events.tags,
  }
}

export default connect(mapStateToProps)(TagTreeSelector)
