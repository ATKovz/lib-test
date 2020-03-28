import React from 'react';
import { History } from './History';
import { RouterProvider } from './context';
import { ContextValue, RouteState } from './types';
import { getPathName } from './utils';
interface P {
}
export class HashRouter extends React.Component<P, RouteState> {
  state = {
    location: {
      // window.location.hash = '#/xxxx'
      pathname: getPathName(),
      search: window.location.search,
      hash: window.location.hash
    },
    history: new History(),
  };
  componentDidMount() {
    window.addEventListener('hashchange', (event: HashChangeEvent) => {
      this.setState({
        location: {
          ...this.state.location,
          pathname: getPathName() || '/',
        }
      });
    });
    window.location.hash = window.location.hash || '/';
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
