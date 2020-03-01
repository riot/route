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
      presets: ['@riotjs/babel-preset']
    })
  ]
}