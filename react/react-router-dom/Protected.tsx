import React from 'react'
import { RouterContext } from './context'
import { RouteProps, RouterComponentProps } from './types'
import { Route, Redirect } from '.'

export class Protected extends React.Component<RouteProps> {
  static contextType = RouterContext

  render () {
    const { path, component: RouteComponent } = this.props
    return <Route
            path={path}
            render={(renderProps: RouterComponentProps) => {
              return localStorage.getItem('login')
                      ? RouteComponent
                          ? <RouteComponent {...renderProps} />
                          : null
                      : <Redirect to={{ pathname: '/', state: { from: this.props.path } }}  />
            }}
          />
  }
}