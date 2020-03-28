import { createContext } from 'react'
import { ContextValue } from './'
import { RouteState } from './types'

export const RouterContext = createContext<ContextValue>({} as RouteState)

export const {
  Consumer: RouterConsumer,
  Provider: RouterProvider
} = RouterContext

