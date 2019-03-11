import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'

export class Events extends Component {
  renderEvents() {
    return this.props.events.map(event => (
      <View>
        <Text>{JSON.stringify(event)}</Text>
      </View>
    ))
  }
  render() {
    const events = this.renderEvents()
    return (
      <View>
        <Text>Events</Text>
        <View>{events}</View>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    events: state.events.data,
  }
}

export default connect(mapStateToProps)(Events)
