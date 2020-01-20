import { createStore, applyMiddleware, compose } from 'redux'
import { reduxFirestore, getFirestore } from 'redux-firestore'
import firebase from 'react-native-firebase'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import Logger from 'redux-logger'
import Thunk from 'redux-thunk'
import reducers from '../redux'

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
store.firestore.setListeners([{ collection: 'categories' }])
store.firestore.get('categories')

const persistor = persistStore(store)

export { store, persistor }
