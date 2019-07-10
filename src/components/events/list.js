import React, { Component } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { ExpandableCalendar } from 'react-native-calendars'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import { getGoogleCalendarEvents } from '../../redux/events'

import AgendaItem from './item'
import Analytics from './analytics'
import asCalendarConsumer from 'react-native-calendars/src/expandableCalendar/asCalendarConsumer'

export class ListEvents extends Component {
  componentDidMount() {
    if (!this.props.events.length) {
      const dateString = moment.now()
      this.fetchEvents({ dateString })
    }
  }

  async fetchEvents({ dateString }) {
    const start = moment(dateString)
      .startOf('month')
      .subtract(1, 'month')
    const end = moment(dateString)
      .startOf('month')
      .add(3, 'month')

    await this.props.getGoogleCalendarEvents({ start, end })
  }

  filterEvents(events, date) {
    let start = moment(date).startOf('day')
    let end = moment(date).startOf('day').add(1, 'day')

    const result = events
      .filter(
        event =>
          moment(event.start.dateTime).isSameOrBefore(end) &&
          moment(event.end.dateTime).isSameOrAfter(start)
      )
      .sort(
        (a, b) =>
          moment(a.start.dateTime || a.start.date) -
          moment(b.start.dateTime || b.start.date)
      )


    if (!result.length) {
      result.push({
        blank: true,
        summary: '',
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.add(1, 'day').toISOString() },
      })
    }

    for (let i = 0; i < result.length; i++) {
      const next = moment(result[i].start.dateTime)
      if (next > end) {
        result.splice(i++, 0, {
          blank: true,
          summary: '',
          start: { dateTime: end.toISOString() },
          end: { dateTime: next.toISOString() },
        })
      }
      start = next
      end = moment(result[i].end.dateTime)
    }

    const last = moment(result[result.length - 1].end.dateTime)
    end = moment(date)
      .startOf('day')
      .add(1, 'day')
    if (last < end) {
      result.push({
        blank: true,
        summary: '',
        start: { dateTime: last.toISOString() },
        end: { dateTime: end.toISOString() },
      })
    }

    const f = 0
    const l = result.length - 1
    result[f].start.dateTime = moment.max(
      result[f].start.dateTime,
      moment(date).startOf('day')
    )
    result[l].end.dateTime = moment.min(
      result[l].end.dateTime,
      moment(date)
        .startOf('day')
        .add(1, 'day')
    )

    return result.filter(event =>
      moment(event.end.dateTime).diff(event.start.dateTime)
    )
  }

  render() {
    const { events, context } = this.props
    const { date } = context
    if (!events.length) {
      return <Text>You have no events!</Text>
    }

    const filteredEvents = this.filterEvents(events, date)
    const renderedEvents = filteredEvents.map(event => (
      <AgendaItem key={event.id || event.start.dateTime} item={event} />
    ))

    return (
      <View style={{ flex: 1 }}>
        <ExpandableCalendar allowShadow={false} />
        <Analytics events={filteredEvents} />
        <ScrollView>{renderedEvents}</ScrollView>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    events: state.events.data,
    lastFetch: state.events.lastFetch,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getGoogleCalendarEvents }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(asCalendarConsumer(ListEvents))
