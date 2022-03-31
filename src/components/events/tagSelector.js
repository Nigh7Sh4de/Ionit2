import React, { PureComponent } from 'react'
import { TextInput } from 'react-native'

const Style = {
  input: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    margin: 2,
    backgroundColor: 'grey',
    justifyContent: 'center',
    textAlign: 'center',
  },
}

/**
 * UNUSED
 */
export default class TagSelector extends PureComponent {
  constructor(props) {
    super(props)

    this.input = React.createRef()
    this.state = {
      text: '',
    }

    this.onChangeText = this._onChangeText.bind(this)
    this.onSubmitEditing = this._onSubmitEditing.bind(this)
    this.onKeyPress = this._onKeyPress.bind(this)
  }

  _onKeyPress({ nativeEvent }) {
    if (nativeEvent.key === 'Backspace' && !this.state.text.length) {
      const text = this.props.onBack()
      this.input.setNativeProps({ text })
      this.setState({
        text,
      })
    }
  }

  _onChangeText(text) {
    if (text[text.length - 1] === ' ') this.onSubmitEditing()
    const split = text.split(' ')
    if (split.length > 1) {
      let i = 0
      for (; i < split.length - 1; i++) {
        this.props.onSubmit(split[i])
      }
      this.setState({ text: split[i] })
    } else this.setState({ text })
  }

  _onSubmitEditing() {
    if (this.state.text.length) {
      this.props.onSubmit(this.state.text)
      this.setState({ text: '' })
    }
  }

  render() {
    return (
      <TextInput
        style={Style.input}
        ref={(input) => (this.input = input)}
        onChangeText={this.onChangeText}
        onSubmitEditing={this.onSubmitEditing}
        onKeyPress={this.onKeyPress}
        value={this.state.text}
        placeholder={this.props.placeholder}
      />
    )
  }
}
