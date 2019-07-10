import React, { Component } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { Link } from 'react-router-native'
import { connect } from 'react-redux'

export class SettingsNav extends Component {
  render() {
    return (
      <View contentContainerStyle={{flexShrink: 0, backgroundColo: 'magentar'}}>
        <Text>Settings</Text>
        <Link
          to="/settings/calendars"
          style={{ borderWidth: 1 }}
          component={TouchableOpacity}
        >
          <Text>Calendars</Text>
        </Link>
        <Link
          to="/settings/tags"
          style={{ borderWidth: 1 }}
          component={TouchableOpacity}
        >
          <Text>Tags</Text>
        </Link>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps)(SettingsNav)
