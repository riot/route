import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import riot from 'rollup-plugin-riot'
import path from 'path'

const defaultOptions = {
  input: 'src/index.js',
  plugins: [
    resolve({
      jsnext: true
    }),
    commonjs(),
    riot(),
    babel({
      presets: ['@riotjs/babel-preset']
    })
  ],
  external: ['riot']
}

export default [
  {
    ...defaultOptions,
    output: {
      format: 'esm',
      file: 'route.esm.js'
    }
  }, {
    ...defaultOptions,
    output: {
      format: 'umd',
      name: 'route',
      file: 'route.js'
    }
  }, {
    ...defaultOptions,
    external: [
      path.resolve(__dirname, 'src/components/route-hoc.riot'),
      path.resolve(__dirname, 'src/components/router-hoc.riot')
    ],
    output: {
      format: 'umd',
      name: 'route',
      file: 'route.standalone.js'
    }
  }
]
