import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-native'

export class RedirectGate extends Component {
  going = false

  Redirect() {
    const { user, incoming, outgoing, location } = this.props

    if (
      !this.going &&
      user.idToken &&
      (!incoming || !outgoing) &&
      location.pathname !== '/settings/calendars'
    ) {
      this.going = true
      return <Redirect to="/settings/calendars" />
    } else if (
      !this.going &&
      user.idToken &&
      (location.pathname === '/login' || location.pathname === '/')
    ) {
      this.going = true
      return <Redirect to="/events" />
    } else if (!user.idToken && !this.going && location.pathname !== '/login') {
      this.going = true
      return <Redirect to="/login" />
    } else {
      this.going = false
      return null
    }
  }

  render() {
    const { location } = this.props

    console.group('RedirectGate')
    console.log(location.pathname)

    const result = this.Redirect()

    console.log({ result })
    console.groupEnd()

    return result
  }
}

function mapStateToProps(state) {
  return {
    user: state.users.data,
    incoming: !!state.settings.calendars.incoming.length,
    outgoing: !!state.settings.calendars.outgoing,
  }
}

export default connect(mapStateToProps)(RedirectGate)
