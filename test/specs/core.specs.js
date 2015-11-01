var route  = route  || require('../../lib/index')
var expect = expect || require('expect.js')

var isBrowser = typeof document != 'undefined'
var $  = isBrowser && document.querySelector.bind(document)
var $$ = isBrowser && document.querySelectorAll.bind(document)

var isoHrefs = {
  'tag-g': '/fruit',
  'tag-h': '/fruit/apple',
  'tag-h2': '/fruit/red-apple',
  'tag-i': '/fruit/orange',
  'tag-j': '/search?keyword=test&limit=30'
}

function fireNavigationForTag(tag) {
  if (isBrowser) {
    fireEvent($('.' + tag), 'click')
  } else {
    route.exec(isoHrefs[tag])
  }
}

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

describe('Core specs (' + (isBrowser ? 'browser' : 'server') + ')', function() {

  var counter = 0

  before(function() {
    if (isBrowser) {
      var html = document.createElement('div')
      html.innerHTML =
        '<a class="tag-a" href="#">A</a>' +
        '<a class="tag-b" href="#fruit">B</a>' +
        '<a class="tag-c" href="#fruit/apple">C</a>' +
        '<a class="tag-d" href="#fruit/orange">D</a>' +
        '<a class="tag-e" href="#search?keyword=test&limit=30">E</a>' +
        '<a class="tag-f" href="/">F</a>' +
        '<a class="tag-g" href="' + isoHrefs['tag-g'] + '">G</a>' +
        '<a class="tag-h" href="' + isoHrefs['tag-h'] + '">H</a>' +
        '<a class="tag-h2" href="' + isoHrefs['tag-h2'] + '">H2</a>' +
        '<a class="tag-i" href="' + isoHrefs['tag-i'] + '">I</a>' +
        '<a class="tag-j" href="' + isoHrefs['tag-j'] + '">J</a>' +
        '<a class="tag-k prevented" href="mailto:aaaaa@bbbbbbb.com">K</a>' +
        '<a class="tag-l prevented" href="http://somewhereelse.io/">L</a>' +
        '<a class="tag-m prevented" href="/download/" download>M</a>' +
        '<a class="tag-n" href="/other/" targer="_self">N</a>' +
        '<a class="tag-o" href="/other/" targer="_blank">O</a>' +
        '<a class="tag-p prevented" href="/no-go/">no go</a>' +
        '<p class="tag-z">O</p>'
      document.body.appendChild(html)

      // fix the page reload issue
      Array.prototype.slice.call($$('.prevented')).forEach(function(el) {
        el.addEventListener('click', function(e) {
          e.preventDefault()
        })
      })
    }
    
    // start router
    route.start()
  })

  after(function() {
    if (isBrowser && window.history && window.history.replaceState) {
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
    fireNavigationForTag('tag-h')
    fireNavigationForTag('tag-i')
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
    fireNavigationForTag('tag-h')
    fireNavigationForTag('tag-i')
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
    fireNavigationForTag('tag-g')
    fireNavigationForTag('tag-h')
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
    fireNavigationForTag('tag-g')
    fireNavigationForTag('tag-h')
    fireNavigationForTag('tag-h2') // see issue #20
    expect(counter).to.be(4)
  })

  it('sets routing and filter without dots(..)', function() {
    route.base('/')
    route('search', function() {
      counter++
    })
    route('fruit')
    route('search?keyword=test&limit=30')
    fireNavigationForTag('tag-g')
    fireNavigationForTag('tag-j')
    expect(counter).to.be(0)
  })

  it('sets routing and filter with dots(..)', function() {
    route.base('/')
    route('search..', function() {
      counter++
    })
    route('fruit')
    route('search?keyword=test&limit=30')
    fireNavigationForTag('tag-g')
    fireNavigationForTag('tag-j')
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
    if (isBrowser) { fireEvent($('.tag-k'), 'click') }
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
    fireNavigationForTag('tag-h')
    fireNavigationForTag('tag-i')
    expect(counter).to.be(4)
  })

  describe('Browser link specs', function() {

    if (!isBrowser) { return }

    it('detects link clicked', function() {
      route(function(first, second) {
        counter++
        expect(first).to.be('fruit')
        expect(['apple', 'orange']).to.contain(second)
      })
      fireEvent($('.tag-c'), 'click')
      fireEvent($('.tag-d'), 'click')
      expect(counter).to.be(2)
    })

    it('ignore link clicked in some cases', function() {
      route(function() {
        counter++
      })
      fireEvent($('.tag-z'), 'click')
      expect(counter).to.be(0)
      fireEvent($('.tag-n'), 'click')
      expect(counter).to.be(1)
      expect(counter).to.be(1)

      fireEvent($('.tag-k'), 'click')
      fireEvent($('.tag-l'), 'click')
      fireEvent($('.tag-m'), 'click')
      fireEvent($('.tag-o'), 'click')

      expect(counter).to.be(1)
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

  })

})
