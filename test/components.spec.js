import { base, sleep } from './util.js'
import HistoryRouterApp from './components/history-router-app.riot'
import NestedUpdates from './components/nested-updates.riot'
import RecursiveUpdatesBugRouter from './components/recursive-updates-bug-router.riot'
import StaticBasePath from './components/static-base-path.riot'
import { component } from 'riot'
import { expect } from 'chai'
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
})
