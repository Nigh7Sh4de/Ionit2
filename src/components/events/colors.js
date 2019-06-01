import React, { Component } from 'react'
import { ScrollView, Text, TouchableOpacity, Modal } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import {
  createGoogleCalendarEvent,
  patchGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from '../../redux/events'

export class Colors extends Component {
  onChangeColor(color) {
    this.props.onChangeColor(color)
  }

  render() {
    const { colors, color, visible } = this.props
    const colorPalette = Object.keys(colors).map(id => (
      <TouchableOpacity
        key={id}
        style={{
          borderWidth: color === id && 2,
          backgroundColor: colors[id].background,
          height: 40,
          width: 100,
          padding: 10,
          margin: 5,
        }}
        onPress={this.onChangeColor.bind(this, id)}
      />
    ))
    return (
      <Modal visible={visible} transparent={true}>
        <ScrollView
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          {colorPalette}
          <TouchableOpacity
            style={{ padding: 20 }}
            onPress={this.onChangeColor.bind(this, color)}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    events: state.events.data,
    colors: state.colors.event,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createGoogleCalendarEvent,
      patchGoogleCalendarEvent,
      deleteGoogleCalendarEvent,
    },
    dispatch
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Colors)
