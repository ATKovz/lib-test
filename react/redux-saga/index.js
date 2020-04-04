import { ACTION_TYPE } from './action-types'
import Event from 'events'

const e = new Event()
const effectRunner = function (g, dispatch) {
  // 和 co 库一样的实现
    const next = (action) => {
      // 这里的 value 就是 effect 方法里返回的对象
      const { value, done } = g.next(action)
      if (!done) {
        switch(value.type) {
          case ACTION_TYPE.TAKE:
            // take 用于给 event 添加监听事件
            e.once(value.pattern, next)
            break
          case ACTION_TYPE.PUT:
            dispatch(value.action)
            next()
            break
          case ACTION_TYPE.DELAY:
            {
              const { fn, args } = value.payload
              fn.apply(this, args).then(next)
            }
          default:
            console.log(value, 'args');
            break
        }
      }
    }
    next()
}

/**
 * reatesaga 就是给 dispatch 添加一个 emit 触发元
 * 所以本质上只是对于 generator 的利用， 并没有过多复杂的内容
 * saga 的核心就是基于发布订阅模式的 take 方法
 */

export const createSaga = function () {
  const sagaMiddleWare = ({ dispatch, getState }) => (
    next => action => {
      e.emit(action.type, action)
      return next(action)
    }   
  )
  // run 就是 添加了 sagaEffect 判断的 co 库
  sagaMiddleWare.run = (saga) => {
    effectRunner(saga())
  }
  return sagaMiddleWare
}