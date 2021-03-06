import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import uuidv4 from 'uuid/v4'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import DateTimePicker from 'react-native-modal-datetime-picker'
import queryString from 'query-string'

import Colors from './colors'
import {
  createGoogleCalendarEvent,
  patchGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from '../../redux/events'

export class NewEvent extends Component {
  constructor(props) {
    super(props)

    const { match, events, location } = this.props
    const { id } = match.params
    const { start, end } = queryString.parse(location.search)
    let event = {}
    let foundEvent = null

    if (id === 'new') {
      event = {
        start: start ? moment(start) : moment().startOf('hour'),
        end: end
          ? moment(end)
          : moment()
              .add(1, 'hour')
              .startOf('hour'),
        summary: '',
        description: '',
        location: '',
      }
    } else {
      foundEvent = events.find(e => e.id === id)
      event = {
        start: moment(foundEvent.start.dateTime),
        end: moment(foundEvent.end.dateTime),
        summary: foundEvent.summary,
        description: foundEvent.description,
        location: foundEvent.location,
        colorId: foundEvent.colorId,
      }
    }

    this.state = {
      visible: {
        start: false,
        end: false,
        color: false,
      },
      loading: false,
      foundEvent,
      ...event,
    }

    this.onPress = this._onPress.bind(this)
    this.delete = this._delete.bind(this)
  }

  onChangeColor(colorId) {
    this.setState({
      colorId,
    })
    this.hideDateTime('color')
  }

  onChangeText(field, value) {
    this.setState({
      [field]: value,
    })
  }

  onChangeDateTime(picker, value) {
    this.setState({
      [picker]: moment(value),
    })
    this.hideDateTime(picker)
  }

  hideDateTime(picker) {
    this.setState({
      visible: {
        ...this.state.visible,
        [picker]: false,
      },
    })
  }

  showDateTime(picker) {
    this.setState({
      visible: {
        ...this.state.visible,
        [picker]: true,
      },
    })
  }

  async _delete() {
    this.setState({
      loading: true,
    })

    const { foundEvent } = this.state
    await this.props.deleteGoogleCalendarEvent(foundEvent)

    this.setState({
      loading: false,
    })
    this.props.history.goBack()
  }

  async _onPress() {
    const {
      foundEvent,
      start,
      end,
      summary,
      description,
      location,
      colorId,
    } = this.state

    const event = {
      id: uuidv4().replace(/-/g, ''),
      start: {
        dateTime: start.toISOString(),
      },
      end: {
        dateTime: end.toISOString(),
      },
      summary,
      description,
      location,
      colorId,
    }

    this.setState({
      loading: true,
    })

    if (foundEvent) {
      await this.props.patchGoogleCalendarEvent({
        ...event,
        id: foundEvent.id,
        calendar: foundEvent.calendar,
      })
    } else {
      await this.props.createGoogleCalendarEvent(event)
    }

    this.setState({
      loading: false,
    })
    this.props.history.goBack()
  }

  render() {
    const { colors } = this.props
    const {
      visible,
      loading,
      start,
      end,
      summary,
      description,
      location,
      colorId,
      foundEvent,
    } = this.state
    const _start = start.format('YYYY-MM-DD H:mm')
    const _end = end.format('YYYY-MM-DD H:mm')

    if (loading) return <Text>Loading...</Text>

    const verb = foundEvent ? 'Update' : 'Create'

    return (
      <View>
        <Text>New Event</Text>
        <View>
          <Text>Start</Text>
          <TouchableOpacity onPress={this.showDateTime.bind(this, 'start')}>
            <Text>{_start}</Text>
          </TouchableOpacity>
          <DateTimePicker
            mode="datetime"
            date={start.toDate()}
            isVisible={visible.start}
            onConfirm={this.onChangeDateTime.bind(this, 'start')}
            onCancel={this.hideDateTime.bind(this, 'start')}
          />
        </View>
        <View>
          <Text>End</Text>
          <TouchableOpacity onPress={this.showDateTime.bind(this, 'end')}>
            <Text>{_end}</Text>
          </TouchableOpacity>
          <DateTimePicker
            mode="datetime"
            date={end.toDate()}
            isVisible={visible.end}
            onConfirm={this.onChangeDateTime.bind(this, 'end')}
            onCancel={this.hideDateTime.bind(this, 'end')}
          />
        </View>
        <View>
          <Text>Summary</Text>
          <TextInput
            value={summary}
            onChangeText={this.onChangeText.bind(this, 'summary')}
          />
        </View>
        <View>
          <Text>Description</Text>
          <TextInput
            value={description}
            onChangeText={this.onChangeText.bind(this, 'description')}
          />
        </View>
        <View>
          <Text>Location</Text>
          <TextInput
            value={location}
            onChangeText={this.onChangeText.bind(this, 'location')}
          />
        </View>
        <View>
          <Text>Color</Text>
          <Text>{colorId}</Text>
          <TouchableOpacity
            style={{
              height: 20,
              width: 100,
              backgroundColor: colorId ? colors[colorId].background : 'grey',
            }}
            onPress={this.showDateTime.bind(this, 'color')}
          />
          <Colors
            visible={visible.color}
            colors={colors}
            color={colorId}
            onChangeColor={this.onChangeColor.bind(this)}
          />
        </View>
        <TouchableOpacity onPress={this.onPress}>
          <Text>{verb}</Text>
        </TouchableOpacity>
        {foundEvent && (
          <TouchableOpacity onPress={this.delete}>
            <Text>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    events: state.events.data,
    colors: state.colors.event,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createGoogleCalendarEvent,
      patchGoogleCalendarEvent,
      deleteGoogleCalendarEvent,
    },
    dispatch
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewEvent)
