import React, { Component } from 'react'
import { SafeAreaView, View } from 'react-native'
import { NativeRouter as Router, Switch, Route } from 'react-router-native'
import { createStore, applyMiddleware } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { Provider } from 'react-redux'
import Logger from 'redux-logger'
import Thunk from 'redux-thunk'
import reducers from '../redux'

import Nav from './nav'
import Login from './login'
import Settings from './settings'
import Events from './events'
import Times from './times'
import { PersistGate } from 'redux-persist/integration/react'
import RedirectGate from './login/redirectGate'

const persistConfig = {
  key: 'ionit',
  storage,
  blacklist: ['users', 'events.lastFetch'],
}

const store = createStore(
  persistReducer(persistConfig, reducers),
  applyMiddleware(Thunk, Logger)
)
const persistor = persistStore(store)

export default class App extends Component {
  render() {
    return (
      <View style={{ flexGrow: 1 }}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <SafeAreaView style={{ flex: 1 }}>
              <Router>
                <View style={{ flex: 1 }}>
                  <Route path="/" component={RedirectGate} />
                  <Switch>
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/settings" component={Settings} />
                    <Route exact path="/events" component={Events} />
                    <Route exact path="/times" component={Times} />
                  </Switch>
                </View>
                <Nav />
              </Router>
            </SafeAreaView>
          </PersistGate>
        </Provider>
      </View>
    )
  }
}
