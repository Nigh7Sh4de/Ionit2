import React, { Component } from 'react'
import { View, Text, Switch, TouchableOpacity } from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  GoogleSigninButton,
  GoogleSignin,
  statusCodes,
} from 'react-native-google-signin'
import { Link } from 'react-router-native'

import { initialize, setUser } from '../../redux/users'
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
    try {
      await GoogleSignin.configure({
        scopes: ['https://www.googleapis.com/auth/calendar'],
        webClientId:
          '766343695982-orlkjjjl38772sjtrumgj4ak2daf95vg.apps.googleusercontent.com',
        offlineAccess: true,
      })
      await GoogleSignin.hasPlayServices()
      const isSignedIn = await GoogleSignin.isSignedIn()
      if (isSignedIn) {
        const userInfo = await GoogleSignin.getCurrentUser()
        this.setState({ userInfo })
      } else {
        const userInfo = await GoogleSignin.signInSilently()
        this.setState({ userInfo })
      }
    } catch (error) {
      console.error(error)
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        // user has not signed in yet
      } else {
        // some other error
      }
    }
  }

  async _signIn() {
    try {
      await GoogleSignin.hasPlayServices()

      const userInfo = await GoogleSignin.signIn()
      this.props.setUser(userInfo)
      this.props.getGoogleCalendarList()
    } catch (error) {
      console.error(error)
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
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
        <Text>Login</Text>
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
    { initialize, getGoogleCalendarList, setSettings, setUser },
    dispatch
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
