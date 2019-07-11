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
    }
    this.editEvent = this._editEvent.bind(this)
  }

  _editEvent() {
    this.setState({
      selected: true,
    })
  }

  renderItem({ start, end, summary, color, blank }) {
    if (end.diff(start, 'minutes') <= 0) {
      return null
    }

    const paddingVertical = Math.min(end.diff(start, 'minutes') * 0.1, 36)
    let backgroundColor = 'lightgray'
    if (blank) {
      backgroundColor = 'darkgrey'
    } else if (color.background) {
      backgroundColor = color.background
    }

    return (
      <TouchableOpacity
        key={start.toISOString()}
        onPress={this._editEvent.bind(this)}
        style={{
          flexDirection: 'row',
          marginBottom: 5,
          paddingVertical: 10,
          backgroundColor,
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
            borderLeftColor: color.foreground || 'black',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: color.foreground || 'black',
            }}
          >
            {summary}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    const { date, item, colors, interval } = this.props
    const { summary, id, start, end, colorId, blank } = item

    const { selected } = this.state
    if (selected) {
      return (
        <Redirect
          push
          to={`/events/${blank ? 'new' : id}?start=${start.dateTime}&end=${
            end.dateTime
          }`}
        />
      )
    }

    let _start = moment.max(moment(start.dateTime), moment(date).startOf('day'))
    let _end = moment.min(
      moment(end.dateTime),
      moment(date)
        .startOf('day')
        .add(1, 'day')
    )

    const color = colors[colorId] || {}

    if (!blank) {
      return this.renderItem({ start: _start, end: _end, summary, color })
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
    colors: state.colors.event,
    interval: state.settings.interval,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item)
