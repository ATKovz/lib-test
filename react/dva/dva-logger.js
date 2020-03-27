export const logger = ({ dispatch, getState }) => next => {
  return (action) => {
    next(action)
  }
}

export default logger