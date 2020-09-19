import {base, sleep} from './util'
import {getCurrentRoute, router, setBase} from '../src'
import {expect} from 'chai'
import {normalizeBase} from '../src/set-base'

describe('misc methods', function() {
  beforeEach(() => {
    setBase(`${base}#`)
  })

  it('getCurrentRoute returns properly the current router value', async function() {
    router.push(`${base}#/hello`)

    await sleep()

    expect(getCurrentRoute()).to.be.equal(`${base}#/hello`)
  })

  it('normalizeBase returns the expected paths', async function() {
    expect(normalizeBase('#')).to.be.equal(`${base}#`)
    expect(normalizeBase('/')).to.be.equal(`${base}`)
    expect(normalizeBase('')).to.be.equal(`${base}`)
    expect(normalizeBase('/hello')).to.be.equal(`${base}/hello`)
    expect(normalizeBase('hello')).to.be.equal(`${base}/hello`)
    expect(normalizeBase('http://google.com')).to.be.equal('http://google.com')
  })
})
