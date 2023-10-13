import route, {
  createURLStreamPipe,
  match,
  router,
  toPath,
  toRegexp,
  toURL,
} from 'rawth'
import Route from './components/route-hoc.riot'
import Router from './components/router-hoc.riot'
import getCurrentRoute from './get-current-route.js'
import initDomListeners from './dom.js'
import setBase from './set-base.js'

export {
  route,
  createURLStreamPipe,
  match,
  router,
  toPath,
  toRegexp,
  toURL,
  getCurrentRoute,
  initDomListeners,
  setBase,
  Router,
  Route,
}
