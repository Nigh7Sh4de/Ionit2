import React, { Component } from 'react'
import { Text, View, TouchableOpacity, Modal, FlatList } from 'react-native'
import { connect } from 'react-redux'

import { asTagTreeConsumer } from '../lib/TagTree'

export class TagTreeSelector extends Component {
  onSelectTag = tag => {
    this.props.onSelectTag(tag)
  }

  onUnselectTag = tag => {
    this.props.onUnselectTag(tag)
  }

  renderItem = ({ item }) => {
    let button = null
    if (item.depth > 0) {
      if (!item.selected) {
        button = (
          <TouchableOpacity
            style={{ paddingVertical: 15 }}
            onPress={this.onSelectTag.bind(this, item.tag)}
          >
            <Text>Add</Text>
          </TouchableOpacity>
        )
      } else {
        button = (
          <TouchableOpacity
            style={{ paddingVertical: 15 }}
            onPress={this.onUnselectTag.bind(this, item.tag)}
          >
            <Text>Remove</Text>
          </TouchableOpacity>
        )
      }
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingLeft: item.depth * 10,
        }}
      >
        <Text>{item.tag}</Text>
        {button}
      </View>
    )
  }

  render() {
    const data = this.props.tagList.map(item => ({
      ...item,
      selected: this.props.selected.indexOf(item.tag) >= 0,
      key: item.tag,
    }))
    return (
      <Modal visible={this.props.visible} onRequestClose={this.props.onClose}>
        <Text style={{ color: 'red' }}>
          This is going to be deprecated soon
        </Text>
        <FlatList data={data} renderItem={this.renderItem} />
        <TouchableOpacity
          style={{ paddingVertical: 15 }}
          onPress={this.props.onClose}
        >
          <Text>Done</Text>
        </TouchableOpacity>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    tags: state.tags.data,
  }
}

export default connect(mapStateToProps)(asTagTreeConsumer(TagTreeSelector))
