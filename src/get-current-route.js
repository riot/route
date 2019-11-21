import { router } from 'rawth'

export default function getCurrentRoute(currentRoute) {
  // listen the route changes events to store the current route
  router.on.value(r => currentRoute = r)

  return () => {
    return currentRoute
  }
}(null)