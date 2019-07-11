import React, { Component } from 'react'
import { View, Text, TextInput } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { setSettingsInterval } from '../../redux/settings'

export class Interval extends Component {
  onChangeInterval = value => {
    const interval = parseInt(value)
    if (interval != NaN) {
      this.props.setSettingsInterval(interval)
    }
  }

  render() {
    const { interval } = this.props
    return (
      <View style={{ flex: 1 }}>
        <Text>Set interval for calendar view (in minutes)</Text>
        <TextInput
          value={interval.toString()}
          onChangeText={this.onChangeInterval}
        />
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    interval: state.settings.interval,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setSettingsInterval }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Interval)
