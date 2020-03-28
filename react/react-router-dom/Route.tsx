import React from 'react'
import { RouteProps, RouteState, Key, RouterComponentProps } from './types'
import { RouterContext } from './context'
import { pathToRegexp } from 'path-to-regexp'

type IProps = RouteProps

type IState = RouteProps

export class Route extends React.Component<IProps, IState> {
  static contextType = RouterContext

  render () {
    const {
      path = '/',
      component: RouteComponent,
      exact = false,
      render
    } = this.props
    const { location, history } = this.context as RouteState
    const currentPath = this.context.location.pathname as string
    const keys: Key[] = []

    const routeRule = pathToRegexp(path, keys, { end: exact })
    const isMatch = currentPath.match(routeRule)
    const params = {} as Record<string, any>

    if (isMatch) {
      const [url, ...values] = isMatch
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        params[key.name] = values[i]
      }
      const routeComponentProps: RouterComponentProps = {
        location,
        history,
        match: {
          isExact: exact,
          path: location.pathname,
          params,
          url,
        }
      }
      
      if (RouteComponent) {
        return <RouteComponent {...routeComponentProps} />
      } else if(render) {
        console.log('RENDER');
        return render(routeComponentProps)
      } else {
        return null
      }
    }
    return null
  }
}
