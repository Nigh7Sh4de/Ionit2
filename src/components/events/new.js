import React, { Component } from 'react'
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Picker,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment-timezone'
import DateTimePicker from 'react-native-modal-datetime-picker'
import queryString from 'query-string'

import CategorySelector from '../lib/categorySelector'
import {
  createGoogleCalendarEvent,
  patchGoogleCalendarEvent,
  patchRecurringFutureGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  deleteRecurringFutureGoogleCalendarEvent,
} from '../../redux/events'
import {
  updateFirestoreEvent,
  deleteFirestoreEvent,
  deleteRecurringFutureFirestoreEvent,
} from '../../redux/firestore'

export class NewEvent extends Component {
  constructor(props) {
    super(props)

    const { match, events, fsEvents, location } = this.props
    const { id } = match.params
    const { start, end } = queryString.parse(location.search)
    let gc = {}
    let fs = {}
    let foundEvent = null
    let foundFsEvent = null

    if (id === 'new') {
      foundEvent = { start: {}, end: {} }
      foundFsEvent = {}
      gc = {
        start: start ? moment(start) : moment().startOf('hour'),
        end: end ? moment(end) : moment().add(1, 'hour').startOf('hour'),
        summary: '',
      }
      fs = {
        category: '',
      }
    } else {
      if (id.split('_').length > 1) {
        const recurringEventId = id.split('_')[0]
        const recurringEvent = events[recurringEventId]
        foundEvent =
          recurringEvent &&
          recurringEvent.singleEvents &&
          recurringEvent.singleEvents[id]
        foundFsEvent = {
          ...fsEvents[recurringEventId],
          ...fsEvents[id],
        }
      } else {
        foundEvent = events[id]
        foundFsEvent = {
          ...fsEvents[id],
        }
      }
      if (!foundEvent) {
        Alert.alert('Event not found', id)
        this.state = {
          loading: true,
        }
        return this.props.history.goBack()
      }

      gc = {
        start: moment(foundEvent.start.dateTime),
        end: moment(foundEvent.end.dateTime),
        summary: foundEvent.summary,
        colorId: foundEvent.colorId,
      }
      fs = {
        category: foundFsEvent.category || '',
      }
    }

    this.state = {
      loading: false,
      foundEvent,
      foundFsEvent,
      gc,
      fs,
      updateMode: foundEvent.id ? 'single' : 'create',
      dirty: {
        gc: !!foundEvent.id,
        fs: !!foundEvent.id,
      },
      visible: {
        start: false,
        end: false,
        color: false,
        category: false,
      },
    }
  }

  onChangeCategory({ category, colorId }) {
    const { fs, gc, dirty, foundEvent, foundFsEvent } = this.state
    this.setState({
      fs: { ...fs, category },
      gc: { ...gc, colorId },
      dirty: {
        ...dirty,
        fs: category !== foundFsEvent.category,
        gc: colorId !== foundEvent.colorId,
      },
    })
    this.hideSelector('category')
  }

  onChangeDateTime(picker, value) {
    const { gc, dirty, foundEvent } = this.state
    this.setState({
      gc: { ...gc, [picker]: moment(value) },
      dirty: {
        ...dirty,
        gc: !moment(value).isSame(foundEvent[picker].dateTime),
      },
    })
    this.hideSelector(picker)
  }

  onChangeSummary(summary) {
    const { fs, gc, dirty, foundEvent, foundFsEvent } = this.state
    let category = fs.category

    const words = summary.split(' ').reverse()
    words.forEach((word) => {
      if (this.props.keywords[word]) {
        category = this.props.keywords[word].category
      }
    })

    this.setState({
      fs: { ...fs, category },
      gc: { ...gc, summary },
      dirty: {
        ...dirty,
        fs: category !== foundFsEvent.category,
        gc: summary !== foundEvent.summary,
      },
    })
  }

  onChangeUpdateMode(updateMode) {
    this.setState({
      updateMode,
    })
  }

  hideSelector(picker) {
    this.setState({
      visible: {
        ...this.state.visible,
        [picker]: false,
      },
    })
  }

  showSelector(picker) {
    this.setState({
      visible: {
        ...this.state.visible,
        [picker]: true,
      },
    })
  }

  async onDelete() {
    const { foundEvent, updateMode, gc } = this.state

    this.setState({
      loading: true,
    })

    switch (updateMode) {
      case 'single':
        await this.props.deleteFirestoreEvent({
          id: foundEvent.id,
          recurringEventId: foundEvent.recurringEventId,
        })
        await this.props.deleteGoogleCalendarEvent({
          id: foundEvent.id,
          recurringEventId: foundEvent.recurringEventId,
        })
        break
      case 'future':
        await this.props.deleteRecurringFutureFirestoreEvent({
          recurringEventId: foundEvent.recurringEventId,
          start: { dateTime: gc.start.format() },
        })
        await this.props.deleteRecurringFutureGoogleCalendarEvent({
          recurringEventId: foundEvent.recurringEventId,
          start: { dateTime: gc.start.format() },
        })
        break
      case 'all':
        await this.props.deleteFirestoreEvent({
          id: foundEvent.recurringEventId,
        })
        await this.props.deleteGoogleCalendarEvent({
          id: foundEvent.recurringEventId,
        })
        break
    }

    this.setState({
      loading: false,
    })
    this.props.history.goBack()
  }

  async onPress() {
    const { dirty, foundEvent, updateMode, gc, fs } = this.state
    console.group('Event onPress')
    console.log({ updateMode, dirty })

    const timeZone =
      (foundEvent && foundEvent.start && foundEvent.start.timeZone) ||
      moment.tz.guess()
    const _gc = {
      colorId: gc.colorId,
      end: {
        dateTime: gc.end.format(),
        timeZone,
      },
      id: foundEvent.id,
      recurringEventId: foundEvent.recurringEventId,
      start: {
        dateTime: gc.start.format(),
        timeZone,
      },
      summary: gc.summary,
    }
    const _fs = {
      category: fs.category,
      id: foundEvent.id,
    }
    console.log({ foundEvent, _gc, _fs })

    this.setState({
      loading: true,
    })

    switch (updateMode) {
      case 'create':
        const createResult = await this.props.createGoogleCalendarEvent(_gc)
        dirty.fs &&
          (await this.props.updateFirestoreEvent({
            ..._fs,
            id: createResult.event.id,
          }))
        break
      case 'single':
        dirty.gc && (await this.props.patchGoogleCalendarEvent(_gc))
        dirty.fs && (await this.props.updateFirestoreEvent(_fs))
        break
      case 'future':
        await this.props.deleteRecurringFutureFirestoreEvent({
          recurringEventId: foundEvent.recurringEventId,
          start: _gc.start.dateTime,
        })
        const patchResult = await this.props.patchRecurringFutureGoogleCalendarEvent(
          _gc
        )
        await this.props.updateFirestoreEvent({ ..._fs, id: patchResult.newId })
        break
      case 'all':
        dirty.gc &&
          (await this.props.patchGoogleCalendarEvent({
            ..._gc,
            id: foundEvent.recurringEventId,
            recurringEventId: null,
          }))
        dirty.fs &&
          (await this.props.updateFirestoreEvent({
            ..._fs,
            id: foundEvent.recurringEventId,
          }))
        break
    }

    console.groupEnd()
    this.setState({
      loading: false,
    })
    this.props.history.goBack()
  }

  render() {
    const { fs, gc, visible, loading, foundEvent, updateMode } = this.state

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
              value={gc.summary}
              onChangeText={this.onChangeSummary.bind(this)}
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
                onPress={this.showSelector.bind(this, 'start')}
              >
                <Text style={{ fontSize: 16 }}>Start</Text>
                <Text style={{ fontSize: 16 }}>
                  {gc.start.format('YYYY-MM-DD H:mm')}
                </Text>
              </TouchableOpacity>
              <DateTimePicker
                mode="datetime"
                date={gc.start.toDate()}
                isVisible={visible.start}
                onConfirm={this.onChangeDateTime.bind(this, 'start')}
                onCancel={this.hideSelector.bind(this, 'start')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={this.showSelector.bind(this, 'end')}
              >
                <Text style={{ fontSize: 16 }}>End</Text>
                <Text style={{ fontSize: 16 }}>
                  {gc.end.format('YYYY-MM-DD H:mm')}
                </Text>
              </TouchableOpacity>
              <DateTimePicker
                mode="datetime"
                date={gc.end.toDate()}
                isVisible={visible.end}
                onConfirm={this.onChangeDateTime.bind(this, 'end')}
                onCancel={this.hideSelector.bind(this, 'end')}
              />
            </View>
          </View>
          <TouchableOpacity
            style={{ padding: 15, alignItems: 'center' }}
            onPress={this.showSelector.bind(this, 'category')}
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
              <Text>{fs.category || '+'}</Text>
            </View>
            <CategorySelector
              visible={visible.category}
              onChangeCategory={this.onChangeCategory.bind(this)}
              selected={fs.category}
            />
          </TouchableOpacity>
        </ScrollView>
        {foundEvent && foundEvent.recurringEventId && (
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
                <Picker.Item
                  value="future"
                  label="This and all future events"
                />
                <Picker.Item value="all" label="All events in the series" />
              </Picker>
            </View>
          </View>
        )}
        <TouchableOpacity
          style={{
            paddingVertical: 15,
            backgroundColor: '#5095ef',
            alignItems: 'center',
          }}
          onPress={this.onPress.bind(this)}
        >
          <Text style={{ color: '#ffffff', fontSize: 16 }}>
            {foundEvent.id ? 'Update' : 'Create'}
          </Text>
        </TouchableOpacity>
        {foundEvent && (
          <TouchableOpacity
            style={{
              paddingVertical: 15,
              alignItems: 'center',
            }}
            onPress={this.onDelete.bind(this)}
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
    events: state.events.data || {},
    fsEvents: state.firestore.data.events || {},
    keywords: state.firestore.data.keywords || {},
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createGoogleCalendarEvent,
      patchGoogleCalendarEvent,
      deleteGoogleCalendarEvent,
      patchRecurringFutureGoogleCalendarEvent,
      deleteRecurringFutureGoogleCalendarEvent,
      updateFirestoreEvent,
      deleteFirestoreEvent,
      deleteRecurringFutureFirestoreEvent,
    },
    dispatch
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(NewEvent)
