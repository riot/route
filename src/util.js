import { dashToCamelCase } from '@riotjs/util/strings'
import { isNil } from '@riotjs/util/checks'
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

export const getAttribute = (attributes, name, context) => {
  if (!attributes) return null

  const normalizedAttributes = attributes.flatMap((attr) =>
    isNil(attr.name)
      ? // add support for spread attributes https://github.com/riot/route/issues/178
        Object.entries(attr.evaluate(context)).map(([key, value]) => ({
          // evaluate each value of the spread attribute and store it in the array
          name: key,
          evaluate: () => value,
        }))
      : attr,
  )

  return normalizedAttributes.find((a) => dashToCamelCase(a.name) === name)
}

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

// True if the selector string is valid
export const isValidQuerySelectorString = (selector) =>
  /^([a-zA-Z0-9-_*#.:[\]\s>+~()='"]|\\.)+$/.test(selector)
