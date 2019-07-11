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

  render() {
    const { date, item, colors } = this.props
    const { summary, id, start, end, colorId, blank } = item
    
    const { selected } = this.state
    if (selected) {
      return (
        <Redirect
          push
          to={`/${blank ? 'new' : id}?start=${start.dateTime}&end=${
            end.dateTime
          }`}
        />
      )
    }

    const _start = moment.max(moment(start.dateTime), moment(date).startOf('day'))
    const _end = moment.min(
      moment(end.dateTime),
      moment(date)
        .startOf('day')
        .add(1, 'day')
    )
    const minutes = _end.diff(_start, 'minutes')
    if (minutes <= 0) {
      return null
    }

    const color = colors[colorId] || {}
    const paddingVertical = Math.min(~~(minutes / 60) * 10, 30)
    let backgroundColor = 'lightgray'
    if (blank) {
      backgroundColor = 'darkgrey'
    } else if (colors[colorId]) {
      backgroundColor = colors[colorId].background
    }

    return (
      <TouchableOpacity
        onPress={this._editEvent.bind(this)}
        style={{
          flexDirection: 'row',
          marginBottom: 15,
          paddingVertical: 10,
          backgroundColor,
        }}
      >
        <View style={{ width: 50, alignItems: 'flex-end', paddingVertical }}>
          <Text>{_start.format('H:mm')}</Text>
          <Text>{_end.format('H:mm')}</Text>
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
}

function mapStateToProps(state) {
  return {
    colors: state.colors.event,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item)
