export const hasString = (target, str) => !(target.indexOf(str) === -1)

export const compose = (...args) => (params) => args.reduce((memo, curr) => curr(memo), params)