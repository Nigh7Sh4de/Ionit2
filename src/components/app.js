import React, { Component } from 'react'
import { SafeAreaView, View, KeyboardAvoidingView } from 'react-native'
import { NativeRouter as Router, Route, BackButton } from 'react-router-native'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import FlashMessage from 'react-native-flash-message'

import Nav from './nav'
import Login from './login'
import RedirectGate from './login/redirectGate'
import Settings from './settings'
import Events from './events'
import Reports from './reports'
import { store, persistor } from '../lib/store'

export default class App extends Component {
  render() {
    return (
      <View style={{ flexGrow: 1, backgroundColor: '#ffffff' }}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <SafeAreaView style={{ flex: 1 }}>
              <Router>
                <BackButton />
                <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
                  <Route path="/" component={RedirectGate} />
                  <Route path="/login" component={Login} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/events" component={Events} />
                  <Route path="/reports" component={Reports} />
                </KeyboardAvoidingView>
                <Nav />
                <FlashMessage position={{ bottom: 60 }} />
              </Router>
            </SafeAreaView>
          </PersistGate>
        </Provider>
      </View>
    )
  }
}
