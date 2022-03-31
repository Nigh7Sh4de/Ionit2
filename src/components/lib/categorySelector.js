import React, { Component } from 'react'
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { addCategory } from '../../redux/tags'

/**
 * Modal to select a category. Features a list of existing categories, and TextInput to create a new one.
 */
export class CategorySelector extends Component {
  constructor(props) {
    super(props)

    this.state = {
      new: '',
    }
  }

  onChangeCategory(category) {
    const categoryObject = { category }
    if (category && !this.props.categoryData[category]) {
      categoryObject.colorId = Math.floor(Math.random() * 12)
      categoryObject.color = this.props.colors[categoryObject.colorId] || {
        background: '#dddddd',
        foreground: '#000000',
      }
      this.props.addCategory(categoryObject)
    }

    return this.props.onChangeCategory(categoryObject)
  }

  onChangeText(value) {
    this.setState({
      new: value,
    })
  }

  renderNewCategory() {
    return (
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          paddingVertical: 15,
        }}
      >
        <TextInput
          placeholder="New category"
          onChangeText={this.onChangeText.bind(this)}
        />
      </View>
    )
  }

  renderCategories() {
    return this.props.categories
      .filter((categoryObject) => !categoryObject.archived)
      .map((categoryObject) => {
        if (categoryObject.category === this.props.selected) {
          return (
            <TouchableOpacity
              key={categoryObject.category}
              onPress={this.onChangeCategory.bind(this, '')}
              style={{
                width: '100%',
                alignItems: 'center',
                backgroundColor: categoryObject.color.background,
                paddingVertical: 15,
              }}
            >
              <Text style={{ color: categoryObject.color.foreground }}>
                {categoryObject.category}
              </Text>
            </TouchableOpacity>
          )
        } else {
          return (
            <TouchableOpacity
              key={categoryObject.category}
              onPress={this.onChangeCategory.bind(
                this,
                categoryObject.category
              )}
              style={{
                width: '100%',
                alignItems: 'center',
                paddingVertical: 15,
              }}
            >
              <Text>{categoryObject.category}</Text>
            </TouchableOpacity>
          )
        }
      })
  }

  renderSubmit() {
    let submit = null
    if (this.state.new && this.props.categories.length < 10) {
      submit = (
        <TouchableOpacity
          style={{
            padding: 15,
            backgroundColor: '#00b000',
            width: '100%',
            alignItems: 'center',
          }}
          onPress={this.onChangeCategory.bind(this, this.state.new)}
        >
          <Text style={{ color: '#ffffff', fontSize: 16 }}>Create</Text>
        </TouchableOpacity>
      )
    } else if (this.state.new && this.props.categories.length >= 10) {
      submit = (
        <TouchableOpacity
          style={{
            padding: 15,
            backgroundColor: '#ffff00',
            width: '100%',
            alignItems: 'center',
          }}
          onPress={this.onChangeCategory.bind(this, this.state.new)}
        >
          <Text style={{ textAlign: 'center' }}>
            That's a lot of categories. It's time to review them in the settings
            menu!
          </Text>
          <Text style={{ fontSize: 16 }}>Create</Text>
        </TouchableOpacity>
      )
    }

    return submit
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        transparent={true}
        onRequestClose={this.onChangeCategory.bind(this, this.props.category)}
      >
        <View
          style={{
            backgroundColor: '#000000b0',
            flex: 1,
            paddingHorizontal: 50,
            paddingVertical: 100,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
            }}
          >
            <ScrollView
              contentContainerStyle={{
                backgroundColor: '#ffffff',
                flex: 1,
                width: '100%',
              }}
            >
              {this.renderNewCategory()}
              {this.renderCategories()}
            </ScrollView>
            {this.renderSubmit()}
            <TouchableOpacity
              style={{
                padding: 15,
                width: '100%',
                alignItems: 'center',
              }}
              onPress={this.onChangeCategory.bind(this, this.props.selected)}
            >
              <Text style={{ fontSize: 16, color: '#ff0000' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    colors: state.colors.event,
    categories: state.firestore.ordered.categories || [],
    categoryData: state.firestore.data.categories || {},
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      addCategory,
    },
    dispatch
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(CategorySelector)
