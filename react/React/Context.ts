import React, { ReactElement, useEffect, useState, Component } from 'react'

interface Provider<T> {
  (props: {
    children: ReactElement,
    value: T
  }): ReactElement
  value: T
}

interface Consumer<T> {
  (props: { children: (value: T) => ReactElement }): ReactElement
}

interface ContextProps<T> {
  Provider: Provider<T>,
  Consumer: Consumer<T>
}

export const createContext = <T>(initValue: any = null): ContextProps<T> => {
  const Provider: Provider<T> = (props: { children: ReactElement, value: T }) => {
    const [store, setStore] = useState(null)
    const {
      children,
      value = initValue,
    } = props

    useEffect(() => {
      Provider.value = value
      setStore(value)
    }, [value])


    Provider.value = value
    return children
  }
  Provider.value = {} as T

  const Consumer: Consumer<T> = ({ children }) => {
    useEffect(() => {
      console.log(Provider.value, 'change');
    }, [Provider.value])
    return children(Provider.value)
  }
  return {
    Provider,
    Consumer,
  }
}