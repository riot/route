import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  plugins: [
    resolve({
      jsnext: true
    }),
    commonjs()
  ],
  output: [
    {
      name: 'route',
      file: 'route.js',
      format: 'umd'
    },
    {
      file: 'route.esm.js',
      format: 'esm'
    }
  ]
}