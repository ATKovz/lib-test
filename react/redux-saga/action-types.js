export const ACTION_TYPE = {
  TAKE: 'TAKE',
  PUT: 'PUT',
  CALL: 'CALL',
  DELAY: 'CALL',
}

// 这些 saga 方法本质就是返回一个对象，用于在 effectRunner 里面判断。

export const take = (pattern) => {
  return {
    type: ACTION_TYPE.TAKE,
    pattern
  }
}

export const put = (action) => {
  return {
    type: ACTION_TYPE.PUT, 
    action,
  }
}

export const call = (fn, ...args) => {
  return {
    type: ACTION_TYPE.DELAY,
    payload: {
      args,
      fn
    }
  }
}

const delayP = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export const delay = call.bind(null, delayP)