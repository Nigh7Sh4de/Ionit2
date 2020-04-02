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

import { addCategory, deleteCategory } from '../../redux/firestore'

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

  async activate(category) {
    await this.props.addCategory({
      ...category,
      archived: false,
    })
  }

  async archive(category) {
    await this.props.addCategory({
      ...category,
      archived: true,
    })
  }

  renderNewCategory() {
    return (
      <View
        style={{
          width: '100%',
          alignItems: 'center',
        }}
      >
        <TextInput
          placeholder="New category"
          onChangeText={this.onChangeText.bind(this)}
        />
        <TouchableOpacity
          style={{
            padding: 15,
            backgroundColor: '#00b000',
            width: '100%',
            alignItems: 'center',
          }}
          onPress={this.create.bind(this)}
        >
          <Text style={{ color: '#ffffff', fontSize: 16 }}>Create</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderActiveCategories() {
    return this.props.categories
      .filter(categoryObject => !categoryObject.archived)
      .map(categoryObject => (
        <View
          key={categoryObject.category}
          style={{
            width: '100%',
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              backgroundColor: categoryObject.color.background,
              paddingVertical: 15,
              flex: 1,
            }}
          >
            <Text style={{ color: categoryObject.color.foreground }}>
              {categoryObject.category}
            </Text>
          </View>
          <TouchableOpacity
            onPress={this.archive.bind(this, categoryObject)}
            style={{
              fontSize: 24,
              padding: 15,
            }}
          >
            <Text>💤</Text>
          </TouchableOpacity>
        </View>
      ))
  }

  renderArchivedCategories() {
    return this.props.categories
      .filter(categoryObject => categoryObject.archived)
      .map(categoryObject => (
        <View
          key={categoryObject.category}
          style={{
            width: '100%',
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              backgroundColor: '#dddddd',
              paddingVertical: 15,
              flex: 1,
            }}
          >
            <Text style={{ color: '#000000' }}>{categoryObject.category}</Text>
          </View>
          <TouchableOpacity
            onPress={this.activate.bind(this, categoryObject)}
            style={{
              fontSize: 24,
              padding: 15,
            }}
          >
            <Text>☀️</Text>
          </TouchableOpacity>
        </View>
      ))
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

    return (
      <ScrollView>
        <Text>
          Add up to 10 categories that broadly describe the different events in
          your calendar.
        </Text>
        {this.props.categories.length > 10 && warning}
        <ScrollView
          contentContainerStyle={{
            backgroundColor: '#ffffff',
            flex: 1,
            width: '100%',
          }}
        >
          {this.renderNewCategory()}
          {this.renderActiveCategories()}
          {this.renderArchivedCategories()}
        </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(Tags)
