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

      if (!result[date].length) {
        result[date].push({
          blank: true,
          id: start.toISOString(),
          summary: '',
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.add(1, 'day').toISOString() },
        })
      }

      let start = moment(date).startOf('day')
      let end = moment(date).startOf('day')

      for (let i = 0; i < result[date].length; i++) {
        const next = moment(result[date][i].start.dateTime)
        if (next > end) {
          result[date].splice(i++, 0, {
            blank: true,
            id: start.toISOString(),
            summary: '',
            start: { dateTime: end.toISOString() },
            end: { dateTime: next.toISOString() },
          })
        }
        start = next
        end = moment(result[date][i].end.dateTime)
      }

      const last = moment(result[date][result[date].length - 1].end.dateTime)
      end = moment(date)
        .startOf('day')
        .add(1, 'day')
      if (last < end) {
        result[date].push({
          blank: true,
          id: last.toISOString(),
          summary: '',
          start: { dateTime: last.toISOString() },
          end: { dateTime: end.toISOString() },
        })
      }
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
          renderDay={({ dateString } = {}) => (
            <View
              style={{
                marginTop: dateString && 20,
                width: 50,
                paddingHorizontal: 10,
                marginRight: 5,
              }}
            >
              {dateString && <Text>{moment(dateString).format('MMM DD')}</Text>}
            </View>
          )}
          renderItem={(item, first) => <AgendaItem item={item} first={first} />}
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
