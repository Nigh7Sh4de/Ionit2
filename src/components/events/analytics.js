import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'
import moment from 'moment'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import asCalendarConsumer from 'react-native-calendars/src/expandableCalendar/asCalendarConsumer'

export class Analytics extends PureComponent {
  render() {
    const { events, colors, context } = this.props
    const analytics = {
      blank: 0,
    }

    events.forEach(event => {
      const hours =
        moment(
          moment.min(
            event.end.dateTime,
            moment(context.date)
              .startOf('day')
              .add(1, 'day')
          )
        ).diff(
          moment.max(event.start.dateTime, moment(context.date).startOf('day')),
          'minutes'
        ) / 60
      if (event.blank) {
        analytics.blank += hours
      } else if (!analytics[event.colorId]) {
        analytics[event.colorId] = hours
      } else {
        analytics[event.colorId] += hours
      }
    })
    if (!analytics.blank) {
      delete analytics.blank
    }

    const data = Object.keys(analytics).map(type => {
      let backgroundColor = 'lightgray'
      if (type === 'blank') {
        backgroundColor = 'darkgrey'
      } else if (colors[type]) {
        backgroundColor = colors[type].background
      }
      return (
        <View
          key={type}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            marginHorizontal: 10,
            backgroundColor,
          }}
        >
          <Text>{analytics[type]}</Text>
        </View>
      )
    })

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginVertical: 10,
        }}
      >
        {data}
      </View>
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
)(asCalendarConsumer(Analytics))
