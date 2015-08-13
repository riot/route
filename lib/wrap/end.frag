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
