import { base, sleep } from './util.js'
import HistoryRouterApp from './components/history-router-app.riot'
import SpreadPropsRouter from './components/spred-props-router.riot'
import NestedUpdates from './components/nested-updates.riot'
import RecursiveUpdatesBugRouter from './components/recursive-updates-bug-router.riot'
import StaticBasePath from './components/static-base-path.riot'
import SameRouteMatches from './components/same-route-matches.riot'
import ComputedRoutes from './components/computed-routes.riot'
import HashRoute from './components/hash-route.riot'
import { component } from 'riot'
import { expect } from 'chai'
import { createSandbox, spy } from 'sinon'
import { router, defaults } from '../src/index.js'

describe('components', function () {
  beforeEach(async function () {
    router.push('/')
  })

  it('The router contents get properly rendered', async function () {
    const el = document.createElement('div')

    const comp = component(HistoryRouterApp)(el, {
      base,
    })

    await sleep()

    expect(comp.$('p')).to.be.ok
    expect(comp.isRouterStarted).to.be.ok
    expect(comp.currentRoute).to.be.ok

    router.push('/goodbye/gianluca')

    await sleep()

    expect(comp.$('user p').innerHTML).to.be.equal('gianluca')
    expect(comp.$('h1').innerHTML).to.be.equal('Title')

    comp.unmount()
  })

  it('The Router component accepts spread props', async function () {
    const el = document.createElement('div')

    const comp = component(SpreadPropsRouter)(el, {
      base,
    })

    await sleep()

    expect(comp.$('p')).to.be.ok
    expect(comp.isRouterStarted).to.be.ok
    expect(comp.currentRoute).to.be.ok

    router.push('/goodbye/gianluca')

    await sleep()

    expect(comp.$('user p').innerHTML).to.be.equal('gianluca')
    expect(comp.$('h1').innerHTML).to.be.equal('Title')

    comp.unmount()
  })

  it('The Route Context gets properly updated', async function () {
    const el = document.createElement('div')

    const comp = component(NestedUpdates)(el, {
      base,
    })

    await sleep()

    expect(comp.$('p')).to.be.ok

    await sleep()

    expect(comp.$('user p').innerHTML).to.be.equal('goodbye')

    comp.unmount()
  })

  it('Recursive onMounted callbacks (bug 148) ', async function () {
    const el = document.createElement('div')

    const comp = component(RecursiveUpdatesBugRouter)(el, {
      base,
    })

    await sleep()

    expect(comp.$('p').innerHTML).to.be.equal('hello')

    await sleep()

    router.push('/')

    await sleep()

    expect(comp.$('p').innerHTML).to.be.equal('hello')

    comp.unmount()
  })

  it('Static base path attributes are supported (bug 172) ', async function () {
    const el = document.createElement('div')
    const comp = component(StaticBasePath)(el)

    expect(defaults.base).to.be.equal('https://riot.rocks/app')

    comp.unmount()
  })

  it('Routes matched multiple times do not render twice (bug 173) ', async function () {
    const el = document.createElement('div')
    const comp = component(SameRouteMatches)(el)

    expect(comp.$$('p')).to.have.length(1)

    router.push('/foo')

    await sleep()

    expect(comp.$$('p')).to.have.length(1)

    router.push('/')

    await sleep()

    expect(comp.$$('p')).to.have.length(1)

    comp.unmount()
  })

  it('Computed routes get properly rendered', async function () {
    const el = document.createElement('div')
    const comp = component(ComputedRoutes)(el)

    expect(comp.$('p')).to.be.not.ok

    router.push('/home')

    await sleep()

    expect(comp.$('p')).to.be.ok

    await sleep()

    router.push('/')

    await sleep()

    expect(comp.$('p')).to.be.not.ok

    comp.unmount()
  })

  it('Route fragments scroll to their target element', async function () {
    const el = document.createElement('div')
    // the fragment is looked up in the whole document
    document.body.appendChild(el)
    const comp = component(HashRoute)(el)
    // jsdom doesn't implement Element.prototype.scrollIntoView
    const scrollIntoView = (Element.prototype.scrollIntoView = spy())

    router.push('/hash#anchor')

    await sleep()

    expect(scrollIntoView).to.have.been.called
    expect(scrollIntoView.firstCall.thisValue).to.be.equal(comp.$('#anchor'))

    comp.unmount()
    el.remove()
    window.history.replaceState(null, '', '/')
  })

  it('Route fragments matching no element are ignored', async function () {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const comp = component(HashRoute)(el)
    const rejections = []
    const onRejection = (reason) => rejections.push(reason)

    Element.prototype.scrollIntoView = spy()
    process.on('unhandledRejection', onRejection)

    router.push('/hash#nothing-matches-this')

    await sleep()

    process.off('unhandledRejection', onRejection)

    expect(rejections).to.have.length(0)

    comp.unmount()
    el.remove()
    window.history.replaceState(null, '', '/')
  })

  describe('Route fragments while the document is loading', function () {
    const el = document.createElement('div')
    const fireLoad = () => window.dispatchEvent(new Event('load'))
    const sandbox = createSandbox()
    const scrollIntoView = spy()
    let comp // eslint-disable-line

    beforeEach(function () {
      // jsdom documents are always loaded
      sandbox.stub(document, 'readyState').get(() => 'loading')
      document.body.appendChild(el)
      comp = component(HashRoute)(el)
      scrollIntoView.resetHistory()
      Element.prototype.scrollIntoView = scrollIntoView
    })

    afterEach(function () {
      sandbox.restore()
      comp.unmount()
      el.remove()
      window.history.replaceState(null, '', '/')
    })

    it('retry the scroll once the document is loaded', async function () {
      router.push('/hash#anchor')

      await sleep()

      expect(scrollIntoView).to.have.been.calledOnce

      fireLoad()

      await sleep()

      expect(scrollIntoView).to.have.been.calledTwice
      expect(scrollIntoView.secondCall.thisValue).to.be.equal(comp.$('#anchor'))
    })

    it('do not retry the scroll after a navigation', async function () {
      const removeEventListener = spy(window, 'removeEventListener')

      router.push('/hash#anchor')

      await sleep()

      // same route, so the anchor is still in the DOM
      router.push('/hash')

      await sleep()

      expect(removeEventListener).to.have.been.calledWith('load')
      removeEventListener.restore()
      scrollIntoView.resetHistory()

      fireLoad()

      await sleep()

      expect(scrollIntoView).to.have.not.been.called
    })

    it('retry only the scroll of the latest navigation', async function () {
      router.push('/hash#anchor')

      await sleep()

      router.push('/hash#other')

      await sleep()

      scrollIntoView.resetHistory()

      fireLoad()

      await sleep()

      expect(scrollIntoView).to.have.been.calledOnce
      expect(scrollIntoView.firstCall.thisValue).to.be.equal(comp.$('#other'))
    })
  })
})
