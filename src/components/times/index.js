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
import DateTimePicker from 'react-native-modal-datetime-picker'

import { addTime, setTempStart } from '../../redux/times'
import Time from './time'

export class Times extends Component {
  constructor(props) {
    super(props)
    const { times } = this.props
    this.state = {
      start: times.length
        ? moment(times[times.length - 1].end)
        : moment().startOf('day'),
      end: moment(),
      visible: {
        start: false,
        end: false,
      },
    }

    this.onPress = this._onPress.bind(this)
    this.autoUpdate = this._autoUpdate.bind(this)
  }

  componentDidMount() {
    this.autoUpdate()
  }

  componentWillUnmount() {
    clearTimeout(this.autoUpdateTimeout)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      (this.state.visible.start && nextState.visible.start) ||
      (this.state.visible.end && nextState.visible.end)
    ) {
      return false
    }
    return true
  }

  _autoUpdate() {
    this.setState(
      {
        end: moment(),
      },
      () => (this.autoUpdateTimeout = setTimeout(this.autoUpdate, 1000))
    )
  }

  renderTimes() {
    return this.props.times.map(time => <Time key={time.start} {...time} />)
  }

  onChangeDateTime(picker, value) {
    if (picker === 'end') {
      clearTimeout(this.autoUpdateTimeout)
    } else {
      this.props.setTempStart(value)
    }

    this.setState({
      [picker]: moment(value),
    })
    this.hideDateTime(picker)
  }

  hideDateTime(picker) {
    this.setState({
      visible: {
        ...this.state.visible,
        [picker]: false,
      },
    })
  }

  showDateTime(picker) {
    this.setState({
      visible: {
        ...this.state.visible,
        [picker]: true,
      },
    })
  }

  _onPress() {
    const { start, end } = this.state
    this.props.addTime({ start, end })
    this.setState({
      start: end,
    })
    this.autoUpdate()
  }

  render() {
    const { tempStart } = this.props
    const { visible, end } = this.state
    const start = tempStart ? moment(tempStart) : this.state.start
    const list = this.renderTimes()
    const _start = start.format('H:mm')
    const _end = end.format('H:mm')

    return (
      <View>
        <View>
          <Text>Chilling since: </Text>
          <TouchableOpacity
            value={start}
            onPress={this.showDateTime.bind(this, 'start')}
          >
            <Text>{_start}</Text>
          </TouchableOpacity>
          <DateTimePicker
            mode="time"
            date={start.toDate()}
            isVisible={visible.start}
            onConfirm={this.onChangeDateTime.bind(this, 'start')}
            onCancel={this.hideDateTime.bind(this, 'start')}
          />
        </View>
        <View>
          <Text>til: </Text>
          <TouchableOpacity
            value={end}
            onPress={this.showDateTime.bind(this, 'end')}
          >
            <Text>{_end}</Text>
          </TouchableOpacity>
          <DateTimePicker
            mode="time"
            date={end.toDate()}
            isVisible={visible.end}
            onConfirm={this.onChangeDateTime.bind(this, 'end')}
            onCancel={this.hideDateTime.bind(this, 'end')}
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
    tempStart: state.times.tempStart,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ addTime, setTempStart }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Times)
