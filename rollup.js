const
  rollup = require('rollup'),
  buble = require('rollup-plugin-buble'),
  alias = require('rollup-plugin-alias'),
  riot = require('rollup-plugin-riot')

rollup
  .rollup({
    input: 'src/index.js',
    plugins: [
      alias({ 'riot-observable': 'node_modules/riot-observable/dist/es6.observable.js' }),
      buble()
    ]
  })
  .then(bundle => {
    bundle.write({ format: 'iife', name: 'route', file: 'dist/route.js' })
    bundle.write({ format: 'amd', file: 'dist/amd.route.js' })
  })
  .catch(error => {
    console.error(error)
  })

rollup
  .rollup({
    input: 'src/index.js',
    external: ['riot-observable'],
    plugins: [buble()]
  })
  .then(bundle => {
    bundle.write({ format: 'es', file: 'lib/index.js' })
    bundle.write({ format: 'cjs', file: 'index.js' })
  })
  .catch(error => {
    console.error(error)
  })

rollup
  .rollup({
    input: 'src/tag.js',
    external: ['riot'],
    plugins: [
      riot(),
      alias({
        'riot-observable': 'node_modules/riot-observable/dist/es6.observable.js',
        'riot-route': 'src/index.js'
      }),
      buble()
    ]
  })
  .then(bundle => {
    bundle.write({
      format: 'iife',
      name: 'route',
      globals: { riot: 'riot' },
      file: 'dist/route+tag.js'
    })
    bundle.write({ format: 'amd', file: 'dist/amd.route+tag.js' })
  })
  .catch(error => {
    console.error(error)
  })

rollup
  .rollup({
    input: 'src/tag.js',
    external: ['riot', 'riot-observable', 'riot-route'],
    plugins: [riot(), buble()]
  })
  .then(bundle => {
    bundle.write({ format: 'es', file: 'lib/tag.js' })
    bundle.write({ format: 'cjs', file: 'tag.js' })
  })
  .catch(error => {
    console.error(error)
  })
