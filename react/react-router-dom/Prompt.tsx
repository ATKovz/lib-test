import React from 'react'
import { PromptProps, RouteState, Message } from './types'
import { RouterContext } from './'

type IProps = PromptProps

export class Prompt extends React.Component<IProps> {
  static contextType = RouterContext

  prompt = () => {
    const { message, when } = this.props
    const { history } = this.context as RouteState
    console.log(when, message);
    if (when) {
      // 在 push 之前通过 block 方法来设置 message, 然后在 push 里做弹框判断
      history.block(message)
    } else {
      history.block(null)
    }
  }

  render () {
    this.prompt()    
    return null
  }
}