import { base } from './util'
import jsdomGlobal from 'jsdom-global'
import register from '@riotjs/register'
import sinonChai from 'sinon-chai'
import { use } from 'chai'

jsdomGlobal(null, {
  url: base,
})

use(sinonChai)

register()
