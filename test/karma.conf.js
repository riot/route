module.exports = function(config) {

  var browsers,
    customLaunchers = []

  if (process.env.BROWSERSTACK) {
    customLaunchers = require('./browsers')
    browsers = Object.keys(customLaunchers)
    browsers.forEach(function(browser) { customLaunchers[browser].base = 'BrowserStack' })
  } else
    browsers = ['Electron']

  config.set({
    basePath: '',
    frameworks: ['mocha', 'riot'],
    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-coverage',
      'karma-browserstack-launcher',
      'karma-electron',
      'karma-riot'
    ],
    files: [
      '../node_modules/expect.js/index.js',
      '../node_modules/riot/riot.js',
      '../dist/route+tag.js',
      'tags/*.tag',
      'specs/core.specs.js',
      'specs/tag.specs.js'
    ],
    browsers: browsers,
    customLaunchers: customLaunchers,
    reporters: ['mocha', 'coverage'],
    preprocessors: {
      'tags/*.tag': ['riot'],
      '../dist/route-tag.js': ['coverage']
    },
    coverageReporter: {
      dir: '../coverage/',
      reporters: [{
        type: 'lcov',
        subdir: 'report-lcov'
      }]
    },
    singleRun: true
  })
}
