;(function() {
  /** Browser global settings **/
  var EXPORT_TO = 'route', MOD_MAP = { 'riot-observable': 'observable' }

  /* istanbul ignore next */
  var d = (typeof define === 'function' && define.amd) ? define : (function(f) {
    var c = typeof exports === 'object' && !exports.nodeType,
      r = c ? require : function(name) { return window[MOD_MAP[name] || name] },
      m = c ? module : { _g: true }
    f(r, 0, m)
  })
  d(function(require, exports, module) {
