import { ReactElement, ElementProp, FC } from './types'

/**
 * 自己手撸一个伪virtual node
 * @param {string} type react element's type
 * @param {object} config config object
 * @param {array} children children elements
 */
export const createElement = (type: ReactElement['type'], config: Record<string, any>, ...children: Array<ReactElement | string>): ReactElement => {
    let propName: string,
        props: ElementProp = {} as any

    for (propName in config) {
        props[propName] = config[propName]
    }

    props.children = children

    let element: ReactElement = {
        type,
        props,
        children,
        key: props.key || null,
    }

    return element
}

export class Component<P = any>{
    static isClassComponent = true
    props: P
    constructor(props: P) {
        this.props = props
    }
    render(): ReactElement {
        return createElement('div', {}, 'asd')
    }
}

export * from './types'