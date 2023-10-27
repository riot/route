import { router } from '../index.js'
import { defer, cancelDefer, getAttribute, createDefaultSlot } from '../util.js'
import getCurrentRoute from '../get-current-route.js'
import setBase from '../set-base.js'
import { panic } from '@riotjs/util/misc'
import initDomListeners from '../dom.js'

const BASE_ATTRIBUTE_NAME = 'base'
const INITIAL_ROUTE = 'initialRoute'
const ON_STARTED_ATTRIBUTE_NAME = 'onStarted'

export const routerHoc = ({ slots, attributes, props }) => {
  if (routerHoc.wasInitialized)
    panic('Multiple <router> components are not supported')

  return {
    slot: null,
    el: null,
    teardown: null,
    mount(el, context) {
      const initialRouteAttr = getAttribute(attributes, INITIAL_ROUTE)
      const initialRoute = initialRouteAttr
        ? initialRouteAttr.evaluate(context)
        : null
      const currentRoute = getCurrentRoute()
      const onFirstRoute = () => {
        this.createSlot(context)
        router.off.value(onFirstRoute)
      }
      routerHoc.wasInitialized = true

      this.el = el
      this.teardown = initDomListeners(this.root)

      this.setBase(context)

      // mount the slots only if the current route was defined
      if (currentRoute && !initialRoute) {
        this.createSlot(context)
      } else {
        router.on.value(onFirstRoute)
        router.push(initialRoute || window.location.href)
      }
    },
    createSlot(context) {
      if (!slots || !slots.length) return
      const onStartedAttr = getAttribute(attributes, ON_STARTED_ATTRIBUTE_NAME)

      this.slot = createDefaultSlot()

      this.slot.mount(
        this.el,
        {
          slots,
        },
        context,
      )

      if (onStartedAttr) {
        onStartedAttr.evaluate(context)(getCurrentRoute())
      }
    },
    update(context) {
      this.setBase(context)

      // defer the updates to avoid internal recursive update calls
      // see https://github.com/riot/route/issues/148
      if (this.slot) {
        cancelDefer(this.deferred)

        this.deferred = defer(() => {
          this.slot.update({}, context)
        })
      }
    },
    unmount(...args) {
      this.teardown()
      routerHoc.wasInitialized = false

      if (this.slot) {
        this.slot.unmount(...args)
      }
    },
    getBase(context) {
      const baseAttr = getAttribute(attributes, BASE_ATTRIBUTE_NAME)

      return baseAttr
        ? baseAttr.evaluate(context)
        : this.el.getAttribute(BASE_ATTRIBUTE_NAME) || '/'
    },
    setBase(context) {
      setBase(props ? props.base : this.getBase(context))
    },
  }
}

// flag to avoid multiple router instances
routerHoc.wasInitialized = false
