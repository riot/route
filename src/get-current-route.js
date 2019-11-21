import { router } from 'rawth'

export default function getCurrentRoute(currentRoute) {
  // listen the router route changes event
  router.on.value(r => currentRoute = r)

  return () => {
    return currentRoute
  }
}(null)