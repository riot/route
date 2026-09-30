import { base } from './util.js'
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import jsdomGlobal from 'jsdom-global'
import sinonChai from 'sinon-chai'
import { use } from 'chai'

register('@riotjs/register', pathToFileURL('./'))

jsdomGlobal(null, {
  url: base,
})

// jsdom doesn't implement window.scrollTo
window.scrollTo = () => {}

use(sinonChai)
