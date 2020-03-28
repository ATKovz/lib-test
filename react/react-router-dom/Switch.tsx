import React from 'react'
import { RouteState, Key } from './types'
import { RouterContext } from './context'
import { pathToRegexp } from 'path-to-regexp'

interface IProps {
  children: Array<React.ReactElement>
}

export class Switch extends React.Component<IProps> {
  static contextType = RouterContext
  renderChildren = (): JSX.Element | null => {
    const children = Array.isArray(this.props.children) ? this.props.children : [this.props.children]
    const { location, history } = this.context as RouteState
    const { pathname } = location
    const keys: Key[] = []
    if (children) {

      for (let i = 0; i <= children.length; i++)  {
        const child = children[i]
        const { exact, path, component: Component } = child.props
        const result = pathname.match(pathToRegexp(path, keys, { end: !!exact }))
        
        if (result) {
          const [url, ...values] = result

          const params = values.reduce((acc, value, index) => {
            const key = keys[index].name
            acc[key] = value
            return acc
          }, {} as Record<string, any>)
          
          const routeComponentProps: RouteState = {
            location,
            history,
            match: {
              params,
              url,
              path,
              isExact: !!exact,
            }
          }
          
          return <Component  {...routeComponentProps} />
        }
      }
    }
    return null
  }

  render () {
    return this.renderChildren()
  }
}
