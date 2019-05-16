import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { Agenda } from 'react-native-calendars'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-native'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import { getGoogleCalendarEvents } from '../../redux/events'

import AgendaItem from './item'

export class Events extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selected: null,
      items: {},
    }

    this.fetchEvents = this._fetchEvents.bind(this)
  }

  componentDidMount() {
    if (!this.props.events.length) {
      const dateString = moment.now()
      this.fetchEvents({ dateString })
    }
  }

  async _fetchEvents({ dateString }) {
    const start = moment(dateString)
      .startOf('month')
      .subtract(1, 'month')
    const end = moment(dateString)
      .startOf('month')
      .add(3, 'month')

    await this.props.getGoogleCalendarEvents({ start, end })
  }

  groupEventsByDate() {
    const { events, lastFetch } = this.props
    const { timeMin, timeMax } = lastFetch
    const result = {}

    const daysDiff = moment(timeMax).diff(timeMin, 'days')
    for (let i = 0; i < daysDiff; i++) {
      const date = moment(timeMin)
        .add(i, 'days')
        .format('YYYY-MM-DD')
      result[date] = []
    }

    events.forEach(event => {
      const date = moment(event.start.dateTime).format('YYYY-MM-DD')
      result[date].push(event)
    })

    for (let date in result) {
      result[date] = result[date].sort(
        (a, b) =>
          moment(a.start.dateTime || a.start.date) -
          moment(b.start.dateTime || b.start.date)
      )
    }
    return result
  }

  render() {
    const { events } = this.props
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
    if (!events.length) {
      return <Text>You have no events!</Text>
    }

    const groupedEvents = this.groupEventsByDate()

    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <Text>Events!</Text>
        <Agenda
          items={groupedEvents}
          renderItem={item => <AgendaItem item={item} />}
          renderEmptyDate={date => <Text>No events this day</Text>}
          rowHasChanged={(r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2)}
          loadItemsForMonth={this.fetchEvents}
        />
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
)(Events)
