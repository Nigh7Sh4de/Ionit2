import React, { Component } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { connect } from 'react-redux'

export class Tags extends Component {
  render() {
    const tags = this.props.tags.map(tag => <Text key={tag}>{tag}</Text>)
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600' }}>Tags</Text>
        <ScrollView>{tags}</ScrollView>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    tags: state.events.tags,
  }
}

export default connect(mapStateToProps)(Tags)
