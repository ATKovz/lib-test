import React from 'react'
import { Route } from '.'
import { RouterComponentProps } from './types'

export const withRouter = <P extends {}>(OriginComponent: React.ComponentType<P>): React.ComponentType<P> => {
  console.log('WITH');
  return (props: P) => {
    return <Route render={(routeProps: RouterComponentProps) => <OriginComponent {...props} {...routeProps} />} />
  }
}