;(function(window) {
var EVT = 'hashchange',
  win = window,
  loc = win.location,
  started = false,
  current,
  fns

// Pass dependencies via arguments
function bootstrap(observable) {
  fns = observable()
  router.start() // autostart the router
  return router
}

function hash() {
  return loc.href.split('#')[1] || '' // why not loc.hash.splice(1) ?
}

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

router.exec = function(fn) {
  fn.apply(null, parser(hash()))
}

router.parser = function(fn) {
  parser = fn
}

router.stop = function () {
  if (started) {
    if (win.removeEventListener) win.removeEventListener(EVT, emit, false) //@IE8 - the if()
    else win.detachEvent('on' + EVT, emit) //@IE8
    fns.off('*')
    started = false
  }
}

router.start = function () {
  if (!started) {
    if (win.addEventListener) win.addEventListener(EVT, emit, false) //@IE8 - the if()
    else win.attachEvent('on' + EVT, emit) //IE8
    started = true
  }
}
  /* istanbul ignore next */
  // support CommonJS, AMD & browser
  if (typeof exports === 'object')
    module.exports = bootstrap(require('riot-observable'))
  else if (typeof define === 'function' && define.amd)
    define(function(require) {
      return bootstrap(require('riot-observable'))
    })
  else if (window.observable)
    window.router = bootstrap(observable)
  else
    throw new Error('riot-observable is required')

})(typeof window != 'undefined' ? window : undefined);
