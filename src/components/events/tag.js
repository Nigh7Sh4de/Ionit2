import React, { Component } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

export class Tag extends Component {
  constructor(props) {
    super(props)

    this.timeout = null

    this.state = {
      selected: false,
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  onPress() {
    const { selected } = this.state
    if (selected) {
      this.props.onPress()
    } else {
      this.setState({
        selected: true,
      })
      this.timeout = setTimeout(() => {
        this.setState({ selected: false })
      }, 5000)
    }
  }

  render() {
    const { selected } = this.state

    return (
      <TouchableOpacity
        onPress={this.onPress.bind(this)}
        style={{
          paddingVertical: 2,
          paddingHorizontal: 8,
          borderRadius: 8,
          margin: 2,
          backgroundColor: selected ? 'red' : 'grey',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Text>{this.props.tag}</Text>
      </TouchableOpacity>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Tag)
