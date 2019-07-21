import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native'
import uuidv4 from 'uuid/v4'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import DateTimePicker from 'react-native-modal-datetime-picker'
import queryString from 'query-string'

import TagSelector from './tagSelector'
import TagTreeSelector from './tagTreeSelector'
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
        tags: [],
      }
    } else {
      foundEvent = events.find(e => e.id === id)
      let tags = []
      if (
        foundEvent.extendedProperties &&
        foundEvent.extendedProperties.private &&
        foundEvent.extendedProperties.private.tags
      ) {
        tags = foundEvent.extendedProperties.private.tags.split(',')
      }
      event = {
        start: moment(foundEvent.start.dateTime),
        end: moment(foundEvent.end.dateTime),
        summary: foundEvent.summary,
        description: foundEvent.description,
        location: foundEvent.location,
        colorId: foundEvent.colorId,
        tags,
      }
    }

    this.state = {
      visible: {
        start: false,
        end: false,
        color: false,
        tags: false,
      },
      loading: false,
      foundEvent,
      ...event,
    }

    this.onPress = this._onPress.bind(this)
    this.delete = this._delete.bind(this)
    this.addTag = this._addTag.bind(this)
    this.editTag = this._editTag.bind(this)
    this.removeTag = this._removeTag.bind(this)
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

  _addTag(tag) {
    let { tags } = this.state
    if (tags.indexOf(tag) < 0)
      this.setState({
        tags: [...tags, tag],
      })
  }

  _editTag() {
    const { tags } = this.state
    this.setState({
      tags: tags.slice(0, -1),
    })
    return tags.slice(-1)[0]
  }

  _removeTag(tag) {
    let { tags } = this.state
    this.setState({
      tags: tags.filter(x => x !== tag),
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
      tags,
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
      extendedProperties: {
        private: {
          tags: tags.join(','),
        },
      },
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
      tags,
    } = this.state
    const _start = start.format('YYYY-MM-DD H:mm')
    const _end = end.format('YYYY-MM-DD H:mm')
    const tagList = tags.length ? (
      tags.map(tag => (
        <Text key={tag} style={{ fontWeight: '600', fontSize: 16 }}>
          {tag}
        </Text>
      ))
    ) : (
      <Text style={{ fontSize: 14 }}>None selected</Text>
    )

    if (loading) return <Text>Loading...</Text>

    const verb = foundEvent ? 'Update' : 'Create'

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row' }}>
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
          <View style={{ margin: 20 }}>
            <TextInput
              value={summary}
              onChangeText={this.onChangeText.bind(this, 'summary')}
              placeholder="Summary"
              style={{ fontSize: 32 }}
            />
            <TextInput
              value={description}
              onChangeText={this.onChangeText.bind(this, 'description')}
              placeholder="Description"
              style={{ fontSize: 16 }}
            />
            <TextInput
              value={location}
              onChangeText={this.onChangeText.bind(this, 'location')}
              placeholder="Location"
              style={{ fontSize: 16 }}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={this.showDateTime.bind(this, 'color')}
              >
                <Text style={{ fontSize: 16 }}>Color</Text>
                <View
                  style={{
                    backgroundColor: colorId
                      ? colors[colorId].background
                      : 'grey',
                    height: 36,
                    width: 36,
                    borderRadius: 36,
                  }}
                />
              </TouchableOpacity>
              <Colors
                visible={visible.color}
                colors={colors}
                color={colorId}
                onChangeColor={this.onChangeColor.bind(this)}
              />
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={this.showDateTime.bind(this, 'tags')}
              >
                <Text style={{ fontSize: 16 }}>Tags</Text>
                {tagList}
              </TouchableOpacity>
              <TagTreeSelector
                visible={visible.tags}
                selected={tags}
                onSelectTag={this.addTag.bind(this)}
                onUnselectTag={this.removeTag.bind(this)}
                onClose={this.hideDateTime.bind(this, 'tags')}
              />
              <TagSelector onSubmit={this.addTag} onBack={this.editTag} />
            </View>
          </View>
        </ScrollView>
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
