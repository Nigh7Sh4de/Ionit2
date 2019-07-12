import React, { Component } from 'react'
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars'
import { NativeRouter as Router, Route } from 'react-router-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import { getGoogleCalendarEvents } from '../../redux/events'

import NewEvent from './new'
import ListEvents from './list'

export class Events extends Component {
  componentDidMount() {
    const dateString = moment.now()
    this.fetchEvents({ dateString })
  }

  async fetchEvents({ dateString }) {
    const start = moment(dateString)
      .subtract(1, 'month')
      .startOf('month')
    const end = moment(dateString)
      .add(3, 'month')
      .startOf('month')

    await this.props.getGoogleCalendarEvents({ start, end })
  }

  onDateChanged = date => {
    const start = moment(date).startOf('day')
    const end = moment(date)
      .add(1, 'day')
      .startOf('day')

    this.props.getGoogleCalendarEvents({ start, end })
  }

  render() {
    return (
      <CalendarProvider
        date={moment().format('YYYY-MM-DD')}
        onDateChanged={this.onDateChanged}
      >
        <ExpandableCalendar allowShadow={false} />
        <Route exact path="/events" component={ListEvents} />
        <Route exact path="/events/:id" component={NewEvent} />
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
