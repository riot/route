/**
 * Simple client-side router
 * @module riot-route
 */

var EVT = 'hashchange',
  win = window,
  loc = win.location,
  started = false,
  current,
  fns

/**
 * Bootstrap this module: passing dependencies via arguments
 * @param {Object} observable - riot-observable
 * @returns {Object} router object
 */
function bootstrap(observable) {
  fns = observable()
  router.start() // autostart the router
  return router
}

/**
 * Get hash part of current URL
 * @returns {string} hash string
 */
function hash() {
  return loc.href.split('#')[1] || '' // why not loc.hash.splice(1) ?
}

/**
 * Default parser. You can replace it via router.parser method.
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
  }
}

var router = function(arg) {
  // string
  if (arg[0]) {
    loc.hash = arg
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
router.exec = function(fn) {
  fn.apply(null, parser(hash()))
}

/**
 * Replace the default router to yours
 * @param {function} fn - your parser function
 */
router.parser = function(fn) {
  parser = fn
}

/** Stop routing **/
router.stop = function () {
  if (started) {
    if (win.removeEventListener) win.removeEventListener(EVT, emit, false) //@IE8 - the if()
    else win.detachEvent('on' + EVT, emit) //@IE8
    fns.off('*')
    started = false
  }
}

/** Start routing **/
router.start = function () {
  if (!started) {
    if (win.addEventListener) win.addEventListener(EVT, emit, false) //@IE8 - the if()
    else win.attachEvent('on' + EVT, emit) //IE8
    started = true
  }
}
