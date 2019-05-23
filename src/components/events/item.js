import React, { PureComponent } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Redirect } from 'react-router-native'
import moment from 'moment'

export default class Item extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      selected: false,
    }
    this.editEvent = this._editEvent.bind(this)
  }

  _editEvent() {
    this.setState({
      selected: true,
    })
  }

  render() {
    const { item } = this.props
    const { summary, id, start, end, blank } = item
    const { selected } = this.state
    if (selected) {
      return (
        <Redirect
          push
          to={`/events/${blank ? 'new' : id}?start=${start.dateTime}&end=${
            end.dateTime
          }`}
        />
      )
    }

    const _start = moment(start.dateTime).format('H:mm')
    const _end = moment(end.dateTime).format('H:mm')

    return (
      <TouchableOpacity
        onPress={this._editEvent.bind(this)}
        style={{
          flexDirection: 'row',
          flex: 1,
          marginBottom: 5,
        }}
      >
        <View style={{ width: 50, alignItems: 'flex-end' }}>
          <Text>{_start}</Text>
          <Text>{_end}</Text>
        </View>
        <View
          style={{
            flex: 1,
            marginLeft: 5,
            borderLeftWidth: 6,
            paddingLeft: 5,
            borderLeftColor: blank ? 'lightgray' : 'grey',
            justifyContent: 'center',
          }}
        >
          <Text>{summary}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}
