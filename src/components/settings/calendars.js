import React, { Component } from 'react'
import { View, Text, Switch } from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { getGoogleCalendarList, setSettings } from '../../redux/calendars'
import { getGoogleCalendarColors } from '../../redux/colors'

export class Calendar extends Component {
  constructor(props) {
    super(props)

    const { settings } = this.props

    const incoming = {}
    for (let key of settings.incoming) {
      incoming[key] = true
    }
    const outgoing = {}

    if (settings.outgoing) {
      outgoing[settings.outgoing] = true
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
    await this.props.getGoogleCalendarColors()
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
    const width = 60
    const calendars = this.props.calendars.map(calendar => (
      <View key={calendar.id} style={{ flexDirection: 'row' }}>
        <Text style={{ flex: 1 }}>{calendar.summary}</Text>
        <Switch
          onValueChange={this.onIncomingChange.bind(this, calendar.id)}
          value={this.state.settings.incoming[calendar.id]}
          style={{ width }}
        />
        <Switch
          onValueChange={this.onOutgoingChange.bind(this, calendar.id)}
          value={this.state.settings.outgoing[calendar.id]}
          style={{ width }}
        />
      </View>
    ))

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ flex: 1 }}>Calendar</Text>
          <Text style={{ width }}>Read</Text>
          <Text style={{ width }}>Write</Text>
        </View>
        {calendars}
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
  return bindActionCreators(
    { getGoogleCalendarList, setSettings, getGoogleCalendarColors },
    dispatch
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Calendar)
