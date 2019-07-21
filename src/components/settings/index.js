import React, { Component } from 'react'
import { View } from 'react-native'
import { NativeRouter as Router, Route } from 'react-router-native'
import { connect } from 'react-redux'

import Nav from './nav'
import Calendars from './calendars'
import Interval from './interval'
import Tags from './tags'

export class Settings extends Component {
  render() {
    console.group('Settings rendering')
    console.log(this.props.location.pathname)
    console.groupEnd()

    return (
      <View style={{ flex: 1 }}>
        <Route exact path="/settings" component={Nav} />
        <Route exact path="/settings/calendars" component={Calendars} />
        <Route exact path="/settings/interval" component={Interval} />
        <Route exact path="/settings/tags" component={Tags} />
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps)(Settings)
