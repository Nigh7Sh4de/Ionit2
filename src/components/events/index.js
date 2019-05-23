import React, { Component } from 'react'
import { Text, ScrollView } from 'react-native'
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars'
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
      date: moment(),
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

  onDateChanged = date => {
    const start = moment(date).startOf('day')
    const end = moment(date)
      .startOf('day')
      .add(1, 'day')
    this.props.getGoogleCalendarEvents({ start, end })
    this.setState({
      date: moment(date),
    })
  }

  renderEvents() {
    const { events } = this.props
    const { date } = this.state
    const result = events
      .filter(event => moment(event.start.dateTime).isSame(date, 'day'))
      .sort(
        (a, b) =>
          moment(a.start.dateTime || a.start.date) -
          moment(b.start.dateTime || b.start.date)
      )

    let start = moment(date).startOf('day')
    let end = moment(date).startOf('day')

    if (!result.length) {
      result.push({
        blank: true,
        id: start.toISOString(),
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
          id: start.toISOString(),
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
        id: last.toISOString(),
        summary: '',
        start: { dateTime: last.toISOString() },
        end: { dateTime: end.toISOString() },
      })
    }

    return result.map(event => <AgendaItem key={event.id} item={event} />)
  }

  render() {
    const { events } = this.props
    const { selected, date } = this.state

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

    const renderedEvents = this.renderEvents()

    return (
      <CalendarProvider date={date.toDate()} onDateChanged={this.onDateChanged}>
        <ExpandableCalendar allowShadow={false} />
        <ScrollView>{renderedEvents}</ScrollView>
      </CalendarProvider>
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
