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

import { setKeyword, unsetKeyword } from '../../redux/firestore'
import KeywordEdit from './keywordEdit'

export class Keywords extends Component {
  constructor(props) {
    super(props)

    this.state = {
      new: {},
    }
  }

  async create(keyword) {
    await this.props.setKeyword(keyword)
  }

  async delete(keyword) {
    await this.props.unsetKeyword(keyword)
  }

  render() {
    return (
      <ScrollView>
        <Text>
          Add words for that you commonly use in the subject of your events. The
          tags associated with these words will be automatically added as you
          create new events.
        </Text>
        <KeywordEdit setKeyword={this.create.bind(this)} />
        {this.props.keywords.map(keyword => (
          <KeywordEdit
            key={keyword.id}
            setKeyword={this.create.bind(this)}
            unsetKeyword={this.delete.bind(this)}
            {...keyword}
          />
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
  return bindActionCreators({ setKeyword, unsetKeyword }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Keywords)
