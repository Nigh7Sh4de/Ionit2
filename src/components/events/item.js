import React, { PureComponent } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Redirect } from 'react-router-native'

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
    const { summary, id } = this.props.item
    const { selected } = this.state
    if (selected) {
      return <Redirect to={`/events/${id}`} />
    }

    return (
      <TouchableOpacity
        style={{
          marginHorizontal: 10,
          marginVertical: 5,
          borderLeftWidth: 6,
          paddingLeft: 5,
          paddingVertical: 5,
          borderLeftColor: 'grey',
        }}
        onPress={this._editEvent.bind(this)}
      >
        <Text>{summary}</Text>
      </TouchableOpacity>
    )
  }
}
