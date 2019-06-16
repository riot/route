const
  rollup = require('rollup'),
  alias = require('rollup-plugin-alias')

rollup
  .rollup({
    input: 'src/index.js',
    plugins: [
      alias({ '@riotjs/observable': 'node_modules/@riotjs/observable/dist/es6.observable.js' }),
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
    external: ['@riotjs/observable']
  })
  .then(bundle => {
    bundle.write({ format: 'es', file: 'lib/index.js' })
    bundle.write({ format: 'cjs', file: 'index.js' })
  })
  .catch(error => {
    console.error(error)
  })

/*rollup
  .rollup({
    input: 'src/tag.js',
    external: ['riot'],
    plugins: [
      alias({
        '@riotjs/observable': 'node_modules/@riotjs/observable/dist/es6.observable.js',
        '@riotjs/route': 'src/index.js'
      })
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
    external: ['riot', '@riotjs/observable', '@riotjs/route']
  })
  .then(bundle => {
    bundle.write({ format: 'es', file: 'lib/tag.js' })
    bundle.write({ format: 'cjs', file: 'tag.js' })
  })
  .catch(error => {
    console.error(error)
  })*/
