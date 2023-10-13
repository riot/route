import { base, sleep } from './util.js'
import { route, router, setBase } from '../src/index.js'
import { expect } from 'chai'
import { spy } from 'sinon'

describe('standalone hash', function () {
  beforeEach(() => {
    setBase('#')
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('hash links dispatch events', async function () {
    const onRoute = spy()
    const hello = route('/hello').on.value(onRoute)

    router.push(`${base}#/hello`)

    await sleep()

    expect(onRoute).to.have.been.called
    hello.end()
  })

  it('hash links receive parameters', (done) => {
    const user = route('/user/:username').on.value((url) => {
      user.end()
      expect(url.params).to.be.deep.equal({ username: 'gianluca' })
      done()
    })

    router.push(`${base}#/user/gianluca`)
  })
})
