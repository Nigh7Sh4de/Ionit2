import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'

export default class Time extends PureComponent {
  render() {
    const { time, active } = this.props
    const date = new Date(time)
    return (
      <View
        style={{
          marginHorizontal: 10,
          marginVertical: 5,
          borderLeftWidth: 6,
          paddingLeft: 5,
          paddingVertical: 5,
          borderLeftColor: active ? '#6CC551' : '#3DCEFF',
        }}
      >
        <Text>{date.toLocaleTimeString()}</Text>
      </View>
    )
  }
}
