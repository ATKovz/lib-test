const compose = (...fns) => (...args) => {
  let next = args
  for (let fn of fns) {
    if (Array.isArray(next)) {
      next = fn(...next)
    } else {
      next = fn(next)
    }
  }
  return next
}