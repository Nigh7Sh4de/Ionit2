import React, { Component } from 'react'
import { View } from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-native'
import { GoogleSigninButton } from 'react-native-google-signin'

import { initialize, signIn, signInSilently } from '../../redux/users'
import { setSettings } from '../../redux/calendars'

export class Login extends Component {
  constructor(props) {
    super(props)

    this.signIn = this._signIn.bind(this)
  }
  async componentDidMount() {
    await this.props.initialize()
    await this.props.signInSilently()
  }

  async _signIn() {
    await this.props.signIn()
  }

  render() {
    const { accessToken } = this.props.user
    if (accessToken) {
      return <Redirect to="/settings" />
    }

    return (
      <View>
        <GoogleSigninButton
          style={{ width: 192, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={this.signIn}
        />
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.users.data,
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
