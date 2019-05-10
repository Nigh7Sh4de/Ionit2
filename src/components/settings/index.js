import React, { Component } from 'react'
import { View, Text, Switch, TouchableOpacity } from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-native'

import { getGoogleCalendarList, setSettings } from '../../redux/calendars'

export class Calendar extends Component {
  constructor(props) {
    super(props)

    const { settings } = this.props

    const incoming = {}
    for (let key of settings.incoming) {
      incoming[key] = true
    }
    const outgoing = {
      [settings.outgoing]: true,
    }

    this.state = {
      settings: {
        incoming,
        outgoing,
      },
    }
  }

  async componentDidMount() {
    await this.props.getGoogleCalendarList()
  }

  setSettings() {
    const { settings } = this.state
    const incoming = Object.keys(settings.incoming).filter(
      calendar => settings.incoming[calendar]
    )
    const outgoing = Object.keys(settings.outgoing).find(
      calendar => settings.outgoing[calendar]
    )
    this.props.setSettings({ incoming, outgoing })
  }

  onIncomingChange(id, value) {
    const settings = {
      ...this.state.settings,
      incoming: {
        ...this.state.settings.incoming,
        [id]: value,
      },
    }
    this.setState({ settings }, this.setSettings)
  }

  onOutgoingChange(id, value) {
    const settings = {
      ...this.state.settings,
      outgoing: {
        [id]: value,
      },
    }
    this.setState({ settings }, this.setSettings)
  }

  render() {
    const calendars = this.props.calendars.map(calendar => (
      <View
        key={calendar.id}
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <Text>{calendar.summary}</Text>
        <Switch
          onValueChange={this.onIncomingChange.bind(this, calendar.id)}
          value={this.state.settings.incoming[calendar.id]}
        />
        <Switch
          onValueChange={this.onOutgoingChange.bind(this, calendar.id)}
          value={this.state.settings.outgoing[calendar.id]}
        />
      </View>
    ))

    return (
      <View>
        {calendars}
        <Link component={TouchableOpacity} to="/events">
          <Text>Start</Text>
        </Link>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    calendars: state.calendars.data,
    settings: state.calendars.settings,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getGoogleCalendarList, setSettings }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Calendar)
