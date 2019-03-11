import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'

export default class Pause extends PureComponent {
  render() {
    const { start, stop } = this.props
    return (
      <View
        style={{
          marginHorizontal: 10,
          marginVertical: 5,
          borderLeftWidth: 1,
          paddingLeft: 5,
        }}
      >
        <Text>
          {start.toLocaleTimeString()} - {stop.toLocaleTimeString()}
        </Text>
      </View>
    )
  }
}
