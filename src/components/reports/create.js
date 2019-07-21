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

import TagTreeSelector from '../events/tagTreeSelector'

export class CreateReport extends Component {
  constructor(props) {
    super(props)

    this.state = {
      visible: {
        start: false,
        end: false,
        tags: false,
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
    this.removeTag = this._removeTag.bind(this)
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

  _removeTag(group, tag) {
    const tags = this.state.groups[group]
    this.setState({
      groups: {
        ...this.state.groups,
        [group]: tags.filter(x => x !== tag),
      },
    })
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
          <TouchableOpacity
            style={{ paddingVertical: 15 }}
            onPress={this.showDateTime.bind(this, 'tags')}
          >
            <Text>Search through existing tags</Text>
          </TouchableOpacity>
          <TagTreeSelector
            visible={visible.tags}
            selected={groups[group]}
            onSelectTag={this.addTag.bind(this, group)}
            onUnselectTag={this.removeTag.bind(this, group)}
            onClose={this.hideDateTime.bind(this, 'tags')}
          />
          {tagList}
        </View>
      )
    }

    return (
      <ScrollView>
        <Text>
          Select date range and create groups of tags you would like to be
          presented together.
        </Text>
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
        {groupSetup}
        <TouchableOpacity
          style={{ paddingVertical: 15 }}
          onPress={this.addGroup}
        >
          <Text>Add Group</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ paddingVertical: 15 }}
          onPress={this.onPress}
        >
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
