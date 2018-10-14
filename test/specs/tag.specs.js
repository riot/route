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

  it('mounts nested-routes tag and tests nested routes by loading them one by one', function(done) {
    riot.mount('app', 'nested-routes')

    const deferredTest = (pathString, expectationString) => {
      return new Promise(resolve => {
        // using setTimeout because active route do not get mounted immediately in this fix
        setTimeout(()=> {
          expect(document.querySelector(`route[path='${pathString}'] p`).textContent)
            .to.be(expectationString)
          resolve()
        }, 0)
      })
    }

    route('child/child-route1')

    deferredTest('child/child-route1', 'Child route 1').then(() => {
      route('child/child-route2')

      return deferredTest('child/child-route2', 'Child route 2')
    }).then(() => done())
  })
})
