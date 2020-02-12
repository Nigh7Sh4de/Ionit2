import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Picker,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import DateTimePicker from 'react-native-modal-datetime-picker'
import queryString from 'query-string'

import CategorySelector from '../lib/categorySelector'
import {
  createGoogleCalendarEvent,
  patchGoogleCalendarEvent,
  patchRecurringGoogleCalendarEvent,
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
        category: '',
      }
    } else {
      foundEvent = events[id]
      let category = ''
      if (
        foundEvent.extendedProperties &&
        foundEvent.extendedProperties.private &&
        foundEvent.extendedProperties.private.category
      ) {
        category = foundEvent.extendedProperties.private.category
      }
      event = {
        start: moment(foundEvent.start.dateTime),
        end: moment(foundEvent.end.dateTime),
        summary: foundEvent.summary,
        description: foundEvent.description,
        location: foundEvent.location,
        colorId: foundEvent.colorId,
        recurringEventId: foundEvent.recurringEventId,
        category,
      }
    }

    this.state = {
      visible: {
        start: false,
        end: false,
        color: false,
        category: false,
      },
      loading: false,
      foundEvent,
      verb: foundEvent ? 'Update' : 'Create',
      updateMode: foundEvent ? 'single' : 'create',
      ...event,
    }

    this.onPress = this._onPress.bind(this)
    this.delete = this._delete.bind(this)
  }

  onChangeText(field, value) {
    let category = this.state.category
    if (field === 'summary') {
      const values = value.split(' ').reverse()
      values.forEach(word => {
        if (this.props.keywords[word]) {
          category = this.props.keywords[word].category
        }
      })
    }
    this.setState({
      [field]: value,
      category,
    })
  }

  onChangeUpdateMode(updateMode) {
    this.setState({
      updateMode,
    })
  }

  onChangeCategory({ category, colorId }) {
    this.setState({
      category,
      colorId,
    })
    this.hideDateTime('category')
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
      category,
      updateMode,
    } = this.state

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
      colorId,
      recurringEventId: foundEvent.recurringEventId,
      extendedProperties: {
        private: {
          category,
        },
      },
    }

    this.setState({
      loading: true,
    })

    switch (updateMode) {
      case 'create':
        await this.props.createGoogleCalendarEvent(event)
        break
      case 'single':
        await this.props.patchGoogleCalendarEvent({
          ...event,
          id: foundEvent.id,
          calendar: foundEvent.calendar,
        })
        break
      case 'future':
        await this.props.patchRecurringGoogleCalendarEvent({
          ...event,
          id: foundEvent.id,
          calendar: foundEvent.calendar,
        })
        break
      case 'all':
        await this.props.patchGoogleCalendarEvent({
          ...event,
          id: foundEvent.recurringEventId,
          calendar: foundEvent.calendar,
        })
        break
    }

    this.setState({
      loading: false,
    })
    this.props.history.goBack()
  }

  render() {
    const {
      visible,
      loading,
      start,
      end,
      summary,
      foundEvent,
      category,
      verb,
      updateMode,
    } = this.state
    const _start = start.format('YYYY-MM-DD H:mm')
    const _end = end.format('YYYY-MM-DD H:mm')

    if (loading) return <Text>Loading...</Text>

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, paddingTop: 10 }}>
          <View
            style={{
              alignItems: 'center',
              padding: 15,
            }}
          >
            <TextInput
              value={summary}
              onChangeText={this.onChangeText.bind(this, 'summary')}
              placeholder="Summary"
              style={{ fontSize: 32, textAlign: 'center' }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              padding: 15,
            }}
          >
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={this.showDateTime.bind(this, 'start')}
              >
                <Text style={{ fontSize: 16 }}>Start</Text>
                <Text style={{ fontSize: 16 }}>{_start}</Text>
              </TouchableOpacity>
              <DateTimePicker
                mode="datetime"
                date={start.toDate()}
                isVisible={visible.start}
                onConfirm={this.onChangeDateTime.bind(this, 'start')}
                onCancel={this.hideDateTime.bind(this, 'start')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={this.showDateTime.bind(this, 'end')}
              >
                <Text style={{ fontSize: 16 }}>End</Text>
                <Text style={{ fontSize: 16 }}>{_end}</Text>
              </TouchableOpacity>
              <DateTimePicker
                mode="datetime"
                date={end.toDate()}
                isVisible={visible.end}
                onConfirm={this.onChangeDateTime.bind(this, 'end')}
                onCancel={this.hideDateTime.bind(this, 'end')}
              />
            </View>
          </View>
          <TouchableOpacity
            style={{ padding: 15, alignItems: 'center' }}
            onPress={this.showDateTime.bind(this, 'category')}
          >
            <Text style={{ fontSize: 16 }}>Category</Text>
            <View
              style={{
                paddingVertical: 2,
                paddingHorizontal: 8,
                borderRadius: 8,
                margin: 2,
                backgroundColor: 'grey',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Text>{category || '+'}</Text>
            </View>
            <CategorySelector
              visible={visible.category}
              onChangeCategory={this.onChangeCategory.bind(this)}
              selected={category}
            />
          </TouchableOpacity>
        </ScrollView>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 0.5 }}>
            <Text>Update series: </Text>
          </View>
          <View style={{ flex: 0.5 }}>
            <Picker
              selectedValue={updateMode}
              onValueChange={this.onChangeUpdateMode.bind(this)}
            >
              <Picker.Item value="single" label="Just this event" />
              <Picker.Item value="future" label="This and all future events" />
              <Picker.Item value="all" label="All events in the series" />
            </Picker>
          </View>
        </View>
        <TouchableOpacity
          style={{
            paddingVertical: 15,
            backgroundColor: '#5095ef',
            alignItems: 'center',
          }}
          onPress={this.onPress}
        >
          <Text style={{ color: '#ffffff', fontSize: 16 }}>{verb}</Text>
        </TouchableOpacity>
        {foundEvent && (
          <TouchableOpacity
            style={{
              paddingVertical: 15,
              alignItems: 'center',
            }}
            onPress={this.delete}
          >
            <Text style={{ color: '#ff0000' }}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    events: state.events.data,
    keywords: state.firestore.data.keywords,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createGoogleCalendarEvent,
      patchGoogleCalendarEvent,
      deleteGoogleCalendarEvent,
      patchRecurringGoogleCalendarEvent,
    },
    dispatch
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(NewEvent)
