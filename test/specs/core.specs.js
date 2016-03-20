function fireEvent(node, eventName) {
  var event = document.createEvent('MouseEvents')
  // https://developer.mozilla.org/en-US/docs/Web/API/event.initMouseEvent
  event.initEvent(
    eventName, true, true, this, 0,
    event.screenX, event.screenY, event.clientX, event.clientY,
    false, false, false, false,
    0, null
  )
  event.button = 1
  event.which = null
  node.dispatchEvent(event)
}

/**
 * Simple serial runner with intervals
 * @param { array } tasks - functions
 * @param { number } interval - msec
 */
function serial(tasks, interval) {
  function runner() {
    var task
    if (task = tasks.shift()) task()
    if (tasks.length) setTimeout(runner, interval)
  }
  runner()
}

describe('Core specs', function() {

  var counter = 0, $, $$

  before(function() {
    $ = document.querySelector.bind(document)
    $$ = document.querySelectorAll.bind(document)
    html = document.createElement('div')
    html.innerHTML =
      '<a class="tag-a" href="#">A</a>' +
      '<a class="tag-b" href="#fruit">B</a>' +
      '<a class="tag-c" href="#fruit/apple">C</a>' +
      '<a class="tag-d" href="#fruit/orange">D</a>' +
      '<a class="tag-e" href="#search?keyword=test&limit=30">E</a>' +
      '<a class="tag-f" href="/">F</a>' +
      '<a class="tag-g" href="/fruit">G</a>' +
      '<a class="tag-h" href="/fruit/apple">H</a>' +
      '<a class="tag-h2" href="/fruit/red-apple">H2</a>' +
      '<a class="tag-i" href="/fruit/orange">I</a>' +
      '<a class="tag-j" href="/search?keyword=test&limit=30">J</a>' +
      '<a class="tag-k prevented" href="mailto:aaaaa@bbbbbbb.com">K</a>' +
      '<a class="tag-l prevented" href="http://somewhereelse.io/">L</a>' +
      '<a class="tag-m prevented" href="/download/" download>M</a>' +
      '<a class="tag-n" href="/other/" target="_self">N</a>' +
      '<a class="tag-o" href="/other/" target="_blank">O</a>' +
      '<a class="tag-p prevented" href="/no-go/">no go</a>' +
      '<p class="tag-z">O</p>'
    document.body.appendChild(html)

    // fix the page reload issue
    Array.prototype.slice.call($$('.prevented')).forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault()
      })
    })
    // start router
    route.start()
  })

  after(function() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  })

  afterEach(function() {
    counter = 0
    route.stop() // detouch all routings
    route.base() // reset base
    route.parser() // reset parser
    route.start() // start router again
  })

  it('autostart triggers the route only once', function() {
    route.stop()
    route(function() {
      counter++
    })
    route.start(true)
    expect(counter).to.be(1)
  })

  it('detects the params', function() {
    route(function(first, second) {
      counter++
      expect(first).to.be('mummypowder')
      expect(['logo-and-key', 'http%3A%2F%2Fxxx.yyy']).to.contain(second)
    })
    route('mummypowder/logo-and-key')
    route('mummypowder/http%3A%2F%2Fxxx.yyy')
    expect(counter).to.be(2)
  })

  it('detects link clicked', function(done) {
    route(function(first, second) {
      counter++
      expect(first).to.be('fruit')
      expect(['apple', 'orange']).to.contain(second)
    })
    serial([
      function() { fireEvent($('.tag-c'), 'click') },
      function() { fireEvent($('.tag-d'), 'click') },
      function() { expect(counter).to.be(2) },
      done
    ], 10)
  })

  it('ignore link clicked in some cases', function(done) {
    route(function() {
      counter++
    })

    serial([
      function() { fireEvent($('.tag-z'), 'click') },
      function() { expect(counter).to.be(0) },
      function() { fireEvent($('.tag-n'), 'click') },
      function() { expect(counter).to.be(1) },
      function() { fireEvent($('.tag-k'), 'click') },
      function() { fireEvent($('.tag-l'), 'click') },
      function() { fireEvent($('.tag-m'), 'click') },
      function() { fireEvent($('.tag-o'), 'click') },
      function() { expect(counter).to.be(1) },
      done
    ], 10)

  })

  it('sets hashbang to base', function() {
    route.base('#!')
    route(function(first, second) {
      counter++
      expect(first).to.be('fruit')
      expect(['apple', 'orange']).to.contain(second)
    })
    route('fruit/apple')
    route('fruit/orange')
    expect(counter).to.be(2)
  })

  it('sets / to base', function() {
    route.base('/')
    route(function(first, second) {
      counter++
      expect(first).to.be('fruit')
      expect(['apple', 'orange']).to.contain(second)
    })
    route('fruit/apple')
    route('fruit/orange')
    fireEvent($('.tag-h'), 'click')
    fireEvent($('.tag-i'), 'click')
    expect(counter).to.be(4)
  })

  it('sets /fruit to base', function() {
    route.base('/fruit')
    route(function(first) {
      counter++
      expect(['apple', 'orange']).to.contain(first)
    })
    route('apple')
    route('orange')
    fireEvent($('.tag-h'), 'click')
    fireEvent($('.tag-i'), 'click')
    expect(counter).to.be(4)
  })

  it('sets routing and filter', function() {
    route.base('/')
    route('fruit', function(first) {
      counter++
      expect(first).to.be(undefined)
    })
    route('fruit')
    route('fruit/apple')
    fireEvent($('.tag-g'), 'click')
    fireEvent($('.tag-h'), 'click')
    expect(counter).to.be(2)
  })

  it('sets routing and filter with wildcard(*)', function() {
    route.base('/')
    route('fruit/*', function(first) {
      counter++
      expect(['apple', 'red-apple']).to.contain(first)
    })

    route('fruit')
    route('fruit/apple')
    route('fruit/red-apple') // see issue #20
    fireEvent($('.tag-g'), 'click')
    fireEvent($('.tag-h'), 'click')
    fireEvent($('.tag-h2'), 'click') // see issue #20

    expect(counter).to.be(4)
  })

  it('sets routing and filter without dots(..)', function() {
    route.base('/')
    route('search', function() {
      counter++
    })
    route('fruit')
    route('search?keyword=test&limit=30')
    fireEvent($('.tag-g'), 'click')
    fireEvent($('.tag-j'), 'click')
    expect(counter).to.be(0)
  })

  it('sets routing and filter with dots(..)', function() {
    route.base('/')
    route('search..', function() {
      counter++
    })
    route('fruit')
    route('search?keyword=test&limit=30')
    fireEvent($('.tag-g'), 'click')
    fireEvent($('.tag-j'), 'click')
    expect(counter).to.be(2)
  })

  it('gets query from url', function() {
    route.base('/')
    route('search?keyword=test&limit=30')
    var q = route.query()
    expect(q.keyword).to.be('test')
    expect(q.limit).to.be('30')
  })

  it('jumps to same url', function() {
    route.base('/')
    route('fruit..', function(first) {
      counter++
      expect(first).to.be(undefined)
    })
    route('fruit')
    route('fruit/apple')
    route('fruit/apple')
    fireEvent($('.tag-h'), 'click')
    expect(counter).to.be(2)
  })

  it('exec routing right now', function() {
    route.base('/')
    route(function() {
      counter++
    })
    route.exec()
    expect(counter).to.be(1)
    route.exec()
    expect(counter).to.be(2)
  })

  it('start with autoExec option', function() {
    route.stop()
    route.base('/')
    route(function() {
      counter++
    })
    var autoExec = true
    route.start(autoExec)
    expect(counter).to.be(1)
  })

  it('sets routings in weird order', function() {
    route.base('/')
    route(function() {
      counter++
    })
    route('fruit/*', function() {
      counter += 10
    })
    route('fruit/apple', function() {
      counter += 100
    })
    route('fruit/*', function() {
      counter += 1000
    })
    route('other')
    route('fruit/apple')
    expect(counter).to.be(1011)
  })

  it('sets sub routings', function() {
    route.base('/')
    route(function() {
      counter++
    })
    var route1 = route.create()
    route1('fruit/*', function() {
      counter += 10
    })
    var route2 = route.create()
    route2('fruit/apple', function() {
      counter += 100
    })
    route2('fruit/*', function() {
      counter += 1000
    })
    route('other')
    route('fruit/apple')
    expect(counter).to.be(112)
  })

  it('custom parser', function() {
    route.parser(function(path) {
      var raw = path.slice(2).split('?'),
        uri = raw[0].split('/'),
        qs = raw[1],
        params = {}
      if (qs)
        qs.split('&').forEach(function(v) {
          var c = v.split('=')
          params[c[0]] = c[1]
        })
      uri.push(params)
      return uri
    })
    route(function(first, second, params) {
      counter++
      expect(first).to.be('user')
      expect(second).to.be('activation')
      expect(JSON.stringify(params)).to.be(JSON.stringify({ token: 'xyz' }))
    })
    route('!/user/activation?token=xyz')
    expect(counter).to.be(1)
  })

  it('custom parser2', function() {
    route.parser(function(path) {
      return path
    })
    route(function(first) {
      counter++
    })
    route('test')
    route('/')
    expect(counter).to.be(2)
  })

  it('custom second parser', function() {
    route.base('/')
    route.parser(null, function(path, filter) {
      return path.match(new RegExp(filter))
    })
    route('^fruit/([^/]+)$', function(_, second) {
      counter++
      expect(['apple', 'orange']).to.contain(second)
    })
    route('fruit/apple')
    route('fruit/orange')
    fireEvent($('.tag-h'), 'click')
    fireEvent($('.tag-i'), 'click')
    expect(counter).to.be(4)
  })

  it('metakeys events get skipped', function() {

    route(function() {
      counter++
    })

    // Emulate the metaKey event
    // initMouseEvent is deprecated but it's useful for our test
    var
      evt = document.createEvent('MouseEvents'),
      e = {
        bubbles: true,
        cancelable: true,
        view: window,
        detail: 0,
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        ctrlKey: true,
        altKey: true,
        shiftKey: false,
        metaKey: true,
        button: 0,
        relatedTarget: undefined
      },
      el = $('.tag-p')

    evt.initMouseEvent('click',
      e.bubbles, e.cancelable, e.view, e.detail,
      e.screenX, e.screenY, e.clientX, e.clientY,
      e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
      e.button, document.body.parentNode)

    el.addEventListener('click', function(e) {
      e.preventDefault()
    })

    el.dispatchEvent(evt)
    expect(counter).to.be(0)

  })

  it('go to the root (/)', function() {
    route.base('/')
    route(function() {
      counter++
    })
    route('/')
    expect(counter).to.be(1)
  })

  it('sets routing for root', function() {
    route.base('/')
    route('', function() {
      counter++
    })
    route('other')
    route('/')
    route('other')
    route('')
    expect(counter).to.be(2)
  })

  it('redirecting inside the router', function() {
    var str
    route.base('/')
    route(function(first) {
      counter++
      if (first == 'fruit') route('/vegitable')
    })
    route('fruit')
    expect(window.location.pathname).to.be('/vegitable')
    expect(counter).to.be(2)
  })

  it('too many redirection', function() {
    var str
    route.base('/')
    route(function(first) {
      counter++
      if (first == 'one') route('/two')
      if (first == 'two') route('/three')
      if (first == 'three') route('/four')
      if (first == 'four') route('/five')
    })
    route('one')
    expect(window.location.pathname).to.be('/four')
    expect(counter).to.be(3)
  })

  /* history.back() doesn't work with PhantomJS
  it('push and replace', function() {
    route.base('/')
    route(function() {
      counter++
    })
    route('one', 'One')
    route('two', 'Two')
    history.back()
    expect(window.location.pathname).to.be('/one')
    route('three', 'Three')
    route('four', 'Four')
    route('five', 'Five', true)
    history.back()
    expect(window.location.pathname).to.be('/three')
    expect(counter).to.be(5)
  })
  */

})
