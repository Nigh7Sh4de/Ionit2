import React, { Component } from 'react'
import { CalendarProvider } from 'react-native-calendars'
import { NativeRouter as Router, Route } from 'react-router-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import { getGoogleCalendarEvents } from '../../redux/events'

import NewEvent from './new'
import ListEvents from './list'

export class Events extends Component {
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

  onDateChanged = date => {
    const start = moment(date).startOf('day')
    const end = moment(date)
      .startOf('day')
      .add(1, 'day')

    this.props.getGoogleCalendarEvents({ start, end })
  }

  render() {
    return (
      <CalendarProvider
        date={moment().format('YYYY-MM-DD')}
        onDateChanged={this.onDateChanged}
      >
        <Router basename={this.props.match.path}>
          <Route exact path="/" component={ListEvents} />
          <Route exact path="/:id" component={NewEvent} />
        </Router>
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
