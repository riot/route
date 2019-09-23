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
    riot()
  ],
  external: ['riot'],
  output: [
    {
      name: 'route',
      file: 'route.js',
      format: 'umd',
      globals: {
        'riot': 'riot'
      }
    },
    {
      file: 'route.esm.js',
      format: 'esm'
    }
  ]
}