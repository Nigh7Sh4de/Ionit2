import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-native'
import moment from 'moment'
import DateTimePicker from 'react-native-modal-datetime-picker'

import TagSelector from '../events/tagSelector'

export class CreateReport extends Component {
  constructor(props) {
    super(props)

    this.state = {
      visible: {
        start: false,
        end: false,
      },
      start: moment().startOf('day'),
      end: moment()
        .startOf('day')
        .add(1, 'day'),
      groups: {},
      done: false,
    }

    this.onPress = this._onPress.bind(this)
    this.addGroup = this._addGroup.bind(this)
    this.addTag = this._addTag.bind(this)
    this.editTag = this._editTag.bind(this)
  }

  onChangeGroupName(prevValue, value) {
    const newState = {
      ...this.state,
      groups: {
        ...this.state.groups,
        [value]: this.state.groups[prevValue],
      },
    }

    delete newState.groups[prevValue]
    this.setState(newState)
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

  _addGroup() {
    this.setState({
      groups: {
        ...this.state.groups,
        [`Group${Object.keys(this.state.groups).length + 1}`]: [],
      },
    })
  }

  _addTag(group, tag) {
    let tags = this.state.groups[group]
    if (tags.indexOf(tag) < 0)
      this.setState({
        groups: {
          ...this.state.groups,
          [group]: [...tags, tag],
        },
      })
  }

  _editTag(group) {
    const tags = this.state.groups[group]
    this.setState({
      groups: {
        ...this.state.groups,
        [group]: tags.slice(0, -1),
      },
    })
    return tags.slice(-1)[0]
  }

  async _onPress() {
    console.group('Generating Report')
    console.log(this.state)
    console.groupEnd()

    this.setState({
      done: true,
    })
  }

  render() {
    const { visible, start, end, groups, done } = this.state

    if (done) {
      return (
        <Redirect push to={{ pathname: '/reports/view', state: this.state }} />
      )
    }

    const _start = start.format('YYYY-MM-DD H:mm')
    const _end = end.format('YYYY-MM-DD H:mm')

    const groupSetup = []
    let groupi = 0
    for (let group in groups) {
      const tagList = groups[group].map(tag => (
        <Text key={tag} style={{ fontWeight: '600' }}>
          {tag}
        </Text>
      ))
      groupSetup.push(
        <View key={groupi++}>
          <TextInput
            value={group}
            onChangeText={this.onChangeGroupName.bind(this, group)}
          />
          <Text>Tags</Text>
          {tagList}
          <TagSelector
            onSubmit={this.addTag.bind(this, group)}
            onBack={this.editTag.bind(this, group)}
          />
        </View>
      )
    }

    return (
      <ScrollView>
        <Text>
          Select date range and create groups of tags you would like to be
          presented together.
        </Text>
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
        {groupSetup}
        <TouchableOpacity onPress={this.addGroup}>
          <Text>Add Group</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onPress}>
          <Text>GO!</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }
}

function mapStateToProps(state) {
  return {
    tags: state.events.tags,
  }
}

export default connect(mapStateToProps)(CreateReport)
