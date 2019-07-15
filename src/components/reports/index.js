import React, { Component } from 'react'
import { View } from 'react-native'
import { Route } from 'react-router-native'
import { connect } from 'react-redux'

import CreateReport from './create'
import ViewReport from './view'

export class Reports extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Route exact path="/reports" component={CreateReport} />
        <Route exact path="/reports/view" component={ViewReport} />
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps)(Reports)
