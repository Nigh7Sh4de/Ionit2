import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import moment from 'moment'

export class ViewReport extends Component {
  generateGroups() {
    const { location, events } = this.props
    const { groups, start, end } = location.state
    const total = moment(end).diff(start, 'minutes')
    const result = {
      ...groups,
      Unsorted: { minutes: total },
    }

    const tags = {}
    for (let group in groups) {
      tags[group] = {}
      for (let tag of groups[group]) {
        tags[group][tag] = true
      }
    }

    const filteredEvents = events.filter(
      event =>
        moment(event.start.dateTime).isSameOrAfter(start) &&
        moment(event.end.dateTime).isSameOrBefore(end)
    )

    for (let group in groups) {
      const groupEvents = filteredEvents.filter(event => {
        if (
          !event ||
          !event.extendedProperties ||
          !event.extendedProperties.private ||
          !event.extendedProperties.private.tags
        ) {
          return false
        }
        for (let tag of event.extendedProperties.private.tags.split(',')) {
          if (tags[group][tag]) return true
        }
        return false
      })

      let minutes = 0
      groupEvents.forEach(
        event =>
          (minutes += moment(event.end.dateTime).diff(
            event.start.dateTime,
            'minutes'
          ))
      )
      result[group].minutes = minutes
      result.Unsorted.minutes -= minutes
    }

    for (let group in result) {
      result[group].percentage = result[group].minutes / total
    }

    return result
  }

  render() {
    const groupList = []
    const groups = this.generateGroups()

    for (let group in groups) {
      groupList.push(
        <View key={group}>
          <Text>{group}</Text>
          <Text>{groups[group].minutes}</Text>
          <Text>{groups[group].percentage}</Text>
        </View>
      )
    }

    return (
      <View>
        {<Text>{JSON.stringify(this.props.location.state)}</Text>}
        <Text>Results</Text>
        {groupList}
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    events: state.events.data,
  }
}

export default connect(mapStateToProps)(ViewReport)
