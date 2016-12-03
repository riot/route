const
  rollup = require('rollup'),
  buble = require('rollup-plugin-buble'),
  nodeResolve = require('rollup-plugin-node-resolve')

rollup
  .rollup({
    entry: 'lib/index.js',
    plugins: [nodeResolve({ jsnext: true }), buble()]
  })
  .then(bundle => {
    bundle.write({ format: 'iife', moduleName: 'route', dest: 'dist/route.js'})
    bundle.write({ format: 'amd', dest: 'dist/amd.route.js' })
  })
  .catch(error => {
    console.error(error)
  })

rollup
  .rollup({
    entry: 'lib/index.js',
    external: ['riot-observable'],
    plugins: [buble()]
  })
  .then(bundle => {
    bundle.write({ format: 'cjs', dest: 'dist/cjs.route.js' })
  })
  .catch(error => {
    console.error(error)
  })
