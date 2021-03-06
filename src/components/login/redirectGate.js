import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-native'

export class RedirectGate extends Component {
  going = false

  render() {
    const { user, incoming, outgoing, location } = this.props

    if (
      !this.going &&
      user.idToken &&
      (!incoming || !outgoing) &&
      location.pathname !== '/settings'
    ) {
      this.going = true
      return <Redirect to="/settings" />
    } else if (
      !this.going &&
      user.idToken &&
      (location.pathname === '/login' || location.pathname === '/')
    ) {
      this.going = true
      return <Redirect to="/events" />
    } else if (!user.idToken && !this.going && location.pathname !== 'login') {
      this.going = true
      return <Redirect to="/login" />
    } else {
      this.going = false
      return null
    }
  }
}

function mapStateToProps(state) {
  return {
    user: state.users.data,
    incoming: !!state.calendars.settings.incoming.length,
    outgoing: !!state.calendars.settings.outgoing,
  }
}

export default connect(mapStateToProps)(RedirectGate)
