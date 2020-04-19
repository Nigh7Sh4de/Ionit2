import React, { PureComponent } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Redirect } from 'react-router-native'
import moment from 'moment'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

export class Item extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      selected: false,
      override: {},
    }
    this.editEvent = this._editEvent.bind(this)
  }

  _editEvent(override) {
    this.setState({
      selected: true,
      override,
    })
  }

  renderItem({ start, end, summary, color }) {
    if (end.diff(start, 'minutes') <= 0) {
      return null
    }

    const paddingVertical = Math.min(end.diff(start, 'minutes') * 0.08, 36)

    return (
      <TouchableOpacity
        key={start.toISOString()}
        onPress={this._editEvent.bind(this, {
          start: start.toISOString(),
          end: end.toISOString(),
        })}
        style={{
          flexDirection: 'row',
          marginBottom: 5,
          paddingVertical: 10,
          backgroundColor: color.background,
        }}
      >
        <View style={{ width: 50, alignItems: 'flex-end', paddingVertical }}>
          <Text>{start.format('H:mm')}</Text>
          <Text>{end.format('H:mm')}</Text>
        </View>
        <View
          style={{
            flex: 1,
            marginHorizontal: 5,
            paddingLeft: 10,
            paddingVertical,
            borderLeftWidth: 1,
            borderLeftColor: color.foreground,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: color.foreground,
            }}
          >
            {summary}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    const { date, item, colors, interval, categoryData } = this.props
    const { summary, id, start, end, colorId, blank, extendedProperties } = item

    let color = {
      background: '#dddddd',
      foreground: '#000000',
    }
    if (blank) {
      color.background = '#ffffff'
    } else if (
      extendedProperties &&
      extendedProperties.private &&
      extendedProperties.private.category &&
      categoryData[extendedProperties.private.category] &&
      categoryData[extendedProperties.private.category].color
    ) {
      color = categoryData[extendedProperties.private.category].color
    } else if (colorId && colors[colorId]) {
      color = colors[colorId]
    }

    const { selected, override } = this.state
    if (selected) {
      return (
        <Redirect
          push
          to={`/events/${blank ? 'new' : id}?start=${
            override.start || start.dateTime
          }&end=${override.end || end.dateTime}`}
        />
      )
    }

    let _start = moment.max(moment(start.dateTime), moment(date).startOf('day'))
    let _end = moment.min(
      moment(end.dateTime),
      moment(date).startOf('day').add(1, 'day')
    )

    if (!blank) {
      return this.renderItem({
        start: _start,
        end: _end,
        summary,
        color,
      })
    } else {
      const result = []
      while (_start < _end) {
        result.push(
          this.renderItem({
            start: _start,
            end: moment.min(moment(_start).add(interval, 'minutes'), _end),
            summary,
            color,
          })
        )

        _start = _start.add(interval, 'minutes')
      }
      return result
    }
  }
}

function mapStateToProps(state) {
  return {
    categoryData: state.firestore.data.categories || {},
    colors: state.colors.event,
    interval: state.settings.interval,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Item)
