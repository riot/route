const
  rollup = require('rollup'),
  buble = require('rollup-plugin-buble'),
  alias = require('rollup-plugin-alias'),
  riot = require('rollup-plugin-riot')

rollup
  .rollup({
    entry: 'src/index.js',
    plugins: [
      alias({ 'riot-observable': 'node_modules/riot-observable/dist/es6.observable.js' }),
      buble()
    ]
  })
  .then(bundle => {
    bundle.write({ format: 'iife', moduleName: 'route', dest: 'dist/route.js' })
    bundle.write({ format: 'amd', dest: 'dist/amd.route.js' })
  })
  .catch(error => {
    console.error(error)
  })

rollup
  .rollup({
    entry: 'src/index.js',
    external: ['riot-observable'],
    plugins: [buble()]
  })
  .then(bundle => {
    bundle.write({ format: 'es', dest: 'lib/index.js' })
    bundle.write({ format: 'cjs', dest: 'index.js' })
  })
  .catch(error => {
    console.error(error)
  })

rollup
  .rollup({
    entry: 'src/tag.js',
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
      moduleName: 'route',
      globals: { riot: 'riot' },
      dest: 'dist/route+tag.js'
    })
    bundle.write({ format: 'amd', dest: 'dist/amd.route+tag.js' })
  })
  .catch(error => {
    console.error(error)
  })

rollup
  .rollup({
    entry: 'src/tag.js',
    external: ['riot', 'riot-observable', 'riot-route'],
    plugins: [riot(), buble()]
  })
  .then(bundle => {
    bundle.write({ format: 'es', dest: 'lib/tag.js' })
    bundle.write({ format: 'cjs', dest: 'tag.js' })
  })
  .catch(error => {
    console.error(error)
  })
