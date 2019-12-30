import Route from './components/route-hoc.riot'
import Router from './components/router-hoc.riot'
import getCurrentRoute from './get-current-route'
import initDomListeners from './dom'
import setBase from './set-base'

export * from 'rawth'

export {
  getCurrentRoute,
  initDomListeners,
  setBase,
  Router,
  Route
}

export { default as route } from 'rawth' // eslint-disable-line