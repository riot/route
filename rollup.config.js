import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import riot  from 'rollup-plugin-riot'

export default {
  input: 'src/index.js',
  plugins: [
    resolve({
      jsnext: true
    }),
    commonjs(),
    riot(),
    babel({
      presets: [
        [
          '@babel/env',
          {
            useBuiltIns: 'entry',
            corejs: 3,
            modules: false,
            loose: true,
            targets: {
              'edge': 15
            }
          }
        ]
      ]
    })
  ],
  external: ['riot', '@riotjs/dom-bindings'],
  output: [
    {
      name: 'route',
      file: 'route.js',
      format: 'umd',
      globals: {
        'riot': 'riot',
        '@riotjs/dom-bindings': 'riotDOMBindings'
      }
    },
    {
      file: 'route.esm.js',
      format: 'esm'
    }
  ]
}