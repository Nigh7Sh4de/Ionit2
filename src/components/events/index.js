import React, { Component } from 'react'
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars'
import { Redirect, Route } from 'react-router-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import { getGoogleCalendarEvents } from '../../redux/events'

import NewEvent from './new'
import ListEvents from './list'

export class Events extends Component {
  constructor(props) {
    super(props)

    this.state = {
      redirect: false,
    }
  }

  componentDidMount() {
    this.props.getGoogleCalendarEvents()
  }

  onDateChanged = () => {
    const { location } = this.props

    this.props.getGoogleCalendarEvents()
    if (!this.state.redirect && location.pathname !== '/events') {
      this.setState({
        redirect: true,
      })
    }
  }

  render() {
    let redirect = null
    if (this.state.redirect) {
      redirect = <Redirect push to="/events" />
      this.setState({
        redirect: false,
      })
    }

    return (
      <CalendarProvider
        date={moment().format('YYYY-MM-DD')}
        onDateChanged={this.onDateChanged}
      >
        <ExpandableCalendar allowShadow={false} firstDay={1} />
        {redirect}
        <Route exact path="/events" component={ListEvents} />
        <Route exact path="/events/:id" component={NewEvent} />
      </CalendarProvider>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getGoogleCalendarEvents }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Events)
