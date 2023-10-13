import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import riot from 'rollup-plugin-riot'
import { resolve as nodeResolve } from 'node:path'
import virtual from '@rollup/plugin-virtual'

const standaloneExternal = [
  nodeResolve('./src/components/route-hoc.riot'),
  nodeResolve('./src/components/router-hoc.riot'),
]

const defaultOptions = {
  input: 'src/index.js',
  plugins: [resolve(), commonjs(), riot()],
  external: ['riot'],
}

const standalonePlugins = [
  virtual(
    standaloneExternal.reduce(
      (acc, path) => ({ ...acc, [path]: 'export default {}' }),
      {},
    ),
  ),
  ...defaultOptions.plugins,
]

export default [
  {
    ...defaultOptions,
    output: {
      format: 'esm',
      file: 'index.js',
    },
  },
  {
    ...defaultOptions,
    output: {
      format: 'umd',
      name: 'route',
      file: 'index.umd.js',
    },
  },
  {
    ...defaultOptions,
    plugins: standalonePlugins,
    output: {
      format: 'esm',
      file: 'index.standalone.js',
    },
  },
  {
    ...defaultOptions,
    plugins: standalonePlugins,
    output: {
      format: 'umd',
      name: 'route',
      file: 'index.standalone.umd.js',
    },
  },
]
