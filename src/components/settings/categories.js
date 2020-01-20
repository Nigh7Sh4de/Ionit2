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

import { addCategory, deleteCategory } from '../../redux/tags'
import { asTagTreeConsumer } from '../lib/TagTree'
import KeywordEdit from './keywordEdit'

export class Tags extends Component {
  constructor(props) {
    super(props)

    this.state = {
      new: '',
    }
  }

  onChangeText(value) {
    this.setState({
      new: value,
    })
  }

  async create() {
    await this.props.addCategory({ category: this.state.new })
  }

  async delete(category) {
    await this.props.deleteCategory(category)
  }

  render() {
    const warning = (
      <View
        style={{
          backgroundColor: 'yellow',
          borderColor: 'orange',
          borderWidth: 1,
        }}
      >
        <Text>:🤔thinking:</Text>
        <Text>
          It may be time to reduce the number of categories we have. Seeing our
          lives in 10 different ways is complicated enough as it is. Let's try
          to simplify!
        </Text>
      </View>
    )
    const categories = this.props.categories.map(categoryObject => (
      <View key={categoryObject.category}>
        <Text>{categoryObject.category}</Text>
        <TouchableOpacity
          onPress={this.delete.bind(this, categoryObject.category)}
        >
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    ))
    return (
      <ScrollView>
        <Text>
          Add up to 10 categories that broadly describe the different events in
          your calendar.
        </Text>
        {this.props.categories.length > 10 && warning}
        <View>
          <TextInput
            placeholder="New cateogry"
            onChangeText={this.onChangeText.bind(this)}
          />
          <TouchableOpacity
            disabled={!this.state.new}
            onPress={this.create.bind(this)}
          >
            <Text>+ Add</Text>
          </TouchableOpacity>
        </View>
        {categories}
      </ScrollView>
    )
  }
}

function mapStateToProps(state) {
  return {
    categories: state.firestore.ordered.categories || [],
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ addCategory, deleteCategory }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(asTagTreeConsumer(Tags))
