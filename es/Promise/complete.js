// 完整的 promise

const PENDING = 'pending'
const FULLFILL = 'resolve'
const REJECT = 'reject'

const Promises = function(fn) {
    this.status = PENDING
    this.stack = null
    this.errorStack = null
    this.resStack = []
    this.rejStack = []
    this.resolve = (stack) => {
        if(this.status === PENDING) {
            this.status = FULLFILL
            this.stack = stack
        }
    }

    this.finally = function (cb) {
      return this.then((value) => {
          return Promise.resolve(cb()).then(res => value)
      }, (err) => {
          // Promise.resolve 如果接受的参数是一个promise，那会等待他执行完毕再走then，这里就是用来防异步的
          // co 库也是利用这一点写出来的
          return Promise.resolve(cb()).then(err => { throw err })
      })
  } 
    this.reject = (stack) => {
        if(this.status === PENDING) {
            this.status = REJECT
            this.errorStack = stack
        }
    }

    const onReject = (val) => {
        const fn = this.rejStack.pop()
        if (!fn) {
            throw new Error('未捕获错误')
        }
        fn(val)
    }

    const onFullfilled = (val) => {
        const fn = this.resStack.pop()
        fn(val)
    }

    this.then = (resFn, rejFn) => {
        let promise 
        promise = new Promises((res, rej) => {
            if (this.status === FULLFILL) {
                try {
                    this.resStack.push(resFn)
                    new Promises((resolve) => {
                        onFullfilled(this.stack)
                    })
                } catch (e) {
                    onReject(e)
                }
            }
            if (this.status === REJECT) {
                try {
                    let fn = this.rejStack.pop()
                    onFullfilled(fn(this.errorStack))
                } catch (e) {
                    onReject(e)
                }
            }
            if (this.status === PENDING) {
                this.resStack.push(() => {
                    resFn(this.stack)
                })
                this.resStack.push(() => {
                    onReject(this.errorStack)
                })
            }
        })
        return promise.resolve(this.stack)
    }

    this.catch = (fn) => {
        if(this.status === PENDING) {
            this.rejStack.push(() => fn(this.errorStack))
        }
        if (this.status === REJECT) {
            fn(this.errorStack)
        }
    }
    fn(this.resolve, this.reject)
}

Promises.race = function (promises) {
  return new Promise((resolve, reject) => {
      if (Array.isArray(promises)) {
          promises.forEach(promise => {
              if (isPromise(promise)) {
                  promise.then(resolve, reject)
              }
              resolve(promise)
          })
      }
  }) 
}

Promises.wrap = function (fn) {
  let abort
  const tempPromise = new Promise((_, reject) => {
      abort = reject
  })

  const newPromise = Promise.race([tempPromise, fn])
  newPromise.abort = abort
  return newPromise
}
