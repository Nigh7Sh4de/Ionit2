import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { getGoogleCalendarEvents } from '../../redux/events'

export class Events extends Component {
  componentDidMount() {
    this.props.getGoogleCalendarEvents()
  }

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

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getGoogleCalendarEvents }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Events)
