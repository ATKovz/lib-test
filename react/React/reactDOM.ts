import { ReactElement, createElement } from "./react";
import { FC, ComponentType } from './types'

const isValidReactElement = (element: any): element is ReactElement => !!element.type

const isValidClassComponent = (Component: any): Component is ComponentType => Component.isClassComponent

const isValidComponent = (Component: any): Component is FC => (typeof Component === 'function')

export const render = (element: ReactElement, HTMLelement: HTMLElement | null): void => {

	if (typeof element === 'string') {
		console.log('is string', element, HTMLelement);
		HTMLelement?.appendChild(document.createTextNode(element))
		return
	}
	
	let { type, props } = element
	let domElement: HTMLElement
	if(isValidClassComponent(type)) {
		element = (new type(props)).render()
	} else if (isValidComponent(type)) {
		let renderComponent = type
		element = renderComponent(props)
	}
		type = element.type
		props = element.props
		domElement = document.createElement(type as string)
	
	for (let propName in props) {
		if (propName === 'style') {
			const cssText = Object.entries(props.style || []).map(([key, value]) => (
				`${key.replace(/([A-Z])/g, (...target) => {
					return `-${target[1].toLocaleLowerCase()}`
				})}:${value}`
			)).join(';')
			domElement.style.cssText = cssText
			continue
		}

		if (propName === 'className') {
			domElement.className = props[propName]
			continue
		}

		if (propName === 'children') {
			props.children.forEach((childElement: ReactElement) => {
				render(childElement, domElement)
			})
			continue
		}
		domElement.setAttribute(propName, props[propName])
	}
	HTMLelement?.appendChild(domElement)
}

export default render