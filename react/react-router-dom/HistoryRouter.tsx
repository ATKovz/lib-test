import React from 'react';
import { History } from './History';
import { RouterProvider } from './context';
import { ContextValue, RouteState } from './types';
import { getPathName } from './utils';
interface P {
}

declare global {
  interface Window {
    onpushstate: (state: any, title: string, pathname: string) => void
  }
}

export class HistoryRouter extends React.Component<P, RouteState> {
  state = {
    location: {
      // window.location.hash = '#/xxxx'
      pathname: getPathName(),
      search: window.location.search,
    },
    history: new History(),
  };
  componentDidMount() {
    window.onpopstate = (event: PopStateEvent) => {
      this.setState({
        location: {
          ...this.state.location,
          pathname: window.location.pathname,
          state: event.state
        }
      })
    }
    window.onpushstate = (state, title, pathname) => {
      this.setState({
        location: {
          ...this.state.location,
          pathname,
          state,
        }
      })
    }
    this.setState({
      location: {
        ...this.state.location,
        pathname: window.location.pathname
      }
    })
  }
  render() {
    const { location, history, } = this.state;
    const { children } = this.props;
    const ctxValue: ContextValue = {
      location,
      history,
    };
    return <RouterProvider value={ctxValue}>
      {children}
    </RouterProvider>;
  }
}
