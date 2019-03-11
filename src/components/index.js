import React, { Component } from 'react'
import { SafeAreaView, View } from 'react-native'
import { NativeRouter as Router, Switch, Route } from 'react-router-native'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import reducers from '../redux'

import Nav from './nav'
import Events from './events'
import Pauses from './pauses'

const store = createStore(reducers)

export default class App extends Component {
  render() {
    return (
      <View
        style={{
          backgroundColor: 'white',
          flex: 1,
          fontSize: 25,
        }}
      >
        <Provider store={store}>
          <SafeAreaView>
            <Router>
              <Nav />
              <Switch>
                <Route path="/events" component={Events} />
                <Route path="/pauses" component={Pauses} />
              </Switch>
            </Router>
          </SafeAreaView>
        </Provider>
      </View>
    )
  }
}
