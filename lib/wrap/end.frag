  /* istanbul ignore next */
  // support CommonJS, AMD & browser
  if (typeof define === 'function' && define.amd)
    define(function(require) {
      return bootstrap(require('riot-observable'))
    })
  // case 1: exports is null
  // case 2: exports is an ID (global pollution)
  else if (typeof exports === 'object' && !!exports && !exports.nodeType)
    module.exports = bootstrap(require('riot-observable'))
  else if (window.observable)
    window.router = bootstrap(observable)
  else
    throw new Error('riot-observable is required')

})(typeof window != 'undefined' ? window : undefined);
