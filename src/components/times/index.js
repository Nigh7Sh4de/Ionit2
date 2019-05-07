import React, { Component } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { addTime } from '../../redux/times'
import Time from './time'

export class Times extends Component {
  constructor(props) {
    super(props)

    this.onPress = this._onPress.bind(this)
  }

  renderTimes() {
    return this.props.times.map(pause => <Time key={pause.time} {...pause} />)
  }

  _onPress() {
    const date = new Date()

    this.props.addTime(date)
  }

  render() {
    const { times } = this.props

    let verb = 'Go!'
    let headline = <Text>Click the button above to get started!</Text>
    const list = this.renderTimes()

    if (times.length) {
      const { time, active } = times[times.length - 1]
      const date = new Date(time)
      const state = active ? 'Active' : 'Resting'
      if (active) {
        verb = 'Pause'
      }
      headline = (
        <View>
          <Text>
            {state} since: {date.toLocaleTimeString()}
          </Text>
        </View>
      )
    }

    return (
      <View>
        <TouchableOpacity
          style={{
            backgroundColor: '#C12E81',
            height: 40,
            marginVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={this.onPress}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{verb}</Text>
        </TouchableOpacity>
        {headline}
        <ScrollView>{list}</ScrollView>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    times: state.times.data,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ addTime }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Times)
