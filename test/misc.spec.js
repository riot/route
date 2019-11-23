import {base, sleep} from './util'
import {getCurrentRoute, router, setBase} from '../src'
import {expect} from 'chai'

describe('misc methods', function() {
  beforeEach(() => {
    setBase(`${base}#`)
  })

  it('getCurrentRoute returns properly the current router value', async function() {
    router.push(`${base}#/hello`)

    await sleep()

    expect(getCurrentRoute()).to.be.equal(`${base}#/hello`)
  })
})