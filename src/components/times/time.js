import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'
import moment from 'moment'

export default class Time extends PureComponent {
  render() {
    const { start, end } = this.props
    return (
      <View
        style={{
          marginHorizontal: 10,
          marginVertical: 5,
          borderLeftWidth: 6,
          paddingLeft: 5,
          paddingVertical: 5,
          borderLeftColor: 'grey',
        }}
      >
        <Text>
          {moment(start).format('H:mm:ss')} - {moment(end).format('H:mm:ss')}
        </Text>
      </View>
    )
  }
}
