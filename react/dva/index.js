import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider, connect } from 'react-redux'
import { createHashHistory, createBrowserHistory } from 'history'
import createSagaMiddleWare from 'redux-saga'
import * as RouterRedux from 'connected-react-router'
import * as sagaEffects from 'redux-saga/effects'
import { Plugin, HOOKS_EXTRA_REDUCERS, HOOKS_ONEFFECT, HOOKS_ONACTION, HOOKS_ONSTATE_CHANGE, HOOKS_ONREDUCER, HOOKS_EXTRA_ENHANCERS, HOOKS_ONERROR } from './plugins'
import { hasString } from './utils'

export { RouterRedux }
export * from 'react-router-dom'

const { connectRouter } = RouterRedux

/**
 * 把 model 里的 reducer 转化成真实 reducer
 * @param {Object} app 
 */
const createReducer = (reducers, initialState = {}) => (
  (state = initialState, action) => {
    return reducers[action.type]
            ? reducers[action.type](state, action)
            : state
  }
)

/**
 * 处理 model 里的 effects-key && reducers-key
 * @param {Object} model dva-model
 * @param {'effects' | 'reducers'} fieldName 
 */
const prefixNamespace = (model, fieldName) => {
  const { namespace } = model
  const target = model[fieldName] || {}
  const nextTarget = Object.keys(target).reduce((prev, key) => {
    const PREFIX_SEP = '/'
    const nextKey = hasString(key, '/')
                      ? key
                      : `${namespace}${PREFIX_SEP}${key}`
    prev[nextKey] = target[key]
    return prev
  }, {})
  model[fieldName] = nextTarget
  return model
}

/**
 * 在 effects 内部调用 put 时 type 的 namespace 处理
 * @param {String} key 
 * @param {Object} model 
 */
const prefixKey = (key, model) => {
  if (hasString(key, '/')) {
    if (hasString(key, model.namespace)) {
      console.warn('调用自身不需要加 namespace')
    }
    return key
  }
  return `${model.namespace}/${key}`
}

/**
 * 加载 subscription
 * @param {Object} app 
 */
const runSubscriptions = (app, onError) => {
  app._models.forEach(model => {
    const { subscriptions = {} } = model
    runSubscription(subscriptions, app, onError)
    // runSubscription(subscriptions, app._store.dispatch, app._history)
  })
}
const runSubscription = (subscriptions, app, onError) => {
  Object.keys(subscriptions).forEach(key => {
    subscriptions[key]({ history: app._history, dispatch: app._store.dispatch }, onError)
  })
}

/**
 * 重写put
 * @param {Object} model 
 */
const generatePut = model => action => sagaEffects.put({ ...action, type: prefixKey(action.type, model) })

const getWatcher = (key, effect, model, onEffect, onError) => {
  const secureKey = prefixKey(key, model)
  const put = generatePut(model)
  return function * () {
    // 此处代码形成闭包就行了，建议不要放在 takeEvery 里，优化性能
    if (onEffect) {
      onEffect.forEach(cb => {
        effect = cb(effect, { ...sagaEffects, put }, model, secureKey)
      })
    }
    yield sagaEffects.takeEvery(secureKey, function * (...args) {
      try {
        yield effect({ ...args }, { ...sagaEffects, put })
      } catch (err) {
        onError(err)
      }
    })
  }
}

const dva = function (opt = {}) {
  const history = opt.history || createHashHistory()
  const app = {
    _router: null,
    _models: [],
    model,
    router,
    start,
    _history: history
  }
  const initialReducer = {
    // 这个主要是把它挂到 state 上，以及加个 POP type，因为 RouterRedux.push 是生成一个 action 然后用 dispatch 触发的
    router: connectRouter(app._history)
  }
  const sagaMiddleWare = createSagaMiddleWare()
  // 插件实例初始化
  const plugins = new Plugin([])
  // 处理 onError 
  const onError = (error) => {
    const ErrorCb = plugins.get(HOOKS_ONERROR)
    ErrorCb.forEach(cb => {
      cb(error)
    })
  }
  app.use = plugins.use.bind(plugins)
  app.injectModel = injectModel.bind(app)
  /**
   * 处理 effects
   * @param {Object} app 
   */
  function getSagas (app) {
    const sagas = []
    app._models.forEach(model => {
      sagas.push(getSaga(model, plugins.get(HOOKS_ONEFFECT)))
    })
    return sagas
  }
  /**
   * 监听 effects （saga）
   * @param {Object} model 
   * @param {Object} onEffect plugin.get('onEffect')
   * @param {Object} onError plugin.get('onError')
   */
  function getSaga (model, onEffect, onError) {
    return function * () {
      const { effects } = model
      for (const key in effects) {
        const watcher = getWatcher(key, effects[key], model, onEffect, onError)
        // 开一个新的线程执行 saga （saga 主要是调用 takeEvery 来监听 put/dispatch 里的 type）
        yield sagaEffects.fork(watcher)
      }
    }
  }
  // 注册 model
  function model (dvaModel) {
    const prefixedEffectsModel = prefixNamespace(dvaModel, 'effects')
    const prefixedModel = prefixNamespace(prefixedEffectsModel, 'reducers')
    app._models.push(prefixedModel)
    return prefixedModel
  }
  // 监听后续注入的 model
  function injectModel (m) {
    // prefix
    m = model(m)
    if (m.effects) {
      const saga = getSaga(m, plugins.get(HOOKS_ONEFFECT), onError)
      sagaMiddleWare.run(saga)
    }
    if (m.reducers) {
      initialReducer[m.namespace] = createReducer(m.reducers, m.state)
      app._store.replaceReducer(getReducer())
    }
    if (m.subscription) {
      runSubscription(m.subscriptions, app, onError)
    }
  }
  function router (render) {
    app._router = render
  }
  function start (container) {
    app._models.forEach(model => {
      initialReducer[model.namespace] = createReducer(model.reducers, model.state)
    }, {})
    const rootReducer = getReducer()
    // 处理 extraEnhancers 和 onAction hooks 的中间件
    const extraEnhancers = plugins.get(HOOKS_EXTRA_ENHANCERS)
    const extraMiddlewares = plugins.get(HOOKS_ONACTION)
    // applyMiddlewares 的返回值就是一个 enhancers
    const enhancer = [
      ...extraEnhancers,
      applyMiddleware(
        RouterRedux.routerMiddleware(history),
        sagaMiddleWare,
        ...extraMiddlewares,
      )
    ]
    const store = createStore(rootReducer, opt.initialState, compose(...enhancer))
    app._store = store
    // 处理 subcriprion
    runSubscriptions(app, onError)
    // 监听 effects
    const sagas = getSagas(app)
    sagas.forEach(sagaMiddleWare.run)
    // 处理 onStateChange 
    const onStateChange = plugins.get(HOOKS_ONSTATE_CHANGE)
    store.subscribe(() => {
      onStateChange.forEach((cb) => {
        cb(store.getState())
      })
    })
    // 渲染路由
    ReactDOM.render(
      <Provider store={app._store}>
        {app._router({ history, app })}
      </Provider>,
      document.querySelector(container)
    )
  }
  const getReducer = () => {
    const extraReducers = plugins.get(HOOKS_EXTRA_REDUCERS)
    // 处理 onReducer hooks 的中间件
    const enhanceReducer = plugins.get(HOOKS_ONREDUCER)
    const allReducer = combineReducers({
      ...initialReducer,
      ...extraReducers
    })
    return enhanceReducer(allReducer)
  }
  return app
}

export default dva

export {
  dva,
  connect,
}