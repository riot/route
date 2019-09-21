import route, { defaults, router } from 'rawth'
import initDomListeners from './dom'
import registerRiotComponents from './components'

export const setBase = base => {
  defaults.base = base
}

export { router, route, initDomListeners, registerRiotComponents }