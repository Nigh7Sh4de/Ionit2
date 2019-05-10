import React, { Component } from 'react'
import { View, Text, Switch, TouchableOpacity } from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { GoogleSigninButton } from 'react-native-google-signin'
import { Link } from 'react-router-native'

import { initialize, signIn, signInSilently } from '../../redux/users'
import { getGoogleCalendarList, setSettings } from '../../redux/calendars'

export class Login extends Component {
  constructor(props) {
    super(props)

    const { settings } = this.props

    console.log({ settings })

    this.signIn = this._signIn.bind(this)
    const incoming = {}
    for (let key of settings.incoming) {
      incoming[key] = true
    }
    const outgoing = {
      [settings.outgoing]: true,
    }

    this.state = {
      settings: {
        incoming,
        outgoing,
      },
      isSigninInProgress: false,
    }
  }

  async componentDidMount() {
    await this.props.initialize()
    await this.props.signInSilently()
  }

  async _signIn() {
    this.props.setUser(userInfo)
  }

  setSettings() {
    const { settings } = this.state
    const incoming = Object.keys(settings.incoming).filter(
      calendar => settings.incoming[calendar]
    )
    const outgoing = Object.keys(settings.outgoing).find(
      calendar => settings.outgoing[calendar]
    )
    this.props.setSettings({ incoming, outgoing })
  }

  onIncomingChange(id, value) {
    const settings = {
      ...this.state.settings,
      incoming: {
        ...this.state.settings.incoming,
        [id]: value,
      },
    }
    this.setState({ settings }, this.setSettings)
  }

  onOutgoingChange(id, value) {
    const settings = {
      ...this.state.settings,
      outgoing: {
        [id]: value,
      },
    }
    this.setState({ settings }, this.setSettings)
  }

  render() {
    const calendars = this.props.calendars.map(calendar => (
      <View
        key={calendar.id}
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <Text>{calendar.summary}</Text>
        <Switch
          onValueChange={this.onIncomingChange.bind(this, calendar.id)}
          value={this.state.settings.incoming[calendar.id]}
        />
        <Switch
          onValueChange={this.onOutgoingChange.bind(this, calendar.id)}
          value={this.state.settings.outgoing[calendar.id]}
        />
      </View>
    ))

    return (
      <View>
        <GoogleSigninButton
          style={{ width: 192, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={this.signIn}
          disabled={this.state.isSigninInProgress}
        />
        {calendars}
        <Link component={TouchableOpacity} to="/events">
          <Text>Start</Text>
        </Link>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.users.data,
    calendars: state.calendars.data,
    settings: state.calendars.settings,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { initialize, signInSilently, setSettings, signIn },
    dispatch
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
