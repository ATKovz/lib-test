import React from 'react'
import { LinkProps, RouteState } from './types'
import { RouterContext } from './context'

type IProps = LinkProps

export class Link extends React.Component<IProps> {
  static contextType = RouterContext
  handleChangeHash = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    const { to } = this.props
    const { history } = this.context as RouteState
    history?.push(to)
  }
  render () {
    return (
      <a href='/' onClick={this.handleChangeHash}>{this.props.children}</a>
    )
  }
}