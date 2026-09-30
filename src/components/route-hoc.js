import { PATH_ATTRIBUTE } from '../constants.js'
import {
  route,
  toRegexp,
  match,
  router,
  createURLStreamPipe,
} from '../index.js'
import $ from 'bianco.query'
import getCurrentRoute from '../get-current-route.js'
import { get as getAttr } from 'bianco.attr'
import { once, remove } from 'bianco.events'
import { noop } from '@riotjs/util/functions'
import {
  createDefaultSlot,
  getAttribute,
  isValidQuerySelectorString,
} from '../util.js'
import compose from 'cumpa'

const getInitialRouteValue = (pathToRegexp, path, options) => {
  const route = compose(
    ...createURLStreamPipe(pathToRegexp, options).reverse(),
  )(path)

  return route.params ? route : null
}

// at most one fragment scroll is pending: a newer navigation cancels it
const [scrollToHash, cancelScroll] = ((cancelPending) => [
  (hash) => {
    const scroll = () => $(hash)?.[0]?.scrollIntoView()
    // skip the retry if it was cancelled or replaced in the meantime
    const retry = () =>
      Promise.resolve(document.fonts?.ready).then(
        () => cancelPending === cancel && scroll(),
      )
    const cancel = () => {
      remove(window, 'load', retry)
      cancelPending = noop
    }
    cancelPending()
    // scrolling forces a layout, which also starts loading the route's fonts
    scroll()
    if (
      document.readyState === 'complete' &&
      document.fonts?.status !== 'loading'
    )
      return
    cancelPending = cancel
    // loaded already, so only the route's own fonts are still pending
    if (document.readyState === 'complete') retry()
    else once(window, 'load', retry)
  },
  () => cancelPending(),
])(noop)

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
  const placeholders = {
    before: document.createTextNode(''),
    after: document.createTextNode(''),
  }

  return {
    mount(el, context) {
      // create the component state
      const currentRoute = getCurrentRoute()
      const path =
        getAttribute(attributes, PATH_ATTRIBUTE, context)?.evaluate(context) ||
        getAttr(el, PATH_ATTRIBUTE)
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
      el.replaceWith(placeholders.before)
      placeholders.before.parentNode.insertBefore(
        placeholders.after,
        placeholders.before.nextSibling,
      )
      if (state.route) this.mountSlot()
    },
    update(context) {
      this.context = context
      if (this.state.route) this.slot.update({}, context)
    },
    mountSlot() {
      const { route } = this.state
      // insert the route root element after the before placeholder
      placeholders.before.parentNode.insertBefore(
        this.el,
        placeholders.before.nextSibling,
      )
      this.callLifecycleProperty('onBeforeMount', route)
      this.slot.mount(
        this.el,
        {
          slots,
        },
        this.context,
      )
      this.callLifecycleProperty('onMounted', route)
    },
    clearDOM(includeBoundaries) {
      // remove all the DOM nodes between the placeholders
      clearDOMBetweenNodes(
        placeholders.before,
        placeholders.after,
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
      // any navigation supersedes a pending fragment scroll
      cancelScroll()
      const { route } = this.state
      // this component was not mounted or the current path matches
      // we don't need to unmount this component
      if (!route || match(path, this.state.pathToRegexp)) return

      this.callLifecycleProperty('onBeforeUnmount', route)
      this.slot.unmount({}, this.context, true)
      this.clearDOM(false)
      this.state.route = null
      this.callLifecycleProperty('onUnmounted', route)
    },
    onRoute(route) {
      const prevRoute = this.state.route
      this.state.route = route

      // if this route component was already mounted we need to update it
      if (prevRoute) {
        this.callLifecycleProperty('onBeforeUpdate', route)
        this.slot.update({}, this.context)
        this.callLifecycleProperty('onUpdated', route)
      }
      // this route component was never mounted, so we need to create its DOM
      else this.mountSlot()

      // emulate the default browser anchor links behaviour
      if (route.hash && isValidQuerySelectorString(route.hash))
        scrollToHash(route.hash)
    },
    callLifecycleProperty(method, ...params) {
      const attr = getAttribute(attributes, method, this.context)

      if (attr) attr.evaluate(this.context)(...params)
    },
  }
}
