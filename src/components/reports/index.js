import React, { Component } from 'react'
import { View, Text, TouchableOpacity, Switch } from 'react-native'
import { connect } from 'react-redux'
import moment from 'moment'

export class Reports extends Component {
  constructor(props) {
    super(props)

    this.state = {
      interval: 'weekly',
      rolling: false,
    }
  }

  generateData() {
    const { interval, rolling } = this.state
    const { events } = this.props
    const categories = {}
    const result = []

    const start = moment(date).startOf('day')
    const end = moment(date)
      .startOf('day')
      .add(1, 'day')
    const total = start.diff(end)

    const data = events
      .filter(
        event =>
          moment(event.start.dateTime).isSameOrBefore(end) &&
          moment(event.end.dateTime).isSameOrAfter(start)
      )

    data.forEach(event => {
      if (event.extendedProperties && event.extendedProperties.private && event.extendedProperties.private.category) {
        if (isNaN(categories[event.extendedProperties.private.category])) {
          categories[event.extendedProperties.private.category] = 0
        }
        categories[event.extendedProperties.private.category] += moment(event.start.dateTime).diff(event.end.dateTime)
      }
    })

    for (let category in categories) {
      result.push({ category, hours: categories[category], percent: categories[category] / total })
    }

    return result.map(({category, hours, percent}) => {
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text>{category}</Text>
        <Text>{hours}</Text>
        <Text>{percent}</Text>
      </View>
    })
  }
  }

  render() {
    const { interval, rolling } = this.state
    const data = this.generateData()

    return (
      <View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={this.onSetInterval.bind(this, 'weekly')}
            disabled={interval === 'weekly'}
            style={{
              backgroundColor: interval === 'weekly' ? 'green' : 'grey',
              fontSize: 24,
              padding: 15,
            }}
          >
            <Text>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.onSetInterval.bind(this, 'monthly')}
            disabled={interval === 'monthly'}
            style={{
              backgroundColor: interval === 'monthly' ? 'green' : 'grey',
              fontSize: 24,
              padding: 15,
            }}
          >
            <Text>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.onSetInterval.bind(this, 'yearly')}
            disabled={interval === 'yearly'}
            style={{
              backgroundColor: interval === 'yearly' ? 'green' : 'grey',
              fontSize: 24,
              padding: 15,
            }}
          >
            <Text>Yearly</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Text>Rolling</Text>
          <Switch
            onValueChange={this.onSetRolling.bind(this)}
            value={rolling}
          />
        </View>
        {<Text>{JSON.stringify(this.props.location.state)}</Text>}
        <Text>Results</Text>
        {data}
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    events: state.events.data,
  }
}

export default connect(mapStateToProps)(Reports)
