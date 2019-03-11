import React, { Component } from 'react'
import { View, Text, Button } from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { startPause, stopPause } from '../../redux/pauses'
import Pause from './pause'

export class Pauses extends Component {
  constructor(props) {
    super(props)

    this.onPress = this._onPress.bind(this)
  }
  renderPauses() {
    return this.props.pauses.data.map(pause => (
      <Pause key={pause.start} {...pause} />
    ))
  }

  _onPress() {
    const { active } = this.props.pauses
    const date = new Date()

    if (active) this.props.stop(date)
    else this.props.start(date)
  }

  render() {
    const { active } = this.props.pauses
    const pauses = this.renderPauses()

    return (
      <View>
        <Text>Pauses</Text>
        <Button title={active ? 'STOP' : 'START'} onPress={this.onPress} />
        {active && (
          <View>
            <Text>Resting since: {active.toLocaleTimeString()}</Text>
          </View>
        )}
        <View>{pauses}</View>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    pauses: state.pauses,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      start: startPause,
      stop: stopPause,
    },
    dispatch
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pauses)
