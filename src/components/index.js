import React, { Component } from 'react'
import { SafeAreaView, View } from 'react-native'
import { NativeRouter as Router, Switch, Route } from 'react-router-native'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import Logger from 'redux-logger'
import reducers from '../redux'

import Nav from './nav'
import Events from './events'
import Times from './times'

const store = createStore(reducers, applyMiddleware(Logger))

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
              {/* <Nav /> */}
              <Switch>
                <Route path="/events" component={Events} />
                <Route path="/" component={Times} />
              </Switch>
            </Router>
          </SafeAreaView>
        </Provider>
      </View>
    )
  }
}
