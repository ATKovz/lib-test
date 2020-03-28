const SHOW = '@@TEO\'S_DVA_LOADING/SHOW'
const HIDE = '@@TEO\'S_DVA_LOADING/HIDE'
const NAMESPACE = 'loading'

const createLoading = () => {
  const initialState = {
    global: false,
    models: {},
    effects: {}
  }
  const extraReducers = {
    [NAMESPACE]: (state = initialState, { type, payload }) => {
      const { namespace, actionType } = payload || {}
      let ret
      switch (type) {
        case SHOW:
          {
            return {
              ...state,
              global: true,
              models: {
                ...state.models,
                [namespace]: true
              },
              effects: {
                ...state.effects,
                [actionType]: true
              }
            }
          }
        case HIDE: {
          const effects = {
            ...state.effects,
            [actionType]: false
          }
          const models = {
            ...state.models,
            [namespace]: Object.keys(effects).some(key => {
              const _namespace = actionType.split('/')[0]
              return _namespace !== namespace && effects[actionType]
            })
          }
          const global = Object.keys(models).some(key => models[key])
          return {
            models,
            effects,
            global
          }
        }
        default:
          return {
            models: {},
            effects: {},
            global: false
          }
      }
    }
  }
  const onEffect = (effect, { put }, model, actionType) => {
    // 传参到这正常
    const { namespace } = model

    return function * (...args) {
      try {
        yield put({
          type: SHOW,
          payload: {
            namespace,
            actionType
          }})
        yield effect(...args)
      } catch (err) {
        
      } finally {
        yield put ({
          type: HIDE,
          payload: {
            namespace,
            actionType
          }
        })
      }
    }
  }

  return {
    onEffect,
    extraReducers
  }
}

export default createLoading
