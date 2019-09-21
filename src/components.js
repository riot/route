import Route from './components/route-hoc.riot'
import Router from './components/router-hoc.riot'
import {register} from 'riot'

export default function() {
  register('router', Router)
  register('route', Route)
}