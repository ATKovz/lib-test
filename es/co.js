/**
 * 简易 co 库
 * @param {GeneratorFunction} g 
 */
const co = function (g) {
  const it = g()
  return new Promise((resolve, reject) => {
    const next = (data) => {
      const { done, value } = it.next(data)
      if (done) {
        resolve(value)
      } else {
        Promise.resolve(value).then(data => {
          next(data)
        }).catch(err => {
          reject(err)
        })
      }
    }
    next()
  })
}