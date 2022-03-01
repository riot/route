import {fireEvent, sleep} from './util'
import {initDomListeners, route, setBase} from '../src'
import $ from 'bianco.query'
import {expect} from 'chai'
import {spy} from 'sinon'

describe('misc DOM-related', function() {
  let teardown // eslint-disable-line

  beforeEach(() => {
    setBase('/')

    document.body.innerHTML = `
    <nav>
      <a id="a1" href="/hello#anchor">Hello</a>
    </nav>
  `
    teardown = initDomListeners($('nav')[0])
  })

  afterEach(() => {
    document.body.innerHTML = ''
    window.history.replaceState(null, '', '/')
    teardown()
  })

  it('url with fragments are supported', async function() {
    const onRoute = spy()
    const hello = route('/hello(/?[?#].*)?').on.value(onRoute)

    const [a] = $('#a1')

    fireEvent(a, 'click')

    await sleep()

    expect(onRoute).to.have.been.called
    expect(window.location.pathname).to.be.equal('/hello')
    expect(window.location.hash).to.be.equal('#anchor')

    hello.end()
  })
})
