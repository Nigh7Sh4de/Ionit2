import React, { Component } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { moveTag } from '../../redux/events'

export class Tags extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selected: null,
    }
  }

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

  selectTag(selected) {
    this.setState({
      selected,
    })
  }

  moveTag(dst) {
    this.props.moveTag({
      src: this.state.selected,
      dst,
    })
    this.setState({
      selected: null,
    })
  }

  renderItem = ({ item }) => {
    let button = []
    if (!this.state.selected && item.depth > 0) {
      button = (
        <TouchableOpacity
          key="btn-move"
          onPress={this.selectTag.bind(this, item.tag)}
        >
          <Text>Move</Text>
        </TouchableOpacity>
      )
    } else if (
      (item.depth === 0 || !item.unsorted) &&
      this.state.selected &&
      this.state.selected !== item.tag
    ) {
      button = (
        <TouchableOpacity onPress={this.moveTag.bind(this, item.tag)}>
          <Text>Add</Text>
        </TouchableOpacity>
      )
    } else if (this.state.selected === item.tag) {
      button = (
        <TouchableOpacity onPress={this.selectTag.bind(this, null)}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      )
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
    const data = this.parseTree(this.props.tags, 0, false)
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600' }}>Tags</Text>
        <FlatList data={data} renderItem={this.renderItem} />
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    tags: state.events.tags,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ moveTag }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Tags)
