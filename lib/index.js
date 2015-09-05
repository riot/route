/**
 * Simple client-side router
 * @module riot-route
 */

var observable = require('riot-observable')

var RE_ORIGIN = /^.+?\/+[^\/]+/

var win = window, doc = document
var loc = win.history.location || win.location // see html5-history-api
var prot = Router.prototype // to minify more
var clickEvent = doc && doc.ontouchstart ? 'touchstart' : 'click'
var started = false, central = observable(), base, current

/**
 * Router class
 */
function Router() {
  this.routes = []
  observable(this) // make it observable
  central.on('stop', this.stop.bind(this))
  central.on('emit', this.emit.bind(this))
}

/**
 * Default parser. You can replace it via router.parser method.
 * @param {string} path - current path
 * @returns {array} array or object as you like
 */
function parser(normalizedPath) {
  return normalizedPath.split(/[/?#]/)
}

function normalize(path) {
  return path.replace(/^\//, '')
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
  return base[0] == '#'
    ? (href || loc.href).split(base)[1] || ''
    : getPathFromRoot(href).replace(base, '')
}

function emit(force) {
  var path = getPathFromBase()
  if (force || path != current) {
    central.trigger('emit', path)
    current = path
  }
}

function click(e) {
  if (
    e.which != 1 // not left click
    || e.metaKey || e.ctrlKey || e.shiftKey // or meta keys
    || e.defaultPrevented // or default prevented
  ) return

  var el = e.target
  while (el && el.nodeName != 'A') el = el.parentNode
  if (
    !el || el.nodeName != 'A' // not A tag
    || el.hasAttribute('download') // has download attr
    || !el.hasAttribute('href') // has no href attr
    || el.getAttribute('rel') == 'external' // rel is external
    || el.target && el.target != '_self' // another window or frame
    || el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) == -1 // cross origin
  ) return

  if (el.href != loc.href) {
    if (el.href.split('#')[0] == loc.href.split('#')[0]) return // internal jump
    go(getPathFromBase(el.href), el.title || doc.title)
  }
  e.preventDefault()
}

/**
 * Go to the path
 * @param {string} path - destination path
 * @param {string} title - page title
 */
function go(path, title) {
  title = title || doc.title
  // browsers ignores the second parameter `title`
  history.pushState(null, title, base + path)
  // so we need to set it manually
  doc.title = title
  emit()
}

/**
 * Go to path or set action
 * a single string:                go there
 * two strings:                    go there with setting a title
 * a single function:              set an action on the default route
 * a string/RegExp and a function: set an action on the route
 * @param {(string|function)} first - path / action / filter
 * @param {(string|RegExp|function)} second - title / action
 */
prot.main = function(first, second) {
  if (first[0] && (!second || second[0])) go(first, second)
  else if (second) this.register(first, second)
  else this.register('@', first)
}

prot.stop = function() {
  this.off('*')
}

prot.emit = function(path) {
  var key, filter, args
  for (var i = 0; i < this.routes.length; i++) {
    key = this.routes[i][0]
    filter = this.routes[i][1]
    if (filter[0] && path.indexOf(filter) == 0)
      args = parser(normalize(path.slice(filter.length)))
    else if (!(args = path.match(filter)))
      continue
    break
  }
  if (!args) {
    key = '@'
    args = parser(normalize(path))
  }
  this.trigger.apply(null, [key].concat(args))
}

/**
 * Register route
 * @param {(string|RegExp)} filter - filter for matching to url
 * @param {function} action - action to register
 */
prot.register = function(filter, action) {
  var key = filter.source || filter
  if (!this.routes.every(function(r) { return key == '@' || key != r[0] }))
    throw new Error('Registered already!')
  this.routes.push([key, filter, action])
  this.on(key, action)
}

var mainRouter = new Router()
var route = mainRouter.main.bind(mainRouter)

route.create = function() {
  var newSubRouter = new Router()
  return newSubRouter.main.bind(newSubRouter)
}

/**
 * Set the base of url
 * @param {(str|RegExp)} arg - a new base or '#' or '#!'
 */
route.base = function(arg) {
  base = arg || '#'
  current = getPathFromBase() // recalculate current path
}

/** Exec routing right now **/
route.exec = function() {
  emit(true)
}

/**
 * Replace the default router to yours
 * @param {function} fn - your parser function
 */
route.parser = function(fn) {
  parser = fn
}

/**
 * Helper function to get url query as an object
 * @returns {object} parsed query
 */
route.query = function() {
  var q = {}
  loc.href.replace(/[?&](.+?)=([^&]*)/g, function(_, k, v) { q[k] = v })
  return q
}

/** Stop routing **/
route.stop = function () {
  if (started) {
    win.removeEventListener('popstate', emit)
    doc.removeEventListener(clickEvent, click)
    central.trigger('stop')
    started = false
  }
}

/** Start routing **/
route.start = function () {
  if (!started) {
    win.addEventListener('popstate', emit)
    doc.addEventListener(clickEvent, click)
    started = true
  }
}

/** Autostart the router **/
route.base()
route.start()

module.exports = route
