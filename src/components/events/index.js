import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-native'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import { getGoogleCalendarEvents } from '../../redux/events'

export class Events extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selected: null,
    }
  }

  componentDidMount() {
    this.props.getGoogleCalendarEvents()
  }

  editEvent(event) {
    this.setState({
      selected: {
        ...event,
        id: event.blank ? 'new' : event.id,
      },
    })
  }

  renderEvents() {
    const today = moment()
    const events = this.props.events
      .filter(
        event =>
          moment(event.start.dateTime).isSame(today, 'day') ||
          moment(event.end.dateTime).isSame(today, 'day')
      )
      .sort(
        (a, b) =>
          moment(a.start.dateTime || a.start.date) -
          moment(b.start.dateTime || b.start.date)
      )
    if (!events.length) {
      return <Text>You have no events!</Text>
    }

    const result = [events[0]]

    for (let i = 1; i < events.length; i++) {
      const end = moment(
        result[result.length - 1].end.dateTime ||
          result[result.length - 1].end.date
      )
      const start = moment(events[i].start.dateTime || events[i].start.date)

      if (start > end) {
        result.push({
          blank: true,
          id: start.toISOString(),
          summary: 'undefined',
          start: { dateTime: end.toISOString() },
          end: { dateTime: start.toISOString() },
        })
      }
      result.push(events[i])
    }

    const dayStart = moment().startOf('day')
    const dayEnd = moment()
      .add(1, 'day')
      .startOf('day')
    const first = moment(events[0].start.dateTime)
    const last = moment(events[events.length - 1].end.dateTime)

    if (first > dayStart) {
      result.unshift({
        blank: true,
        id: dayStart.toISOString(),
        summary: 'undefined',
        start: { dateTime: dayStart.toISOString() },
        end: { dateTime: first.toISOString() },
      })
    }

    if (last < dayEnd) {
      result.push({
        blank: true,
        id: last.toISOString(),
        summary: 'undefined',
        start: { dateTime: last.toISOString() },
        end: { dateTime: dayEnd.toISOString() },
      })
    }

    return result.map(event => (
      <TouchableOpacity
        key={event.id}
        onPress={this.editEvent.bind(this, event)}
        style={{ marginVertical: 10 }}
      >
        <Text>{event.summary}</Text>
        <Text>
          {moment(event.start.dateTime || event.start.date).format('HH:mm')}
        </Text>
        <Text>
          {moment(event.end.dateTime || event.end.date).format('HH:mm')}
        </Text>
      </TouchableOpacity>
    ))
  }

  render() {
    const { selected } = this.state
    if (selected) {
      return (
        <Redirect
          to={`/events/${selected.id}?start=${selected.start.dateTime}&end=${
            selected.end.dateTime
          }`}
        />
      )
    }

    const events = this.renderEvents()

    return (
      <View>
        <Text>Events!</Text>
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
