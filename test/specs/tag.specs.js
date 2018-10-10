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

  it('mounts nested-routes tag and tests nested routes by loading them one by one', function() {
    riot.mount('app', 'nested-routes')

    route('child/child-route1')
    // using setTimeout because active route do not get mounted immediately in this fix
    setTimeout(()=> {
      expect(document.querySelector('route[path=\'child/child-route1\'] p').textContent)
        .to.be('Child route 1')
    }, 0)

    route('child/child-route2')
    // using setTimeout because active route do not get mounted immediately in this fix
    setTimeout(()=> {
      expect(document.querySelector('route[path=\'child/child-route2\'] p').textContent)
        .to.be('Child route 2')
    }, 0)
  })

})
