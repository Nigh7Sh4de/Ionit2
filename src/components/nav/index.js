import React, { PureComponent } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'

import { Link } from 'react-router-native'

export default class Navbar extends PureComponent {
  render() {
    return (
      <View>
        <View
          style={{
            backgroundColor: 'white',
            height: 2,
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 4,
            shadowOffset: { height: -2 },
          }}
        />
        <View
          style={{
            backgroundColor: 'white',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}
        >
          <Link
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 20,
            }}
            component={TouchableOpacity}
            to="/"
          >
            <Text>Login</Text>
          </Link>
          <Link
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 20,
            }}
            component={TouchableOpacity}
            to="/events"
          >
            <Text>Events</Text>
          </Link>
          <Link
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 20,
            }}
            component={TouchableOpacity}
            to="/events/new"
          >
            <Text>New</Text>
          </Link>
          <Link
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 20,
            }}
            component={TouchableOpacity}
            to="/times"
          >
            <Text>Times</Text>
          </Link>
        </View>
      </View>
    )
  }
}
