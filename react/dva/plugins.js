export const HOOKS_ONEFFECT = 'onEffect'
export const HOOKS_EXTRA_REDUCERS = 'extraReducers'
export const HOOKS_ONREDUCER = 'onReducer'
export const HOOKS_ONACTION = 'onAction'
export const HOOKS_ONSTATE_CHANGE = 'onStateChange'
export const HOOKS_EXTRA_ENHANCERS = 'extraEnhancers'
export const HOOKS_ONERROR = 'onError'

const hooksMap = [
  HOOKS_ONEFFECT,
  HOOKS_EXTRA_REDUCERS,
  HOOKS_ONREDUCER,
  HOOKS_ONACTION,
  HOOKS_ONSTATE_CHANGE,
  HOOKS_EXTRA_ENHANCERS,
  HOOKS_ONERROR
]

/**
 * 筛选 dva-opts 里的 hooks
 * @param {Object} opts 
 */
const filterHooks = opts => (
  Object.keys(opts).reduce((memo, key) => {
    if (hooksMap.indexOf(key) !== -1) {
      memo[key] = opts[key]
    }
    return memo
  }, {})
)

const getExtraReducers = (reducers = []) => (
  reducers.reduce((memo, reducer) => (
    {
      ...memo,
      ...reducer
    }
  ), {})
)

const getOnReducer = (hooks) => {
  return reducer => {
    for (const hook of hooks) {
      reducer = hook(reducer)
    }
    return reducer
  }
}

export class Plugin {
  constructor () {
    // this.hooks = { onEffects: [], extraReducer: [] }
    this.hooks = hooksMap.reduce((memo, key) => {
      return ((memo[key] = []) && memo)
    }, {})
  }

  hooks = []
  
  use (plugins) {
    Object.keys(plugins).forEach(key => {
      if (key === HOOKS_EXTRA_ENHANCERS) {
        // 因为这个参数就是 Array 形式的，所以不用 push
        this.hooks[key] = plugins[key]
      } else {
        this.hooks[key].push(plugins[key])
      }
    })
  }

  /**
   * @param {Enumerator} type 
   */
  get (type) {
    switch (type) {
      case HOOKS_EXTRA_REDUCERS:
        {
          // 由于  extraReducers 是一个数组，数组里放 k-v 形式的 reducers，所以做个处理把所有的合并
          return getExtraReducers(this.hooks[HOOKS_EXTRA_REDUCERS])
        }
      case HOOKS_ONREDUCER:
        {
          return getOnReducer(this.hooks[type])
        }
      default:
        return this.hooks[type]
    }
  }
}

export default Plugin