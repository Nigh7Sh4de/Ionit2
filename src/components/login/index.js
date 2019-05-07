import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  GoogleSigninButton,
  GoogleSignin,
  statusCodes,
} from 'react-native-google-signin'

import { initialize } from '../../redux/users'
import { getGoogleCalendarList } from '../../redux/events'

export class Login extends Component {
  constructor(props) {
    super(props)

    this.signIn = this._signIn.bind(this)
    this.state = {
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
      this.props.getGoogleCalendarList(userInfo.accessToken)
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

  render() {
    const calendars = this.props.calendars.map(calendar => (
      <Text>{JSON.stringify(calendar)}</Text>
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
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.users.data,
    calendars: state.events.calendars,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ initialize, getGoogleCalendarList }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
