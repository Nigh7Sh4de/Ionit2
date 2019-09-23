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

import { createKeyword } from '../../redux/tags'
import { asTagTreeConsumer } from '../lib/TagTree'

export class Tags extends Component {
  constructor(props) {
    super(props)

    this.state = {
      new: {},
    }
  }

  onChangeText(keyword, field, value) {
    this.setState({
      [keyword]: {
        ...this.state[keyword],
        [field]: value,
      },
    })
  }

  async create() {
    const { keyword, tags } = this.state.new
    await this.props.createKeyword({
      keyword,
      tags,
    })
  }

  render() {
    return (
      <ScrollView>
        <Text>
          Create "keywords" for identifying words in the subject of your events
          thatt will enable tags to be automatically added to the event
        </Text>
        <View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 150 }}>
              <TextInput
                value={this.state.new.keyword}
                onChangeText={this.onChangeText.bind(this, 'new', 'keyword')}
                placeholder="Keyword"
                style={{ fontSize: 24 }}
              />
            </View>
            <TextInput
              value={this.state.new.tags}
              onChangeText={this.onChangeText.bind(this, 'new', 'tags')}
              placeholder="Tags"
              style={{ fontSize: 24 }}
            />
          </View>
          <TouchableOpacity onPress={this.create.bind(this)}>
            <Text>+ Create</Text>
          </TouchableOpacity>
        </View>
        {this.props.keywords.map(keyword => (
          <Text key={keyword.id}>{JSON.stringify(keyword)}</Text>
        ))}
      </ScrollView>
    )
  }
}

function mapStateToProps(state) {
  return {
    keywords: state.firestore.ordered.keywords,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createKeyword }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(asTagTreeConsumer(Tags))
