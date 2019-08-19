import React, { Component } from 'react'
import { View, Text, TextInput } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { setSettingsInterval } from '../../redux/settings'

export class Interval extends Component {
  constructor(props) {
    super(props)

    this.state = {
      interval: this.props.interval.toString(),
    }
  }
  onChangeInterval = value => {
    this.setState({
      interval: value,
    })

    const interval = parseInt(value)
    if (interval < 15) {
      this.props.setSettingsInterval(15)
    }
    else if (interval >= 15) {
      this.props.setSettingsInterval(interval)
    }
  }

  render() {
    const { interval } = this.state
    return (
      <View style={{ flex: 1 }}>
        <Text>Set interval for calendar view (in minutes, minimum 15)</Text>
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
