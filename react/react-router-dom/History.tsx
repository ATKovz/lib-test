import { LocationDescription, Message, History as HistoryInterface } from './'
export * from './types'

const isString = (location: unknown): location is string => typeof location === 'string'

export class History implements HistoryInterface {
  state: any = null
  message: Message = null
  push = (location: LocationDescription) => {
    const pathname = isString(location)
                          ? location
                          : location.pathname
    const state = isString(location)
                      ? null
                      : location.state
    if (this.message) {
      let allowSkip = window.confirm(this.message(location))
      if (!allowSkip) {
        return
      }
    }
    this.state = state
    console.log('WINDOW', window);
    window.history.pushState(state, '',  pathname)
    // window.location.hash = `#${newLocation}`
  }

  block = (message: Message) => {
    this.message = message
  }
}