import route, { defaults, router } from 'rawth'
import Route from './components/route-hoc.riot'
import Router from './components/router-hoc.riot'
import initDomListeners from './dom'
export const setBase = base => {
  defaults.base = base
}

export {
  router,
  route,
  Router,
  Route,
  initDomListeners
}