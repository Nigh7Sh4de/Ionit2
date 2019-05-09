import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import { Redirect } from 'react-router-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import DateTimePicker from 'react-native-modal-datetime-picker'
import queryString from 'query-string'

import { createGoogleCalendarEvent } from '../../redux/events'

export class NewEvent extends Component {
  constructor(props) {
    super(props)

    const { match, events, location } = this.props
    const { id } = match.params
    const { start, end } = queryString.parse(location.search)
    let event = {}

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
      event = events.find(e => e.id === id)
      event = {
        ...event,
        start: moment(event.start.dateTime),
        end: moment(event.end.dateTime),
      }
    }

    this.state = {
      visible: {
        start: false,
        end: false,
      },
      done: false,
      loading: false,
      ...event,
    }

    this.onPress = this._onPress.bind(this)
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

  async _onPress() {
    const { start, end, summary, description, location } = this.state
    const event = {
      start: {
        dateTime: start.toISOString(),
      },
      end: {
        dateTime: end.toISOString(),
      },
      summary,
      description,
      location,
    }

    this.setState({
      loading: true,
    })
    await this.props.createGoogleCalendarEvent(event)
    this.setState({
      loading: false,
      done: true,
    })
  }

  render() {
    const {
      visible,
      loading,
      done,
      start,
      end,
      summary,
      description,
      location,
    } = this.state
    const _start = start.format('YYYY-MM-DD HH:mm')
    const _end = end.format('YYYY-MM-DD HH:mm')

    if (loading) return <Text>Loading...</Text>
    else if (done) return <Redirect to="/events" />

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
        <TouchableOpacity onPress={this.onPress}>
          <Text>+ Add</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    events: state.events.data,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createGoogleCalendarEvent }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewEvent)
