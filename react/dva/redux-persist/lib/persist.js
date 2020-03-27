const PERSIST_INIT = 'PERSIST_INIT'
const LOCAL_STORE = '@@LOCAL_STORE'

/**
 * 持久化 state
 * @param {Object} config 
 * @param {String} config.key
 * @param {Storage} config.storage 
 * @param {*} reducer 
 */
export const persistReducer = (config, reducer) => {
  const initialized = false
  const { storage, key } = config
  const persistKey = `persist: ${key}`
  return (state, action) => {
    switch (action.type) {
      case PERSIST_INIT: {
        initialized = true
        const localValue = storage.getItem(persistKey)
        const localState = localValue
                            ? JSON.parse(localValue)
                            : state
        return reducer(localState, action)
      }
      default: {
        const nextState = reducer(state, action)
        if (initialized) {
          storage.setItem(persistKey, JSON.stringify(nextState))
        }
        return nextState
      }
    }
  }
}
export const persistStore = (store) => ({
  ...store,
  initState () {
    store.dispatch({
      type: PERSIST_INIT
    })
  }
})