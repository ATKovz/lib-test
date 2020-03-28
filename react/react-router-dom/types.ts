type LocationState = any
type Pathname = string
type Hash = string
type Search = string
type LocationKey = string

export interface Location<S = LocationState> {
  pathname: Pathname
  search?: Search
  hash?: Hash
  state?: S
  key?: LocationKey
}

export interface History {
  state: any
  message?: Message
  push: (location: LocationDescription) => void
  block: (message: Message) => void
}

export interface Match<Params extends { [K in keyof Params]?: string } = {}> {
  params: Params;
  isExact: boolean;
  path: string;
  url: string;
}

export type ContextValue = RouteState | object

export interface RouteProps {
  path?: string | RegExp,
  component?: React.FC<any> | React.ComponentClass<any>
  render?: (routeProps: RouterComponentProps) => (React.ReactElement | null)
  exact?: boolean
}

export interface RouteState<T = any> {
  location: Location,
  history: History
  match?: Match<T>
}

export interface Key {
  name: string | number;
  prefix: string;
  suffix: string;
  pattern: string;
  modifier: string;
}

export type LocationDescription = string | Location

export interface LinkProps {
  to: LocationDescription,
}

export interface RedirectProps {
  to: LocationDescription
  push?: boolean
  from?: string
  path?: string
  exact?: boolean
  strict?: boolean
}

export type RouterComponentProps<T = Record<string, any>> = RouteState<T>

export type Message = ((location: LocationDescription) => string) | null

export interface PromptProps {
  when: boolean,
  message: Message
}