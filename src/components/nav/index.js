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
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
            shadowOffset: { height: -2 },
          }}
        >
          <Link
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 20,
            }}
            component={TouchableOpacity}
            to="/settings"
          >
            <Text>Settings</Text>
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
        </View>
      </View>
    )
  }
}
