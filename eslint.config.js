import { defineConfig } from 'eslint/config'
import riotEslintConfig from 'eslint-config-riot'

export default defineConfig([
  { extends: [riotEslintConfig] },
  {
    rules: {
      'fp/no-rest-parameters': 0,
      'fp/no-mutating-methods': 0,
    },
  },
])
