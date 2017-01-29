/* global riot */

describe('Tag specs', function() {

  before(function() {
    route.stop()
    // create mounting points
    var html = document.createElement('app')
    document.body.appendChild(html)
  })

  after(function() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  })

  afterEach(function() {
    route.stop() // detouch all routings
    route.base() // reset base
    route.parser() // reset parser
  })

  it('mounts no-param tag', function() {
    riot.mount('app', 'no-param')
    route('apple')
    expect(document.querySelector('router p').textContent)
      .to.be('Apple')
  })

  it('mounts param tag', function() {
    riot.mount('app', 'param')
    route('abc')
    expect(document.querySelector('router p').textContent)
      .to.be('abc')
  })
})
