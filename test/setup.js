import {base} from './util'
import jsdomGlobal from 'jsdom-global'
import sinonChai from 'sinon-chai'
import {use} from 'chai'

jsdomGlobal(null, {
  url: base
})

use(sinonChai)