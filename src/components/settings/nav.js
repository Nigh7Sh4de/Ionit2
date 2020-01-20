import React, { Component } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { Link } from 'react-router-native'
import { connect } from 'react-redux'

export class SettingsNav extends Component {
  render() {
    return (
      <View>
        <Link
          push
          to="/settings/calendars"
          style={{ paddingVertical: 15 }}
          component={TouchableOpacity}
        >
          <Text>Calendars</Text>
        </Link>
        <Link
          push
          to="/settings/interval"
          style={{ paddingVertical: 15 }}
          component={TouchableOpacity}
        >
          <Text>Interval</Text>
        </Link>
        <Link
          push
          to="/settings/tags"
          style={{ paddingVertical: 15 }}
          component={TouchableOpacity}
        >
          <Text>Tags</Text>
        </Link>
        <Link
          push
          to="/settings/keywords"
          style={{ paddingVertical: 15 }}
          component={TouchableOpacity}
        >
          <Text>Keywords</Text>
        </Link>
        <Link
          push
          to="/settings/categories"
          style={{ paddingVertical: 15 }}
          component={TouchableOpacity}
        >
          <Text>Categories</Text>
        </Link>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps)(SettingsNav)
