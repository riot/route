import route, { defaults, router } from 'rawth'
import Route from './components/route-hoc.riot'
import Router from './components/router-hoc.riot'
import initDomListeners from './dom'
import register from './components'

export const setBase = base => {
  defaults.base = base
}

export {
  router,
  route,
  initDomListeners,
  register,
  Route,
  Router
}