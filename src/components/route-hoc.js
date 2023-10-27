import { PATH_ATTRIBUTE } from '../constants.js'
import {
  route,
  toRegexp,
  match,
  router,
  createURLStreamPipe,
} from '../index.js'
import getCurrentRoute from '../get-current-route.js'
import { get as getAttr } from 'bianco.attr'
import { createDefaultSlot, getAttribute } from '../util.js'
import compose from 'cumpa'

const getInitialRouteValue = (pathToRegexp, path, options) => {
  const route = compose(
    ...createURLStreamPipe(pathToRegexp, options).reverse(),
  )(path)

  return route.params ? route : null
}

const clearDOMBetweenNodes = (first, last, includeBoundaries) => {
  const clear = (node) => {
    if (!node || (node === last && !includeBoundaries)) return
    const { nextSibling } = node
    node.remove()
    clear(nextSibling)
  }

  clear(includeBoundaries ? first : first.nextSibling)
}

export const routeHoc = ({ slots, attributes }) => {
  return {
    mount(el, context) {
      // create the component state
      const currentRoute = getCurrentRoute()
      const path =
        getAttribute(attributes, PATH_ATTRIBUTE) || getAttr(el, PATH_ATTRIBUTE)
      const pathToRegexp = toRegexp(path, [])
      const state = {
        pathToRegexp,
        route:
          currentRoute && match(currentRoute, pathToRegexp)
            ? getInitialRouteValue(pathToRegexp, currentRoute, {})
            : null,
      }
      this.el = el
      this.slot = createDefaultSlot([
        {
          isBoolean: false,
          name: 'route',
          evaluate: () => this.state.route,
        },
      ])
      this.context = context
      this.state = state
      // set the route listeners
      this.boundOnBeforeRoute = this.onBeforeRoute.bind(this)
      this.boundOnRoute = this.onRoute.bind(this)
      router.on.value(this.boundOnBeforeRoute)
      this.stream = route(path).on.value(this.boundOnRoute)
      // update the DOM
      this.beforePlaceholder = document.createTextNode('')
      this.afterPlaceholder = document.createTextNode('')
      el.replaceWith(this.beforePlaceholder)
      this.beforePlaceholder.parentNode.insertBefore(
        this.afterPlaceholder,
        this.beforePlaceholder.nextSibling,
      )
    },
    update(context) {
      this.context = context
      if (this.state.route) this.slot.update({}, context)
    },
    mountSlot(context) {
      this.beforePlaceholder.parentNode.insertBefore(
        this.el,
        this.beforePlaceholder.nextSibling,
      )
      this.slot.mount(
        this.el,
        {
          slots,
        },
        context,
      )
    },
    clearDOM(includeBoundaries) {
      clearDOMBetweenNodes(
        this.beforePlaceholder,
        this.afterPlaceholder,
        includeBoundaries,
      )
    },
    unmount() {
      router.off.value(this.boundOnBeforeRoute)
      this.slot.unmount({}, this.context, true)
      this.clearDOM(true)
      this.stream.end()
    },
    onBeforeRoute(path) {
      if (this.state.route && !match(path, this.state.pathToRegexp)) {
        this.callLifecycleProperty('onBeforeUnmount', route)
        this.slot.unmount({}, this.context, true)
        this.clearDOM(false)
        this.state.route = null
        this.callLifecycleProperty('onUnmounted', route)
      }
    },
    onRoute(route) {
      this.callLifecycleProperty('onBeforeMount', route)
      this.state.route = route
      this.mountSlot(this.context)
      this.callLifecycleProperty('onMounted', route)
    },
    callLifecycleProperty(method, ...params) {
      const attr = getAttribute(attributes, method)
      if (attr) attr(...params)
    },
  }
}
