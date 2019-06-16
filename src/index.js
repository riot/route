/**
 * Simple client-side router
 * @module @riotjs/route
 */

import observable from '@riotjs/observable'

const RE_ORIGIN = /^.+?\/\/+[^/]+/,
  EVENT_LISTENER = 'EventListener',
  REMOVE_EVENT_LISTENER = `remove${EVENT_LISTENER}`,
  ADD_EVENT_LISTENER = `add${EVENT_LISTENER}`,
  HAS_ATTRIBUTE = 'hasAttribute',
  POPSTATE = 'popstate',
  HASHCHANGE = 'hashchange',
  TRIGGER = 'trigger',
  MAX_EMIT_STACK_LEVEL = 3,
  win = typeof window != 'undefined' && window,
  doc = typeof document != 'undefined' && document,
  hist = win && history,
  loc = win && (hist.location || win.location), // see html5-history-api
  prot = Router.prototype, // to minify more
  clickEvent = doc && doc.ontouchstart ? 'touchstart' : 'click',
  central = observable()

/**
 * Default parser. You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @returns {Array} array
 */
function DEFAULT_PARSER(path) {
  return path.split(/[/?#]/)
}

/**
 * Default parser (second). You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @param {string} filter - filter string (normalized)
 * @returns {Array} array
 */
function DEFAULT_SECOND_PARSER(path, filter) {
  const f = filter
    .replace(/\?/g, '\\?')
    .replace(/\*/g, '([^/?#]+?)')
    .replace(/\.\./, '.*')
  const re = new RegExp(`^${f}$`)
  const args = path.match(re)

  if (args) return args.slice(1)
}

/**
 * Simple/cheap debounce implementation
 * @param   {Function} fn - callback
 * @param   {number} delay - delay in seconds
 * @param   {number} t - timer id
 * @returns {Function} debounced function
 */
function debounce(fn, delay, t) {
  return function() {
    clearTimeout(t)
    t = setTimeout(fn, delay)
  }
}

/**
 * Set the window listeners to trigger the routes
 * @param {boolean} autoExec - see route.start
 * @returns {undefined}
 */
function start(autoExec) {
  route._.debouncedEmit = debounce(emit, 1)
  win[ADD_EVENT_LISTENER](POPSTATE, route._.debouncedEmit)
  win[ADD_EVENT_LISTENER](HASHCHANGE, route._.debouncedEmit)
  doc[ADD_EVENT_LISTENER](clickEvent, click)

  if (autoExec) emit(true)
}

/**
 * Router class
 * @returns {undefined}
 */
function Router() {
  this.$ = []
  observable(this) // make it observable
  central.on('stop', this.s.bind(this))
  central.on('emit', this.e.bind(this))
}

function normalize(path) {
  return path.replace(/^\/|\/$/, '')
}

function isString(str) {
  return typeof str == 'string'
}

/**
 * Get the part after domain name
 * @param {string} href - fullpath
 * @returns {string} path from root
 */
function getPathFromRoot(href) {
  return (href || loc.href).replace(RE_ORIGIN, '')
}

/**
 * Get the part after base
 * @param {string} href - fullpath
 * @returns {string} path from base
 */
function getPathFromBase(href) {
  const base = route._.base
  return base[0] === '#'
    ? (href || loc.href || '').split(base)[1] || ''
    : (loc ? getPathFromRoot(href) : href || '').replace(base, '')
}

function discardEmitStack(stack, first) {
  if (first) {
    first()
    discardEmitStack(stack, stack.shift())
  }
}

function emit(force) {
  // the stack is needed for redirections
  const isRoot = route._.emitStackLevel === 0
  if (MAX_EMIT_STACK_LEVEL <= route._.emitStackLevel) return

  route._.emitStackLevel++
  route._.emitStack.push(function() {
    const path = getPathFromBase()
    if (force || path !== route._.current) {
      central[TRIGGER]('emit', path)
      route._.current = path
    }
  })

  if (isRoot) {
    discardEmitStack(route._.emitStack, route._.emitStack.shift())
    route._.emitStackLevel = 0
  }
}

function findLink(el) {
  if (el.nodeName === 'A') return el
  findLink(el.parentNode)
}

function click(e) {
  if (
    e.which !== 1 // not left click
    || e.metaKey || e.ctrlKey || e.shiftKey // or meta keys
    || e.defaultPrevented // or default prevented
  ) return

  const el = findLink(e.target)

  if (
    !el || el.nodeName !== 'A' // not A tag
    || el[HAS_ATTRIBUTE]('download') // has download attr
    || !el[HAS_ATTRIBUTE]('href') // has no href attr
    || el.target && el.target !== '_self' // another window or frame
    || el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) === -1 // cross origin
  ) return

  const base = route._.base

  if (el.href !== loc.href
    && (
      el.href.split('#')[0] === loc.href.split('#')[0] // internal jump
      || base[0] !== '#' && getPathFromRoot(el.href).indexOf(base) !== 0 // outside of base
      || base[0] === '#' && el.href.split(base)[0] !== loc.href.split(base)[0] // outside of #base
      || !go(getPathFromBase(el.href), el.title || doc.title) // route not found
    )) return

  e.preventDefault()
}

/**
 * Go to the path
 * @param {string} path - destination path
 * @param {string} title - page title
 * @param {boolean} shouldReplace - use replaceState or pushState
 * @returns {boolean} - route not found flag
 */
function go(path, title, shouldReplace) {
  // Server-side usage: directly execute handlers for the path
  if (!hist) return central[TRIGGER]('emit', getPathFromBase(path))

  path = route._.base + normalize(path)
  title = title || doc.title
  // browsers ignores the second parameter `title`
  shouldReplace
    ? hist.replaceState(null, title, path)
    : hist.pushState(null, title, path)
  // so we need to set it manually
  doc.title = title
  route._.wasFound = false
  emit()
  return route._.wasFound
}

/**
 * Go to path or set action
 * a single string:                go there
 * two strings:                    go there with setting a title
 * two strings and boolean:        replace history with setting a title
 * a single function:              set an action on the default route
 * a string/RegExp and a function: set an action on the route
 * @param {(string|Function)} first - path / action / filter
 * @param {(string|RegExp|Function)} second - title / action
 * @param {boolean} third - replace flag
 * @returns {undefined}
 */
prot.m = function(first, second, third) {
  if (isString(first) && (!second || isString(second))) go(first, second, third || false)
  else if (second) this.r(first, second)
  else this.r('@', first)
}

// Stop routing
prot.s = function() {
  this.off('*')
  this.$ = []
}

/**
 * Emit
 * @param {string} path - path
 * @returns {undefined}
 */
prot.e = function(path) {
  this.$.concat('@').some(function(filter) {
    const args = (filter === '@' ? route._.defaultParser : route._.secondParser)(normalize(path), normalize(filter))
    if (typeof args != 'undefined') {
      this[TRIGGER].apply(null, [filter].concat(args))
      return route._.wasFound = true // exit from loop
    }
  }, this)
}

/**
 * Register route
 * @param {string} filter - filter for matching to url
 * @param {Function} action - action to register
 * @returns {undefined}
 */
prot.r = function(filter, action) {
  if (filter !== '@') {
    filter = `/${normalize(filter)}`
    this.$.push(filter)
  }

  this.on(filter, action)
}

const mainRouter = new Router()
const route = mainRouter.m.bind(mainRouter)

// adding base and getPathFromBase to route so we can access them in route.tag's script
route._ = {
  base: null,
  getPathFromBase,
  emitStack: [],
  emitStackLevel: 0,
  debouncedEmit: null,
  current: null,
  defaultParser: DEFAULT_PARSER,
  secondParser: null,
  wasFound: false,
  hasStarted: false
}

/**
 * Create a sub router
 * @returns {Function} the method of a new Router object
 */
route.create = function() {
  const newSubRouter = new Router()
  // assign sub-router's main method
  const router = newSubRouter.m.bind(newSubRouter)
  // stop only this sub-router
  router.stop = newSubRouter.s.bind(newSubRouter)
  return router
}

/**
 * Set the base of url
 * @param {(str|RegExp)} arg - a new base or '#' or '#!'
 * @returns {undefined}
 */
route.base = function(arg) {
  route._.base = arg || '#'
  route._.current = getPathFromBase() // recalculate current path
}

// Exec routing right now
route.exec = function() {
  emit(true)
}

/**
 * Replace the default router to yours
 * @param {Function} fn - your parser function
 * @param {Function} fn2 - your secondParser function
 * @returns {undefined}
 */
route.parser = function(fn, fn2) {
  if (!fn && !fn2) {
    // reset parser for testing...
    route._.defaultParser = DEFAULT_PARSER
    route._.secondParser = DEFAULT_SECOND_PARSER
  }
  if (fn) route._.defaultParser = fn
  if (fn2) route._.secondParser = fn2
}

/**
 * Helper function to get url query as an object
 * @returns {Object} parsed query
 */
route.query = function() {
  const q = {}
  const href = loc.href || route._.current
  href.replace(/[?&](.+?)=([^&]*)/g, function(_, k, v) { q[k] = v })
  return q
}

// Stop routing
route.stop = function() {
  if (route._.hasStarted) {
    if (win) {
      win[REMOVE_EVENT_LISTENER](POPSTATE, route._.debouncedEmit)
      win[REMOVE_EVENT_LISTENER](HASHCHANGE, route._.debouncedEmit)
      doc[REMOVE_EVENT_LISTENER](clickEvent, click)
    }

    central[TRIGGER]('stop')
    route._.hasStarted = false
  }
}

/**
 * Start routing
 * @param {boolean} autoExec - automatically exec after starting if true
 * @returns {undefined}
 */
route.start = function(autoExec) {
  if (!route._.hasStarted) {
    if (win) {
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        start(autoExec)
      } else {
        document.onreadystatechange = function() {
          if (document.readyState === 'interactive') {
            // the timeout is needed to solve
            // a weird safari bug https://github.com/riot/route/issues/33
            setTimeout(function() { start(autoExec) }, 1)
          }
        }
      }
    }

    route._.hasStarted = true
  }
}

/** Prepare the router **/
route.base()
route.parser()

export default route
