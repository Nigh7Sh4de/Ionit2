import React, { Component } from 'react'
import { SafeAreaView, View, KeyboardAvoidingView } from 'react-native'
import { NativeRouter as Router, Route, BackButton } from 'react-router-native'
import { createStore, applyMiddleware, compose } from 'redux'
import { reduxFirestore, getFirestore } from 'redux-firestore'
import firebase from 'react-native-firebase'
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
import Reports from './reports'
import { PersistGate } from 'redux-persist/integration/react'
import RedirectGate from './login/redirectGate'
import FlashMessage from 'react-native-flash-message'

firebase.initializeApp()
firebase.firestore()

const persistConfig = {
  key: 'ionit',
  storage,
  blacklist: ['events.lastFetch'],
}

const store = createStore(
  persistReducer(persistConfig, reducers),
  compose(
    reduxFirestore(firebase),
    applyMiddleware(Thunk.withExtraArgument({ getFirestore }), Logger)
  )
)
store.firestore.setListeners([{ collection: 'keywords' }])
store.firestore.get('keywords')

const persistor = persistStore(store)

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
