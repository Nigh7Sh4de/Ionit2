import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import CategorySelector from '../lib/categorySelector'

export class KeywordEdit extends Component {
  constructor(props) {
    super(props)

    this.state = {
      visible: {
        category: false,
      },
      keyword: this.props.keyword || '',
      category: this.props.category || '',
    }
  }

  onChangeKeyword(keyword) {
    this.setState({
      keyword,
    })
  }

  showModal(type) {
    this.setState({
      visible: {
        [type]: true,
      },
    })
  }

  hideModal(type) {
    this.setState({
      visible: {
        [type]: false,
      },
    })
  }

  onChangeCategory({ category }) {
    this.setState({
      category,
      visible: { category: false },
    })
  }

  async create() {
    const { keyword, category } = this.state
    await this.props.setKeyword({
      keyword,
      category,
    })
  }

  async delete() {
    const { keyword } = this.props
    await this.props.unsetKeyword(keyword)
  }

  render() {
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
          <TouchableOpacity
            style={{ padding: 15, alignItems: 'center' }}
            onPress={this.showModal.bind(this, 'category')}
          >
            <Text style={{ fontSize: 16 }}>Category</Text>
            <View
              style={{
                paddingVertical: 2,
                paddingHorizontal: 8,
                borderRadius: 8,
                margin: 2,
                backgroundColor: 'grey',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Text>{this.state.category || '+'}</Text>
            </View>
            <CategorySelector
              visible={this.state.visible.category}
              onChangeCategory={this.onChangeCategory.bind(this)}
              selected={this.state.category}
            />
          </TouchableOpacity>
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

export default connect(mapStateToProps, mapDispatchToProps)
