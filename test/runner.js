var isNode = typeof window === 'undefined'

describe('Router Tests', function() {
  if (isNode) {
    global.expect = require('expect.js')
    global.observable = require('riot-observable')
  } else {
    mocha.run()
  }
})
