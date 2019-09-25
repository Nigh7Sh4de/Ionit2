import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { asTagTreeConsumer } from '../lib/TagTree'
import TagSelector from '../events/tagSelector'

export class KeywordEdit extends Component {
  constructor(props) {
    super(props)

    this.state = {
      keyword: this.props.keyword || '',
      tags: this.props.tags || [],
    }
  }

  onChangeKeyword(keyword) {
    this.setState({
      keyword,
    })
  }

  pushTag(tag) {
    const { tags } = this.state
    if (tags.indexOf(tag) < 0) {
      this.setState({
        tags: [...tags, tag],
      })
    }
  }

  popTag() {
    const { tags } = this.state
    const tag = tags.slice(-1)[0]
    this.setState({
      tags: tags.slice(0, -1),
    })
    return tag
  }

  async create() {
    const { keyword, tags } = this.state
    await this.props.setKeyword({
      keyword,
      tags,
    })
  }

  async delete() {
    const { keyword } = this.props
    await this.props.unsetKeyword(keyword)
  }

  render() {
    const tags = this.state.tags.map(tag => <Text key={tag}>{tag}</Text>)
    return (
      <View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 120, borderRightWidth: 1 }}>
            <TextInput
              value={this.state.keyword}
              onChangeText={this.onChangeKeyword.bind(this)}
              placeholder="Keyword"
              style={{ fontSize: 20 }}
            />
          </View>
          {tags}
          <TagSelector
            onSubmit={this.pushTag.bind(this)}
            onBack={this.popTag.bind(this)}
          />
        </View>
        <TouchableOpacity onPress={this.create.bind(this)}>
          <Text>+ Update</Text>
        </TouchableOpacity>
        {this.props.keyword && (
          <TouchableOpacity onPress={this.delete.bind(this)}>
            <Text>- Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }
}
function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(asTagTreeConsumer(KeywordEdit))
