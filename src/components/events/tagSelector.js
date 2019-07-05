import React, { PureComponent } from 'react'
import { TextInput } from 'react-native'

// import { start as Style } from 'src/views/web/style'
const Style = {}

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
    else this.setState({ text })
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
        ref={input => (this.input = input)}
        onChangeText={this.onChangeText}
        onSubmitEditing={this.onSubmitEditing}
        onKeyPress={this.onKeyPress}
        value={this.state.text}
      />
    )
  }
}
