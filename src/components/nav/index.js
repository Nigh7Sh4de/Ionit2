import React, { PureComponent } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'

import { Link } from 'react-router-native'

export default class Navbar extends PureComponent {
  render() {
    return (
      <View style={{ borderBottomWidth: 1, marginBottom: 10 }}>
        <Link component={TouchableOpacity} to="/">
          <Text>Login</Text>
        </Link>
        <Link component={TouchableOpacity} to="/events">
          <Text>Events</Text>
        </Link>
        <Link component={TouchableOpacity} to="/events/new">
          <Text>New</Text>
        </Link>
        <Link component={TouchableOpacity} to="/times">
          <Text>Times</Text>
        </Link>
      </View>
    )
  }
}
