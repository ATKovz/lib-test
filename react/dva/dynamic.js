import React from 'react'

const defaultLoadingComponent = props => <div>component is loading...</div>

/**
 * @param {Object} opts 
 * @param {Object} opts.app
 * @param {Function[] | Function} opts.models
 * @param {Function} opts.component
 * @param {Function} opts.loadingComponent
 */
export const dynamic = (opts) => {
  const { app, models, component } = opts
  return class DynamicComponent extends React.Component {
    constructor (props) {
      super(props)
      this.LoadingComponent = opts.loadingComponent || defaultLoadingComponent
      this.state = {
        AsyncComponent: null,
        mounted: false,
      }
      this.load()
    }

    state = {}

    async componentDidMount () {
      const AsyncComponent = await this.load()
      this.setState({
        AsyncComponent,
        mounted: true
      })
    }

    componentWillUnMount () {
      console.log('unmount');
    }

    // 加载模块，注册 model
    async load () {
      const result = await Promise.all([Promise.all(models()), component()])
      let [resolvedModels, AsyncComponent] = result
      // 取出 model 的默认导出
      resolvedModels = resolvedModels.map(model => model.default)
      AsyncComponent = AsyncComponent?.default
      // 注册 model
      resolvedModels.forEach(model => app.injectModel(model))

      return AsyncComponent
    }

    LoadingComponent = null

    render () {
      const { AsyncComponent, mounted } = this.state
      const { LoadingComponent } = this
      return (
        mounted
          ? <AsyncComponent {...this.props} />
          : <LoadingComponent />
      )
    }
  }
}

export default dynamic