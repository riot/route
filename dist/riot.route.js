;(function(riot) { if (!window) return;

/**
 * Simple client-side router
 * @module riot-route
 */


var EVT = 'hashchange', win = window, loc = win.location, started = false, fns = observable(), current,
  base = '#' // the string which match the first occurrence and divide into the base url and the path we need


function href() {
  return loc.href.replace(/^.+?\/+[^\/]+/, '')
}

/**
 * Get part of current URL which contains the router params
 * @returns {string} hash string
 */
function hash() {
  return href().replace(root(), '')
}

/**
 * Get root path of the app
 * @returns {string} app's root
 */
function root() {
  return (href().split(base)[0] || '') + base
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
 * Replace the default '#' base to yours,
 * @param {string} str - string which separates app's root and router params (first match from left)
 */
route.base = function(str) {
  base = str
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

riot.route = route })(riot)
