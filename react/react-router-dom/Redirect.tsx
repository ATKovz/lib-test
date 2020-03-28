import React from 'react'
import { RouterContext } from './context'
import { RouteState, RedirectProps } from './types'

type IProps = RedirectProps

export class Redirect extends React.Component<IProps> {
  static contextType = RouterContext
  componentDidMount () {
    console.log('mounted');
    const { to } = this.props
    const { history } = this.context as RouteState
    history?.push(to)
  }
  render () {
    return null
  }
}