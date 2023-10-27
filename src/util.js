import { dashToCamelCase } from '@riotjs/util/strings'
import { __ } from 'riot'

export const getGlobal = () => getWindow() || global
export const getWindow = () => (typeof window === 'undefined' ? null : window)
export const getDocument = () =>
  typeof document === 'undefined' ? null : document
export const getHistory = () =>
  typeof history === 'undefined' ? null : history
export const getLocation = () => {
  const win = getWindow()
  return win ? win.location : {}
}

export const defer = (() => {
  const globalScope = getGlobal()

  return globalScope.requestAnimationFrame || globalScope.setTimeout
})()

export const cancelDefer = (() => {
  const globalScope = getGlobal()

  return globalScope.cancelAnimationFrame || globalScope.clearTimeout
})()

export const getAttribute = (attributes, name) =>
  attributes && attributes.find((a) => dashToCamelCase(a.name) === name)

export const createDefaultSlot = (attributes = []) => {
  const { template, bindingTypes, expressionTypes } = __.DOMBindings

  return template(null, [
    {
      type: bindingTypes.SLOT,
      name: 'default',
      attributes: attributes.map((attr) => ({
        ...attr,
        type: expressionTypes.ATTRIBUTE,
      })),
    },
  ])
}
