/**
 * Simple client-side router
 * @module riot-route
 */

var observable = require('riot-observable')

var EVT = 'hashchange', win = window, loc = win.location, started = false, fns = observable(), current

/**
 * Get part of current URL which contains the router params
 * @returns {string} hash string
 */
function hash() {
  return loc.href.replace(root(), '')
}

/**
 * Get root path of the router's app
 * @return {string} app root
 */
function root() {
  var matches = base.exec(loc.href)
  return matches ? matches[0] : loc.host
}

/**
 * Default RegExp for separate route params and app root path
 * You can replace it via route.base method
 * @return {RegExp} regular expression
 */
function base() {
  return /^.*#/
}

/**
 * Default parser. You can replace it via route.parser method
 * @param {string} path - current path
 * @returns {*} array or object as you like
 */
function parser(path) {
  return path.split('/')
}

function emit(path) {
  if (path.type) path = hash()

  if (path != current) {
    fns.trigger.apply(null, ['H'].concat(parser(path)))
    current = path
    loc.href = root() + current
  }
}

var route = function(arg) {
  // string
  if (arg[0]) {
    emit(arg)

  // function
  } else {
    fns.on('H', arg)
  }
}

/**
 * Exec routing right now
 * @param {function} fn - your action
 */
route.exec = function(fn) {
  fn.apply(null, parser(hash()))
}

/**
 * Replace the default base to yours
 * @param {RegExp} regular expression
 */
route.base = function(re) {
  base = re
}

/**
 * Replace the default router to yours
 * @param {function} fn - your parser function
 */
route.parser = function(fn) {
  parser = fn
}

/** Stop routing **/
route.stop = function () {
  if (started) {
    win.removeEventListener(EVT, emit, false)
    fns.off('*')
    started = false
  }
}

/** Start routing **/
route.start = function () {
  if (!started) {
    win.addEventListener(EVT, emit, false)
    started = true
  }
}

/** Autostart the router **/
route.start()

module.exports = route
