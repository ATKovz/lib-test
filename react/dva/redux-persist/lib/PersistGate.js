import React from 'react'

/**
 * @typedef {{ initState: Function }} persistor
 * @typedef {{
 *  children: React.ReactElement,
 *  persistor: persistor
 * }} NavProps
 * @extends {React.Component<NavProps>}
 */
class PersistGate extends React.Component {

  constructor (props) {
    super(props)
  }
  componentDidMount () {
    this.props.persistor.initState()
  }

  render () {
    return this.props.children
  }
}

export default PersistGate

export {
  PersistGate
}