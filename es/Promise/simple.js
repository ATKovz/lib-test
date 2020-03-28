const STATUS = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECT: 'rejected'
}

function Promises (exec) {
  let status = STATUS.PENDING
  let value = null
  let error = null
  let resolveCb = []
  let rejectedCb = []
  let finallyFn = null
  try {
    exec(resolve, rejected)
  } catch (err) {
    rejected(err)
  }
  function resolve (arg) {
    if (status === STATUS.PENDING) {
      value = arg
      status = STATUS.RESOLVED
      for (let fn of resolveCb) {
        value = fn(value)
      }
      console.log(finallyFn);
      finallyFn && finallyFn()
    }
  }
  function rejected (err) {
    if (status === STATUS.PENDING) {
      error = err
      status = STATUS.RESOLVED
      for (let fn of rejectedCb) {
        fn(err)
      }
      console.log(finallyFn);
    }
    finallyFn && finallyFn()
    return this
  }

  this.finally = (fn) => {
    console.log('fi');
    finallyFn = fn
  }
 
  // 同步直接触发，异步用发布-订阅模式实现
  this.then = (onFullfill, onRejected) => {
    if (status === STATUS.RESOLVED) {
      onFullfill(value)
    }
    if (status === STATUS.REJECT) {
      onRejected(error)
    }
    if (status === STATUS.PENDING) {
      onFullfill && resolveCb.push(onFullfill)
      onRejected && rejectedCb.push(onRejected)
    }
    return this
  }

  this.catch = (error) => {
    if (status === STATUS.REJECT) {
      error()
    }
    if (status === STATUS.PENDING) {
      error && rejectedCb.push(error)
    }
    return this
  }
}
