import route, { router } from 'rawth'
import Route from './components/route-hoc.riot'
import Router from './components/router-hoc.riot'
import getCurrentRoute from './get-current-route'
import initDomListeners from './dom'
import setBase from './set-base'

export {
  getCurrentRoute,
  initDomListeners,
  setBase,
  router,
  route,
  Router,
  Route
}