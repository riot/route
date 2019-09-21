import route, { defaults, router } from 'rawth'
import initDomListeners from './dom'

export const setBase = base => {
  defaults.base = base
}

export { router, route, initDomListeners }