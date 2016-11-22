var route  = require('../../')
var expect = require('expect.js')

describe('Server-side specs', function() {

  it('does not crash when included on server', function() {
    expect(1).to.be.ok()
  })

  it('can go to routes on server', function() {
    var counter = 0

    route.base('/')
    route('/fruit', function() {
      counter++
    })
    route('/fruit/apples', function() {
      counter++
    })

    route('/veg')
    route('/fruit')
    route('/fruit/apples')
    expect(counter).to.equal(2)
  })

  describe('Public API can safely be called on server', function() {
    it('can start and stop', function() {
      expect(route.start).to.not.throwException()
      expect(route.start).withArgs(true).to.not.throwException()
      expect(route.stop).to.not.throwException()
    })

    it('can set a base', function() {
      expect(route.base).withArgs('/').to.not.throwException()
    })

    it('can create sub route context', function() {
      expect(route.create).to.not.throwException()
    })


    it('can terminate sub route context', function() {
      var subRoute = route.create()
      expect(subRoute.stop).to.not.throwException()
    })

    it('can define route handlers', function() {
      expect(route).withArgs(function() {}).to.not.throwException()
      expect(route).withArgs('/fruit', function() {}).to.not.throwException()
    })

    it('can call route to', function() {
      expect(route).withArgs('/fruit').to.not.throwException()
      expect(route).withArgs('/fruit', 'Fruit').to.not.throwException()
    })

    it('can call query', function() {
      expect(route.query).to.not.throwException()
    })

    it('can call exec', function() {
      expect(route.exec).to.not.throwException()
    })

    it('can set parsers', function() {
      expect(route.parser).withArgs(function() {}, function() {}).to.not.throwException()
    })
  })
})
