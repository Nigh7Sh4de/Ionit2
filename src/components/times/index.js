import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import moment from 'moment'

import { addTime } from '../../redux/times'
import Time from './time'

export class Times extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ...this.getDefaultValue(),
      autoUpdate: true,
    }

    this.onPress = this._onPress.bind(this)
    this.autoUpdate = this._autoUpdate.bind(this)
  }

  componentDidMount() {
    this.autoUpdate()
  }

  _autoUpdate() {
    if (!this.state.autoUpdate) return

    this.setState(
      {
        end: moment(),
      },
      () => setTimeout(this.autoUpdate, 1000)
    )
  }

  getDefaultValue() {
    const { times } = this.props
    return {
      start: times.length
        ? moment(times[times.length - 1].time)
        : moment().startOf('day'),
      end: moment(),
    }
  }

  renderTimes() {
    return this.props.times.map(time => <Time key={time.start} {...time} />)
  }

  onChangeText(field, value) {
    this.setState({
      [field]: value,
    })
  }

  _onPress() {
    const { start, end } = this.state
    this.props.addTime({ start, end })
    this.setState({
      ...this.getDefaultValue(),
    })
  }

  render() {
    const list = this.renderTimes()
    const start = this.state.start.format('HH:mm')
    const end = this.state.end.format('HH:mm')

    return (
      <View>
        <View>
          <Text>Chilling since: </Text>
          <TextInput
            value={start}
            onChangeText={this.onChangeText.bind(this, 'start')}
          />
        </View>
        <View>
          <Text>til: </Text>
          <TextInput
            value={end}
            onChangeText={this.onChangeText.bind(this, 'end')}
          />
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#C12E81',
            height: 40,
            marginVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={this.onPress}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>+ Add</Text>
        </TouchableOpacity>
        <ScrollView>{list}</ScrollView>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    times: state.times.data,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ addTime }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Times)
